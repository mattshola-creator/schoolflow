import Link from "next/link";
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
        <p className="text-sm font-semibold text-emerald-800">Account ready</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Create your organization
        </h1>
        <p className="mt-3 text-slate-600">
          Set up the tenant boundary and first school to continue.
        </p>
        <Link
          href="/onboarding"
          className="mt-7 inline-flex rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white"
        >
          Start setup
        </Link>
      </main>
    );
  const { options, active } = await loadTenantContext();
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm font-semibold text-emerald-800">Secure workspace</p>
      <h1 className="mt-2 text-3xl font-semibold">Your organizations</h1>
      {active && (
        <section className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">
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
              <button className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">
                Switch
              </button>
            </form>
          )}
        </section>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {memberships.map((membership) => (
          <section
            key={membership.organization_id}
            className="rounded-xl border bg-white p-6"
          >
            <h2 className="font-semibold">{membership.organizations?.name}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Active membership · tenant-isolated
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
