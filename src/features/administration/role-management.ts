import "server-only";
import { requireCapability, AuthorizationError } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { ownerEntryEnabled } from "@/features/owner-dashboard/entry";
import { shortMemberReference } from "./model";
export async function roleWorkspace(permission = "role.view") {
  if (!ownerEntryEnabled()) throw new Error("QA role management unavailable");
  const auth = await requireCapability({
    module: "foundation",
    feature: "foundation.authorization_inspection",
    permission,
  });
  const { supabase, user } = await requireUser();
  const tenant = await loadTenantContext();
  const active = tenant.active;
  if (
    !active?.schoolId ||
    active.organizationId !== auth.organizationId ||
    active.schoolId !== auth.schoolId
  )
    throw new AuthorizationError("invalid_context");
  return { auth, supabase, user, active };
}
export async function loadRoleManagement() {
  const context = await roleWorkspace();
  const { supabase, active } = context;
  const [roles, members, assignments] = await Promise.all([
    supabase
      .from("roles")
      .select("id,key,name,is_system")
      .eq("organization_id", active.organizationId)
      .order("name"),
    supabase
      .from("school_memberships")
      .select("user_id")
      .eq("organization_id", active.organizationId)
      .eq("school_id", active.schoolId!)
      .eq("status", "active")
      .limit(200),
    supabase
      .from("role_assignments")
      .select("id,user_id,role_id,scope,status,effective_from,effective_to")
      .eq("organization_id", active.organizationId)
      .eq("school_id", active.schoolId!)
      .eq("scope", "school")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  if (roles.error || members.error || assignments.error)
    throw new Error("Role information unavailable");
  return {
    schoolName: active.schoolName,
    roles: roles.data ?? [],
    members: (members.data ?? []).map((m) => ({
      id: m.user_id,
      label: shortMemberReference(m.user_id),
    })),
    assignments: assignments.data ?? [],
    canManage: context.auth.permissions.includes("role.manage"),
    userId: context.user.id,
    now: Date.now(),
  };
}
