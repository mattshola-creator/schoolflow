import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { switchContext } from "../actions";
export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("organization_id, organizations(name), status")
    .eq("user_id", user.id)
    .eq("status", "active");
  if (!memberships?.length)
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
  const { options, active } = await loadTenantContext();
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
    </main>
  );
}
