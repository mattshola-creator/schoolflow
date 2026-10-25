import { loadRoleManagement } from "@/features/administration/role-management";
import { shortMemberReference } from "@/features/administration/model";
import { changeRole } from "./actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorizationError } from "@/lib/authorization";
import { StatePanel } from "@/components/ui/state-panel";
import { ownerEntryEnabled } from "@/features/owner-dashboard/entry";
const audiences = [
  "School Owner",
  "Principal",
  "Vice Principal",
  "Teacher",
  "Bursar",
  "Admissions Officer",
  "Staff",
  "Parent / Guardian",
  "Student",
];
export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  if (!ownerEntryEnabled()) notFound();
  const data = await loadRoleManagement().catch((error: unknown) => {
    if (error instanceof AuthorizationError) return null;
    throw error;
  });
  if (!data)
    return (
      <StatePanel
        kind="unauthorized"
        title="Role access unavailable"
        description="Select an authorized school and an account with role viewing permission."
      />
    );
  const query = await searchParams;
  const assignable = data.roles.filter(
    (r) => !r.is_system && r.key !== "organization_owner",
  );
  return (
    <section className="min-w-0 space-y-6">
      <h1 className="text-2xl font-bold">Roles & workspaces</h1>
      <p>
        Selected school: {data.schoolName}. Use the school switcher above to
        move between authorized workspaces. Permissions come from all effective
        assignments; choosing a dashboard never grants or removes authority.
      </p>
      {query.message ? (
        <p role="status">{query.message.slice(0, 200)}</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-4 text-slate-950">
          <h2 className="text-lg font-semibold">Your granted roles</h2>
          <ul className="mt-3 space-y-2">
            {data.assignments
              .filter(
                (a) =>
                  a.user_id === data.userId &&
                  Date.parse(a.effective_from) <= data.now &&
                  (!a.effective_to || Date.parse(a.effective_to) > data.now),
              )
              .map((a) => (
                <li key={a.id}>
                  {data.roles.find((r) => r.id === a.role_id)?.name ??
                    "Granted role"}
                </li>
              ))}
          </ul>
          <p className="mt-3 text-sm">
            Organization-wide Owner authority is shown in Administration. This
            list shows school assignments only.
          </p>
          <Link href="/administration" className="mt-3 inline-block underline">
            View effective access
          </Link>
        </section>
        <section className="rounded-xl border bg-white p-4 text-slate-950">
          <h2 className="text-lg font-semibold">
            Assign an existing school role
          </h2>
          {data.canManage ? (
            <form action={changeRole} className="mt-3 grid gap-3">
              <input type="hidden" name="operation" value="assign" />
              <label>
                Active school member
                <select
                  name="userId"
                  required
                  className="mt-1 block min-h-11 w-full min-w-0 rounded-lg border p-2"
                >
                  {data.members
                    .filter((m) => m.id !== data.userId)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Configured role
                <select
                  name="roleId"
                  required
                  className="mt-1 block min-h-11 w-full min-w-0 rounded-lg border p-2"
                >
                  {assignable.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <button className="min-h-11 rounded-lg bg-emerald-800 p-2 font-semibold text-white">
                Assign school role
              </button>
            </form>
          ) : (
            <p>Role management permission required.</p>
          )}
          <p className="mt-3 text-sm">
            Existing memberships only. Self-assignment, Owner/system-role
            changes and delegation beyond your permissions are blocked.
          </p>
        </section>
      </div>
      <section>
        <h2 className="text-lg font-semibold">Active school assignments</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {data.assignments.map((a) => (
            <article
              key={a.id}
              className="min-w-0 rounded-xl border bg-white p-4 text-slate-950"
            >
              <p className="break-words">
                {shortMemberReference(a.user_id)} ·{" "}
                {data.roles.find((r) => r.id === a.role_id)?.name ?? "Role"}
              </p>
              <p className="mt-1 text-sm">
                Effective from {new Date(a.effective_from).toLocaleDateString()}
              </p>
              {data.canManage &&
              a.user_id !== data.userId &&
              !data.roles.find((r) => r.id === a.role_id)?.is_system ? (
                <form action={changeRole}>
                  <input type="hidden" name="operation" value="revoke" />
                  <input type="hidden" name="assignmentId" value={a.id} />
                  <button className="mt-3 min-h-11 rounded-lg border px-3">
                    Revoke school assignment
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Role catalogue coverage</h2>
        <p className="mt-2">{audiences.join(" · ")}</p>
        <p className="mt-2 text-sm">
          Role names require a reviewed permission set before assignment. This
          interface reuses configured roles only; it does not create missing
          roles or elevate anyone to Owner. Guardian and Student access also
          require the existing relationship/portal linkage.
        </p>
      </section>
    </section>
  );
}
