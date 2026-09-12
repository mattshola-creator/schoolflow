import { cookies } from "next/headers";
import {
  resolveActiveContext,
  type TenantOption,
} from "@/features/tenancy/context";
import { requireUser } from "@/lib/auth";
export async function loadTenantContext() {
  const { supabase, user } = await requireUser();
  const [{ data: memberships }, { data: schools }, store] = await Promise.all([
    supabase
      .from("organization_memberships")
      .select("organization_id, organizations(name)")
      .eq("user_id", user.id)
      .eq("status", "active"),
    supabase
      .from("schools")
      .select("id, name, organization_id")
      .eq("status", "active"),
    cookies(),
  ]);
  const options: TenantOption[] = (memberships ?? []).flatMap(
    (membership): TenantOption[] => {
      const permittedSchools = (schools ?? []).filter(
        (school) => school.organization_id === membership.organization_id,
      );
      if (!permittedSchools.length)
        return [
          {
            organizationId: membership.organization_id,
            organizationName: membership.organizations?.name ?? "Organization",
            schoolId: null,
            schoolName: null,
          },
        ];
      return permittedSchools.map((school) => ({
        organizationId: membership.organization_id,
        organizationName: membership.organizations?.name ?? "Organization",
        schoolId: school.id,
        schoolName: school.name,
      }));
    },
  );
  const active = resolveActiveContext(
    options,
    store.get("sf-org")?.value,
    store.get("sf-school")?.value,
  );
  return { options, active };
}
