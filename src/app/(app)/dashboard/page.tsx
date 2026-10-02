import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadPortalContext } from "@/features/communication/service";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import {
  buildWorkspaceAccess,
  describeAccessReason,
} from "@/features/authorization/navigation";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { redirect } from "next/navigation";
import { switchContext } from "../actions";
export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("organization_id, organizations(name), status")
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
  const [{ options, active }, authorization] = await Promise.all([
    loadTenantContext(),
    loadEffectiveAuthorization(),
  ]);
  const workspace = authorization
    ? buildWorkspaceAccess(authorization)
    : { available: [], unavailable: [] };
  return (
    <main className="py-12">
      <PageHeader eyebrow="Secure workspace" title="Your organizations" />
      {active && (
        <section className="border-brand-border bg-brand-soft mt-7 rounded-xl border p-5 sm:p-6">
          <p className="text-brand text-xs font-semibold tracking-wide uppercase">
            Active context
          </p>
          <p className="mt-1 font-semibold">
            {active.organizationName}
            {active.schoolName ? ` · ${active.schoolName}` : ""}
          </p>
          {options.length > 1 && (
            <form action={switchContext} className="mt-4 flex gap-3">
              <label className="sr-only" htmlFor="context">
                Switch workspace
              </label>
              <select
                id="context"
                name="context"
                defaultValue={`${active.organizationId}:${active.schoolId ?? ""}`}
                className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm"
              >
                {options.map((option) => (
                  <option
                    key={`${option.organizationId}:${option.schoolId}`}
                    value={`${option.organizationId}:${option.schoolId ?? ""}`}
                  >
                    {option.organizationName}
                    {option.schoolName ? ` — ${option.schoolName}` : ""}
                  </option>
                ))}
              </select>
              <Button type="submit">Switch</Button>
            </form>
          )}
        </section>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {memberships.map((membership) => (
          <section
            key={membership.organization_id}
            className="border-border bg-surface rounded-xl border p-6"
          >
            <h2 className="font-semibold">{membership.organizations?.name}</h2>
            <p className="text-muted-foreground mt-2 text-sm font-medium">
              Active membership · tenant-isolated
            </p>
          </section>
        ))}
      </div>
      <section className="mt-10" aria-labelledby="available-modules">
        <PageHeader
          eyebrow="Workspace modules"
          title="Available in this school"
          description="Open a module directly. Availability follows your active school, role, plan and feature configuration."
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspace.available.map((item) => (
            <article
              key={item.href}
              className="border-border bg-surface rounded-xl border p-5"
            >
              <h3 className="font-semibold text-slate-950">{item.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              <ButtonLink
                href={item.href ?? `/capabilities/${item.module}`}
                variant="quiet"
                className="mt-4 px-0"
              >
                Open {item.label}
              </ButtonLink>
            </article>
          ))}
        </div>
      </section>
      {workspace.unavailable.length ? (
        <section className="mt-10" aria-labelledby="unavailable-modules">
          <h2
            id="unavailable-modules"
            className="text-lg font-semibold text-slate-950"
          >
            Not activated in this workspace
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            These capabilities are implemented but remain unavailable under the
            current organization configuration.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
