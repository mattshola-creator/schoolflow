import { moduleNavigation } from "@/features/authorization/catalog";
import { evaluateAccess } from "@/features/authorization/evaluator";
import { describeAccessReason } from "@/features/authorization/navigation";
import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { getAdministrationCapabilities, groupPermissions } from "./model";

const capability = {
  module: "foundation",
  permission: "organization.view",
  feature: "foundation.authorization_inspection",
};

export async function loadAdministrationWorkspace() {
  const [authorization, { supabase }, tenant] = await Promise.all([
    requireCapability(capability),
    requireUser(),
    loadTenantContext(),
  ]);
  const active = tenant.active;
  if (
    !active ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active administration context is invalid");

  const permissions = getAdministrationCapabilities(authorization);
  const schoolScope = active.schoolId;
  const membershipsQuery = schoolScope
    ? supabase
        .from("school_memberships")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", active.organizationId)
        .eq("school_id", schoolScope)
        .eq("status", "active")
    : supabase
        .from("organization_memberships")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", active.organizationId)
        .eq("status", "active");
  const invitationsQuery = supabase
    .from("invitations")
    .select("id,email,status,expires_at,school_id,roles(name)", {
      count: "exact",
    })
    .eq("organization_id", active.organizationId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(8);
  if (schoolScope) invitationsQuery.eq("school_id", schoolScope);

  const assignmentsQuery = supabase
    .from("role_assignments")
    .select(
      "id,user_id,scope,status,school_id,roles(name),schools(name),management_groups(name)",
      { count: "exact" },
    )
    .eq("organization_id", active.organizationId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(12);
  if (schoolScope)
    assignmentsQuery.or(`scope.eq.organization,school_id.eq.${schoolScope}`);

  const [memberships, invitations, assignments, groups] = await Promise.all([
    permissions.viewMembers
      ? membershipsQuery
      : Promise.resolve({ data: [], count: null, error: null }),
    permissions.viewMembers
      ? invitationsQuery
      : Promise.resolve({ data: [], count: null, error: null }),
    permissions.viewRoles
      ? assignmentsQuery
      : Promise.resolve({ data: [], count: null, error: null }),
    supabase
      .from("management_groups")
      .select("id,name,status")
      .eq("organization_id", active.organizationId)
      .eq("status", "active")
      .order("name"),
  ]);
  if (
    [memberships, invitations, assignments, groups].some((item) => item.error)
  )
    throw new Error("Administration information could not be loaded");

  const modules = moduleNavigation
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.label === item.label) ===
        index,
    )
    .map((item) => {
      const decision = evaluateAccess(authorization, item);
      return {
        label: item.label,
        description: item.description,
        available: decision.allowed,
        reason: decision.allowed
          ? "Available in this context"
          : describeAccessReason(decision.reason),
      };
    });

  return {
    active,
    options: tenant.options,
    permissions,
    permissionGroups: groupPermissions(authorization.permissions),
    permissionCount: authorization.permissions.length,
    memberCount: memberships.count,
    invitationCount: invitations.count,
    assignmentCount: assignments.count,
    invitations: invitations.data ?? [],
    assignments: assignments.data ?? [],
    groups: groups.data ?? [],
    modules,
  };
}
