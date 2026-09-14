import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldClass } from "@/components/auth-card";
import { loadStaffMember } from "@/features/staff/service";
import { endEmployment, transferStaffAssignment } from "../actions";

const panel = "rounded-xl border bg-white p-5 sm:p-6";

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
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Staff 360</p>
          <h1 className="mt-1 text-3xl font-semibold">
            {person.first_name} {person.last_name}
          </h1>
          <p className="mt-2 text-slate-600">
            {record.profile.staff_number} ·{" "}
            <span className="capitalize">{record.profile.status}</span>
          </p>
        </div>
        <p className="text-sm text-slate-500">{record.active.schoolName}</p>
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
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Work email</dt>
              <dd className="font-medium">
                {record.profile.work_email ?? "Not recorded"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium">
                {record.profile.phone ?? "Not recorded"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Emergency contact</dt>
              <dd className="font-medium">
                {record.profile.emergency_contact_name ?? "Not recorded"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Qualifications</dt>
              <dd className="font-medium">
                {record.profile.qualifications.length
                  ? record.profile.qualifications.join(", ")
                  : "Not recorded"}
              </dd>
            </div>
          </dl>
        </section>
        <section className={panel}>
          <h2 className="text-lg font-semibold">Employment</h2>
          {record.employments.map((item) => (
            <div
              key={item.id}
              className="mt-4 rounded-lg bg-slate-50 p-4 text-sm"
            >
              <div className="flex justify-between">
                <span className="font-semibold capitalize">
                  {item.employment_type.replace("_", " ")}
                </span>
                <span className="text-slate-500 capitalize">
                  {item.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-slate-500">
                {item.started_on}
                {item.ended_on ? ` to ${item.ended_on}` : " to present"}
              </p>
              {item.exit_reason && <p className="mt-2">{item.exit_reason}</p>}
            </div>
          ))}
        </section>
        <section className={`${panel} lg:col-span-2`}>
          <h2 className="text-lg font-semibold">School assignment history</h2>
          <ul className="mt-4 space-y-3">
            {record.assignments.map((item) => (
              <li key={item.id} className="rounded-lg border p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">
                    {item.positions.name} · {item.schools.name}
                  </span>
                  <span className="text-slate-500 capitalize">
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-slate-500">
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
            <p className="mt-1 text-sm text-slate-600">
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
              <button className="rounded-lg border px-4 py-2.5 text-sm font-semibold">
                Transfer assignment
              </button>
            </form>
          </section>
        )}
        {canEnd && activeEmployment && (
          <section className={`${panel} border-red-200 lg:col-span-2`}>
            <h2 className="text-lg font-semibold">End employment</h2>
            <p className="mt-1 text-sm text-slate-600">
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
              <button className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-800">
                End employment
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
