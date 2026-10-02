import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { moduleNavigation } from "@/features/authorization/catalog";
import { evaluateAccess } from "@/features/authorization/evaluator";
import { describeAccessReason } from "@/features/authorization/navigation";
import { requireCapability } from "@/lib/authorization";
import { loadTenantContext } from "@/lib/tenant-context";

const administrationCapability = {
  module: "foundation",
  permission: "organization.view",
  feature: "foundation.authorization_inspection",
};

export default async function AdministrationPage() {
  const [authorization, { active, options }] = await Promise.all([
    requireCapability(administrationCapability),
    loadTenantContext(),
  ]);

  return (
    <main className="py-12">
      <PageHeader
        eyebrow="Administration"
        title="Organization access and module status"
        description="A read-only pilot control center for the active organization and school. It reflects the same server-authorized permission and entitlement checks used by each module."
      />

      <section className="border-border bg-surface mt-7 rounded-xl border p-5 sm:p-6">
        <h2 className="font-semibold text-slate-950">Active context</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Organization</dt>
            <dd className="mt-1 font-semibold">
              {active?.organizationName ?? "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">School</dt>
            <dd className="mt-1 font-semibold">
              {active?.schoolName ?? "Organization-wide"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Accessible school workspaces</dt>
            <dd className="mt-1 font-semibold">{options.length}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Effective permissions</dt>
            <dd className="mt-1 font-semibold">
              {authorization.permissions.length}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8" aria-labelledby="module-status">
        <h2 id="module-status" className="text-xl font-semibold text-slate-950">
          Module access
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {moduleNavigation
            .filter(
              (item, index, items) =>
                items.findIndex(
                  (candidate) => candidate.label === item.label,
                ) === index,
            )
            .map((item) => {
              const decision = evaluateAccess(authorization, item);
              return (
                <article
                  key={item.label}
                  className="border-border bg-surface rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <StatusBadge
                      tone={decision.allowed ? "success" : "warning"}
                    >
                      {decision.allowed ? "Available" : "Unavailable"}
                    </StatusBadge>
                  </div>
                  {!decision.allowed ? (
                    <p className="mt-3 text-sm text-amber-800">
                      {describeAccessReason(decision.reason)}
                    </p>
                  ) : null}
                </article>
              );
            })}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-slate-100 p-5 text-sm text-slate-700">
        <h2 className="font-semibold text-slate-950">
          Pilot administration boundary
        </h2>
        <p className="mt-2">
          Organization membership, roles, permissions, subscriptions and feature
          activation are enforced in the platform foundation. During the
          controlled pilot, plan and feature changes remain operator-assisted
          rather than directly editable from this page.
        </p>
      </section>
    </main>
  );
}
