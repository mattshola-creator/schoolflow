import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldClass } from "@/components/auth-card";
import { buttonClassName } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/ui/detail-list";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { loadStaffMember } from "@/features/staff/service";
import { endEmployment, transferStaffAssignment } from "../actions";

const panel = "border-border bg-surface rounded-xl border p-5 sm:p-6";

export default async function StaffMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ staffId: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const { staffId } = await params;
  const { message } = await searchParams;
  const record = await loadStaffMember(staffId).catch(() => null);
  if (!record) notFound();
  const person = record.profile.people;
  const activeEmployment = record.employments.find(
    (item) => item.status !== "ended",
  );
  const canEnd = record.authorization.permissions.includes(
    "staff.access.manage",
  );
  const canTransfer = record.authorization.permissions.includes(
    "staff.assignments.manage",
  );
  const activeAssignment = record.assignments.find(
    (item) => item.status === "active",
  );
  return (
    <main className="py-10 sm:py-12">
      <Link href="/staff" className="text-sm font-medium text-emerald-800">
        ← Staff
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Staff 360"
          title={
            <span className="break-words">
              {person.first_name} {person.last_name}
            </span>
          }
          description={
            <span className="block [overflow-wrap:anywhere]">
              {record.profile.staff_number} · {record.active.schoolName}
            </span>
          }
          actions={
            <StatusBadge
              tone={record.profile.status === "active" ? "success" : "neutral"}
              className="capitalize"
            >
              {record.profile.status}
            </StatusBadge>
          }
        />
      </div>
      {message && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {message}
        </p>
      )}
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className={panel}>
          <h2 className="text-lg font-semibold">Contact and profile</h2>
          <DetailList className="mt-4">
            <DetailItem label="Work email">
              <span className="[overflow-wrap:anywhere]">
                {record.profile.work_email ?? "Not recorded"}
              </span>
            </DetailItem>
            <DetailItem label="Phone">
              {record.profile.phone ?? "Not recorded"}
            </DetailItem>
            <DetailItem label="Emergency contact">
              {record.profile.emergency_contact_name ?? "Not recorded"}
            </DetailItem>
            <DetailItem label="Qualifications">
              {record.profile.qualifications.length
                ? record.profile.qualifications.join(", ")
                : "Not recorded"}
            </DetailItem>
          </DetailList>
        </section>
        <section className={panel}>
          <h2 className="text-lg font-semibold">Employment</h2>
          {record.employments.map((item) => (
            <div
              key={item.id}
              className="bg-surface-subtle mt-4 rounded-lg p-4 text-sm"
            >
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <span className="min-w-0 font-semibold break-words capitalize">
                  {item.employment_type.replace("_", " ")}
                </span>
                <StatusBadge
                  tone={item.status === "active" ? "success" : "neutral"}
                  className="capitalize"
                >
                  {item.status.replace("_", " ")}
                </StatusBadge>
              </div>
              <p className="text-muted-foreground mt-1 font-medium">
                {item.started_on}
                {item.ended_on ? ` to ${item.ended_on}` : " to present"}
              </p>
              {item.exit_reason && (
                <p className="mt-2 break-words">{item.exit_reason}</p>
              )}
            </div>
          ))}
        </section>
        <section className={`${panel} lg:col-span-2`}>
          <h2 className="text-lg font-semibold">School assignment history</h2>
          <ul className="mt-4 space-y-3">
            {record.assignments.map((item) => (
              <li
                key={item.id}
                className="border-border rounded-lg border p-4 text-sm"
              >
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <span className="min-w-0 font-semibold break-words">
                    {item.positions.name} · {item.schools.name}
                  </span>
                  <StatusBadge
                    tone={item.status === "active" ? "success" : "neutral"}
                    className="capitalize"
                  >
                    {item.status}
                  </StatusBadge>
                </div>
                <p className="text-muted-foreground mt-1 font-medium break-words">
                  {item.departments?.name ?? "School-wide"} · {item.started_on}
                  {item.ended_on ? ` to ${item.ended_on}` : " to present"}
                  {item.is_primary ? " · Primary assignment" : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
        {canTransfer && activeAssignment && (
          <section className={`${panel} lg:col-span-2`}>
            <h2 className="text-lg font-semibold">Transfer assignment</h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Ends the current dated assignment and starts a new one. Linked
              school-role access moves atomically when present.
            </p>
            <form
              action={transferStaffAssignment}
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
            >
              <input
                type="hidden"
                name="assignmentId"
                value={activeAssignment.id}
              />
              <label className="text-sm font-medium">
                Destination school
                <select className={fieldClass} name="schoolId" required>
                  {record.schools.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Department
                <select className={fieldClass} name="departmentId">
                  <option value="">No department</option>
                  {record.departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Position
                <select className={fieldClass} name="positionId" required>
                  {record.positions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Effective date
                <input
                  className={fieldClass}
                  name="startedOn"
                  type="date"
                  min={activeAssignment.started_on}
                  required
                />
              </label>
              <button className={buttonClassName({ variant: "secondary" })}>
                Transfer assignment
              </button>
            </form>
          </section>
        )}
        {canEnd && activeEmployment && (
          <section className={`${panel} border-red-200 lg:col-span-2`}>
            <h2 className="text-lg font-semibold">End employment</h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Preserves history and attribution while ending only staff-linked
              role assignments. Other identities, such as guardian access,
              remain intact.
            </p>
            <form
              action={endEmployment}
              className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end"
            >
              <input
                type="hidden"
                name="employmentId"
                value={activeEmployment.id}
              />
              <label className="text-sm font-medium">
                Last employment date
                <input
                  className={fieldClass}
                  name="endedOn"
                  type="date"
                  min={activeEmployment.started_on}
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Exit reason
                <input
                  className={fieldClass}
                  name="reason"
                  minLength={3}
                  maxLength={500}
                  required
                />
              </label>
              <button className="min-h-11 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
                End employment
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
