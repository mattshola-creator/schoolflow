import { PageHeader } from "@/components/ui/page-header";
import { PriorityWork } from "@/components/operational-home";
import { loadOperationalHome } from "@/features/home/service";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import { loadTenantContext } from "@/lib/tenant-context";
import { redirect } from "next/navigation";

export default async function MyDayPage() {
  const [{ active }, authorization] = await Promise.all([
    loadTenantContext(),
    loadEffectiveAuthorization(),
  ]);
  if (!active || !authorization) redirect("/dashboard");
  const home = await loadOperationalHome(active, authorization);
  const scope = active.schoolName ?? `${active.organizationName} school group`;
  return (
    <main className="space-y-7 py-3 sm:py-5">
      <PageHeader
        eyebrow="My Day"
        title="Work that needs your attention"
        description={`Authorized tasks, approvals and notices for ${scope}, prioritized in one place.`}
      />
      {!home.canViewWork ? (
        <aside
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          role="status"
        >
          My Day is unavailable for your current role or workspace
          configuration.
        </aside>
      ) : (
        <>
          {home.responsibilities.length ? (
            <p className="text-muted-foreground text-sm">
              Combined responsibilities: {home.responsibilities.join(" · ")}
            </p>
          ) : null}
          <PriorityWork tasks={home.tasks} />
        </>
      )}
    </main>
  );
}
