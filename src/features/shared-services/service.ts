import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

export async function requireSharedContext(
  permission: string,
  feature = "foundation.shared_services",
) {
  const authorization = await requireCapability({
    permission,
    module: "foundation",
    feature,
  });
  if (!authorization.schoolId) throw new Error("A school context is required");
  const [{ supabase }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !active ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active school context is invalid");
  return { supabase, active, authorization };
}

export async function loadActionCenter() {
  const context = await requireSharedContext(
    "shared.tasks.view",
    "foundation.action_center",
  );
  const [tasks, requests, policies, roles, notifications] = await Promise.all([
    context.supabase
      .from("action_tasks")
      .select(
        "id,title,description,status,priority,owner_user_id,due_at,created_at",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("created_at", { ascending: false })
      .limit(50),
    context.supabase
      .from("approval_requests")
      .select(
        "id,title,subject_type,status,current_step,created_at,approval_policies(name)",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("created_at", { ascending: false })
      .limit(50),
    context.supabase
      .from("approval_policies")
      .select("id,key,name,is_active")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("name"),
    context.supabase
      .from("roles")
      .select("id,name")
      .eq("organization_id", context.active.organizationId)
      .order("name"),
    context.supabase
      .from("notifications")
      .select("id,kind,title,body,href,read_at,created_at")
      .eq("organization_id", context.active.organizationId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  if (
    [tasks, requests, policies, roles, notifications].some(
      (result) => result.error,
    )
  )
    throw new Error("The Action Center could not be loaded");
  return {
    ...context,
    tasks: tasks.data ?? [],
    requests: requests.data ?? [],
    policies: policies.data ?? [],
    roles: roles.data ?? [],
    notifications: notifications.data ?? [],
  };
}

export async function loadDocuments() {
  const context = await requireSharedContext(
    "shared.documents.view",
    "foundation.document_storage",
  );
  const result = await context.supabase
    .from("documents")
    .select(
      "id,title,original_filename,mime_type,size_bytes,status,object_path,created_at",
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .order("created_at", { ascending: false })
    .limit(50);
  if (result.error) throw new Error("Documents could not be loaded");
  return { ...context, documents: result.data ?? [] };
}

export async function loadAuditEvents() {
  const context = await requireSharedContext("shared.audit.view");
  const result = await context.supabase
    .from("audit_events")
    .select(
      "id,action,entity_type,entity_id,actor_user_id,metadata,occurred_at",
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .order("occurred_at", { ascending: false })
    .limit(100);
  if (result.error) throw new Error("Audit history could not be loaded");
  return { ...context, events: result.data ?? [] };
}
