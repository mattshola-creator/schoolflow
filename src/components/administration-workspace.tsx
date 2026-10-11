import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { shortMemberReference } from "@/features/administration/model";

type Workspace = Awaited<
  ReturnType<
    typeof import("@/features/administration/service").loadAdministrationWorkspace
  >
>;

function relatedName(value: unknown) {
  if (Array.isArray(value)) return value[0]?.name ?? null;
  if (value && typeof value === "object" && "name" in value)
    return String(value.name);
  return null;
}

export function AdministrationWorkspace({
  workspace,
}: {
  workspace: Workspace;
}) {
  const scope = workspace.active.schoolName ?? "Organization-wide";
  const summaries = [
    [
      "Authorized workspaces",
      workspace.options.length,
      "From active memberships",
    ],
    [
      "Active members",
      workspace.memberCount ?? "Restricted",
      workspace.permissions.viewMembers ? scope : "Requires membership.view",
    ],
    [
      "Pending invitations",
      workspace.invitationCount ?? "Restricted",
      workspace.permissions.viewMembers
        ? "Authorized pending records"
        : "Requires membership.view",
    ],
    [
      "Role assignments",
      workspace.assignmentCount ?? "Restricted",
      workspace.permissions.viewRoles
        ? "Active in this scope"
        : "Requires role.view",
    ],
  ] as const;
  return (
    <div className="space-y-8">
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Administration summary"
      >
        {summaries.map(([label, value, detail]) => (
          <SurfaceCard key={label} title={label}>
            <p className="text-3xl font-semibold text-slate-950">{value}</p>
            <p className="text-muted-foreground mt-2 text-sm">{detail}</p>
          </SurfaceCard>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard title="People and invitations">
          <p className="text-muted-foreground mb-4 text-sm">
            Only membership records authorized for the active scope are shown.
          </p>
          {!workspace.permissions.viewMembers ? (
            <p className="text-muted-foreground text-sm">
              Membership details are hidden because this role does not include
              membership viewing.
            </p>
          ) : workspace.invitations.length ? (
            <ul className="space-y-3">
              {workspace.invitations.map((invitation) => (
                <li
                  key={invitation.id}
                  className="border-border rounded-xl border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold break-all text-slate-950">
                        {invitation.email}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {relatedName(invitation.roles) ?? "Assigned role"} ·
                        expires{" "}
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge tone="warning">Pending</StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No pending invitations are visible in this scope.
            </p>
          )}
          <p className="text-muted-foreground mt-4 text-xs">
            This release does not invent an invitation-delivery or role-mutation
            contract. Changes remain available only through established,
            authorized workflows.
          </p>
        </SurfaceCard>

        <SurfaceCard title="Effective access">
          <p className="text-muted-foreground mb-4 text-sm">
            Why the signed-in user can work in this context.
          </p>
          <p className="text-sm text-slate-700">
            <strong>{workspace.permissionCount}</strong> effective permissions
            derive from membership, role assignment, scope and active context.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {workspace.permissionGroups.map((group) => (
              <StatusBadge key={group.key} tone="neutral">
                {group.label} · {group.count}
              </StatusBadge>
            ))}
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Organization</dt>
              <dd className="font-semibold">
                {workspace.active.organizationName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">School scope</dt>
              <dd className="font-semibold">{scope}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Member changes</dt>
              <dd className="font-semibold">
                {workspace.permissions.manageMembers
                  ? "Authorized"
                  : "View only"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Role changes</dt>
              <dd className="font-semibold">
                {workspace.permissions.manageRoles ? "Authorized" : "View only"}
              </dd>
            </div>
          </dl>
        </SurfaceCard>
      </div>

      <SurfaceCard title="Active role assignments">
        <p className="text-muted-foreground mb-4 text-sm">
          A privacy-limited role and scope view; Administration does not broaden
          access to personal profile data.
        </p>
        {!workspace.permissions.viewRoles ? (
          <p className="text-muted-foreground text-sm">
            Role assignments are hidden because this role does not include role
            viewing.
          </p>
        ) : workspace.assignments.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {workspace.assignments.map((assignment) => (
              <article
                key={assignment.id}
                className="border-border rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {shortMemberReference(assignment.user_id)}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {relatedName(assignment.roles) ?? "Assigned role"} ·{" "}
                      {assignment.scope.replace("_", " ")}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {relatedName(assignment.schools) ??
                        relatedName(assignment.management_groups) ??
                        "Organization-wide"}
                    </p>
                  </div>
                  <StatusBadge tone="success">Active</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No role assignments are visible in this scope.
          </p>
        )}
      </SurfaceCard>

      <section aria-labelledby="module-availability">
        <h2
          id="module-availability"
          className="text-xl font-semibold text-slate-950"
        >
          Module availability
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Availability uses the same permission, plan entitlement and feature
          checks as application navigation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {workspace.modules.map((module) => (
            <article
              key={module.label}
              className="border-border bg-surface rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {module.label}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {module.description}
                  </p>
                </div>
                <StatusBadge tone={module.available ? "success" : "warning"}>
                  {module.available ? "Available" : "Unavailable"}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm text-slate-700">{module.reason}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-slate-100 p-5 text-sm text-slate-700">
        <h2 className="font-semibold text-slate-950">
          Tenant administration boundary
        </h2>
        <p className="mt-2">
          Organization Owner access remains separate from Platform Super Admin.
          Plans, entitlements and controlled feature rollouts are displayed
          through effective availability only and cannot be changed here.
        </p>
      </aside>
    </div>
  );
}
