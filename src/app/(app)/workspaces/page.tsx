import { workspaceDestination } from "@/features/workspaces/entry";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import { ownerEntryEnabled } from "@/features/owner-dashboard/entry";
import { buildWorkspaceAccess } from "@/features/authorization/navigation";
export default async function WorkspacesPage() {
  if (!ownerEntryEnabled()) notFound();
  const { supabase, user } = await requireUser();
  const tenant = await loadTenantContext();
  const auth = await loadEffectiveAuthorization();
  if (
    !tenant.active ||
    !auth ||
    tenant.active.organizationId !== auth.organizationId ||
    tenant.active.schoolId !== auth.schoolId
  )
    notFound();
  const roles = await supabase
    .from("role_assignments")
    .select("id,scope,school_id,effective_from,effective_to,roles(name)")
    .eq("organization_id", tenant.active.organizationId)
    .eq("user_id", user.id)
    .eq("status", "active");
  if (roles.error) throw new Error("Your role assignments could not be loaded");
  const now = new Date().getTime();
  const effective = (roles.data ?? []).filter(
    (r) =>
      Date.parse(r.effective_from) <= now &&
      (!r.effective_to || Date.parse(r.effective_to) > now) &&
      (r.scope === "organization" || r.school_id === tenant.active!.schoolId),
  );
  const links = buildWorkspaceAccess(auth).available;
  return (
    <section className="min-w-0 space-y-5">
      <h1 className="text-2xl font-bold">My workspaces & granted roles</h1>
      <p>
        Use the organization and school switcher above to change your authorized
        context. Choose a workspace below. Your identity and effective
        permissions remain unchanged.
      </p>
      <h2 className="text-lg font-semibold">Your roles in this context</h2>
      <ul className="flex flex-wrap gap-3">
        {effective.map((r) => (
          <li key={r.id} className="rounded-xl border p-3">
            {(Array.isArray(r.roles) ? r.roles[0]?.name : r.roles?.name) ??
              "Assigned role"}{" "}
            · {r.scope.replace("_", " ")}
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold">Working dashboards</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["leadership", "Principal / School leadership"],
          ["finance", "Bursar / Finance"],
        ].map(([key, label]) => {
          const href = workspaceDestination(key, auth);
          return href ? (
            <Link
              key={key}
              href={href}
              className="min-h-14 rounded-2xl border p-5 font-semibold"
            >
              {label} →
            </Link>
          ) : null;
        })}
      </div>
      <h2 className="text-lg font-semibold">Authorized workspaces</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href ?? l.label}
            className="min-h-14 rounded-xl border bg-white p-4 font-semibold text-slate-950 focus-visible:outline-2"
            href={l.href ?? `/capabilities/${l.module}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <p className="text-sm">
        This is navigation between granted capabilities, not impersonation or a
        restricted-role session. Every action still checks the authenticated
        user on the server.
      </p>
    </section>
  );
}
