import { cookies } from "next/headers";
import {
  buildTenantOptions,
  resolveActiveContext,
  type TenantOption,
} from "@/features/tenancy/context";
import { requireUser } from "@/lib/auth";
export async function loadTenantContext() {
  const { supabase, user } = await requireUser();
  const [{ data: memberships }, { data: schools }, store] = await Promise.all([
    supabase
      .from("organization_memberships")
      .select("organization_id, organizations(name), all_schools")
      .eq("user_id", user.id)
      .eq("status", "active"),
    supabase
      .from("schools")
      .select("id, name, organization_id")
      .eq("status", "active"),
    cookies(),
  ]);
  const options: TenantOption[] = buildTenantOptions(
    memberships ?? [],
    schools ?? [],
  );
  const active = resolveActiveContext(
    options,
    store.get("sf-org")?.value,
    store.get("sf-school")?.value,
  );
  return { options, active };
}
