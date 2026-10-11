import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";

export type AdministrationCapabilities = {
  viewMembers: boolean;
  manageMembers: boolean;
  viewRoles: boolean;
  manageRoles: boolean;
  manageOrganization: boolean;
  manageSchools: boolean;
};

export function getAdministrationCapabilities(
  authorization: AuthorizationSnapshot,
): AdministrationCapabilities {
  const has = (permission: string) =>
    authorization.permissions.includes(permission);
  return {
    viewMembers: has("membership.view"),
    manageMembers: has("membership.manage"),
    viewRoles: has("role.view"),
    manageRoles: has("role.manage"),
    manageOrganization: has("organization.manage"),
    manageSchools: has("school.manage"),
  };
}

export function groupPermissions(permissions: string[]) {
  return Array.from(
    permissions.reduce((groups, permission) => {
      const group = permission.split(/[._]/)[0] || "other";
      groups.set(group, (groups.get(group) ?? 0) + 1);
      return groups;
    }, new Map<string, number>()),
  )
    .map(([key, count]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      count,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function shortMemberReference(value: string) {
  return `Member ${value.slice(0, 8)}`;
}
