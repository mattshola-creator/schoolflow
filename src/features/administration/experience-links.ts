import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import { evaluateAccess } from "@/features/authorization/evaluator";
export function experienceLinks(
  auth: AuthorizationSnapshot | null,
  owner: boolean,
  qa: boolean,
) {
  if (!qa || !auth) return [];
  const allowed = (permission: string) =>
    evaluateAccess(auth, {
      module: "foundation",
      feature: "foundation.authorization_inspection",
      permission,
    }).allowed;
  const links: { href: string; label: string; group: "Administration" }[] = [];
  links.push({
    href: "/workspaces",
    label: "My workspaces & roles",
    group: "Administration",
  });
  if (owner && auth.schoolId && allowed("school.manage"))
    links.push({
      href: "/administration/branding",
      label: "Design Studio",
      group: "Administration",
    });
  if (allowed("role.view"))
    links.push({
      href: "/administration/roles",
      label: "Roles & workspaces",
      group: "Administration",
    });
  if (owner)
    links.push({
      href: "/administration/role-preview",
      label: "QA role explorer",
      group: "Administration",
    });
  return links;
}
