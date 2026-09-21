import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import {
  allowedDocumentTypes,
  documentMetadataSchema,
  maxDocumentBytes,
} from "./schemas";

export type DocumentUploadResult =
  { ok: true } | { ok: false; message: string };

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

export async function persistDocumentUpload(
  formData: FormData,
): Promise<DocumentUploadResult> {
  const parsed = documentMetadataSchema.safeParse(Object.fromEntries(formData));
  const file = formData.get("file");
  if (!parsed.success || !(file instanceof File))
    return { ok: false, message: "Choose a valid document and title" };
  if (
    !file.size ||
    file.size > maxDocumentBytes ||
    !allowedDocumentTypes.has(file.type)
  )
    return {
      ok: false,
      message: "Use a PDF, JPEG, PNG or CSV file up to 10 MiB",
    };
  if (Boolean(parsed.data.entityType) !== Boolean(parsed.data.entityId))
    return {
      ok: false,
      message: "A linked record requires both its type and ID",
    };

  const { supabase, active } = await requireSharedContext(
    "shared.documents.manage",
    "foundation.document_storage",
  );
  const documentId = crypto.randomUUID();
  const safeName =
    file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-120) || "document";
  const objectPath = `${active.organizationId}/${active.schoolId}/${documentId}/${safeName}`;
  const metadata = await supabase.from("documents").insert({
    id: documentId,
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    title: parsed.data.title,
    original_filename: file.name.slice(0, 240),
    object_path: objectPath,
    mime_type: file.type,
    size_bytes: file.size,
    entity_type: parsed.data.entityType || null,
    entity_id: parsed.data.entityId ?? null,
  });
  if (metadata.error)
    return { ok: false, message: "Document metadata could not be saved" };

  const uploaded = await supabase.storage
    .from("schoolflow-documents")
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });
  if (uploaded.error)
    return {
      ok: false,
      message: "Upload failed; the pending record remains visible for review",
    };

  const finalized = await supabase
    .from("documents")
    .update({ status: "available" })
    .eq("id", documentId)
    .eq("organization_id", active.organizationId);
  if (finalized.error)
    return {
      ok: false,
      message: "The upload completed but could not be finalized",
    };
  return { ok: true };
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
