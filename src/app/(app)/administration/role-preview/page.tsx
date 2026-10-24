import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import { shouldOpenOwnerDashboard } from "@/features/owner-dashboard/entry";
import { RoleExplorer } from "@/features/administration/role-explorer";
import "@/features/showroom/visualizations.css";
export default async function RolePreviewPage() {
  const { supabase, user } = await requireUser();
  const tenant = await loadTenantContext();
  const auth = await loadEffectiveAuthorization();
  if (!(await shouldOpenOwnerDashboard(supabase, user.id, tenant.active, auth)))
    notFound();
  return <RoleExplorer />;
}
