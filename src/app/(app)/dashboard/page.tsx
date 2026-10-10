import {
  OperationalSummary,
  PriorityWork,
} from "@/components/operational-home";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  buildWorkspaceAccess,
  describeAccessReason,
} from "@/features/authorization/navigation";
import { loadPortalContext } from "@/features/communication/service";
import { loadOperationalHome } from "@/features/home/service";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("status", "active");
  if (!memberships?.length) {
    const portalContexts = await loadPortalContext();
    if (portalContexts.length) redirect("/portal");
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <PageHeader
          eyebrow="Account ready"
          title="Create your organization"
          description="Set up the tenant boundary and first school to continue."
        />
        <ButtonLink href="/onboarding" size="large" className="mt-7">
          Start setup
        </ButtonLink>
      </main>
    );
  }
  const [{ active }, authorization] = await Promise.all([
    loadTenantContext(),
    loadEffectiveAuthorization(),
  ]);
  if (!active || !authorization) redirect("/onboarding");
  const workspace = buildWorkspaceAccess(authorization);
  const home = await loadOperationalHome(active, authorization);
  const scopeLabel =
    active.schoolName ?? `${active.organizationName} school group`;

  return (
    <main className="space-y-8 py-3 sm:py-5">
      <PageHeader
        eyebrow={
          active.schoolName ? "School operations" : "Organization operations"
        }
        title={
          active.schoolName
            ? `${active.schoolName} overview`
            : "Your school group today"
        }
        description={`A responsibility-aware view of authorized work across ${scopeLabel}.`}
      />
      {home.responsibilities.length ? (
        <p className="text-muted-foreground -mt-5 text-sm">
          Your work areas: {home.responsibilities.join(" · ")}
        </p>
      ) : null}
      <OperationalSummary
        counts={home.counts}
        moduleCount={workspace.available.length}
        scopeLabel={scopeLabel}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
        {home.canViewWork ? (
          <PriorityWork tasks={home.tasks} limit={6} />
        ) : (
          <section className="border-border bg-surface rounded-2xl border p-6">
            <h2 className="font-semibold text-slate-950">
              Operational work is role-controlled
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Your current role does not include Action Center work. Available
              modules remain listed alongside.
            </p>
          </section>
        )}
        <section
          className="border-border bg-surface rounded-2xl border p-5 shadow-sm"
          aria-labelledby="quick-workspaces"
        >
          <h2 id="quick-workspaces" className="font-semibold text-slate-950">
            Your workspaces
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Shortcuts follow the same permission, entitlement and feature checks
            as navigation.
          </p>
          <div className="mt-4 grid gap-2">
            {workspace.available
              .filter((item) => item.href !== "/my-day")
              .slice(0, 7)
              .map((item) => (
                <ButtonLink
                  key={item.href}
                  href={item.href ?? `/capabilities/${item.module}`}
                  variant="quiet"
                  className="justify-between px-3"
                >
                  {item.label}
                  <span aria-hidden="true">→</span>
                </ButtonLink>
              ))}
          </div>
        </section>
      </div>
      {workspace.unavailable.length ? (
        <section aria-labelledby="unavailable-modules">
          <h2
            id="unavailable-modules"
            className="text-lg font-semibold text-slate-950"
          >
            Unavailable in this context
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            These capabilities remain protected by your organization
            configuration.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workspace.unavailable.map((item) => (
              <article
                key={item.href}
                className="rounded-xl border border-amber-200 bg-amber-50 p-4"
              >
                <h3 className="font-semibold text-amber-950">{item.label}</h3>
                <p className="mt-1 text-sm text-amber-900">
                  {describeAccessReason(item.reason)}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
