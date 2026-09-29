import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { loadStaffTimeOffWorkspace } from "@/features/staff/service";
import {
  createStaffLeaveType,
  saveSchoolTimezone,
  submitStaffTimeOff,
} from "../actions";

const panel = "border-border bg-surface min-w-0 rounded-xl border p-5 sm:p-6";
const commonTimezones = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Europe/London",
  "America/New_York",
];

export default async function StaffTimeOffPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const data = await loadStaffTimeOffWorkspace().catch(() => null);
  if (!data)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Time off unavailable</h1>
      </main>
    );
  const canManage = data.authorization.permissions.includes(
    "staff.time_off.manage",
  );
  const canConfigureTimezone =
    data.authorization.permissions.includes("school.manage");
  return (
    <main className="py-10 sm:py-12">
      <Link href="/staff" className="text-sm font-medium text-emerald-800">
        ← Staff
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Staff and HR"
          title="Leave and permission"
          description={`Times are interpreted in ${data.timezone}. Requests follow the configured approval policy.`}
        />
      </div>
      {params.message && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"
        >
          {params.message}
        </p>
      )}
      {params.error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {params.error}
        </p>
      )}
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className={panel}>
          <h2 className="text-lg font-semibold">Submit request</h2>
          <form action={submitStaffTimeOff} className="mt-4 grid gap-3">
            <label className="text-sm font-medium">
              Staff assignment
              <select className={fieldClass} name="staffAssignmentId" required>
                {data.assignments.map((item) => (
                  <option
                    key={item.staff_assignment_id}
                    value={item.staff_assignment_id}
                  >
                    {item.staff_name} · {item.staff_number}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Request type
              <select className={fieldClass} name="kind" required>
                <option value="leave">Leave</option>
                <option value="permission">Short permission</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Leave type (leave only)
              <select className={fieldClass} name="leaveTypeId">
                <option value="">Not applicable</option>
                {data.leaveTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Starts
                <input
                  className={fieldClass}
                  name="startsAt"
                  type="datetime-local"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Ends
                <input
                  className={fieldClass}
                  name="endsAt"
                  type="datetime-local"
                  required
                />
              </label>
            </div>
            <label className="text-sm font-medium">
              Approval policy
              <select className={fieldClass} name="policyId" required>
                {data.policies.map((item) => (
                  <option key={item.policy_id} value={item.policy_id}>
                    {item.policy_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Reason
              <textarea
                className={fieldClass}
                name="reason"
                minLength={3}
                maxLength={1000}
                required
              />
            </label>
            <Button
              disabled={!data.assignments.length || !data.policies.length}
            >
              Submit for approval
            </Button>
          </form>
        </section>
        <div className="grid gap-6">
          {canConfigureTimezone && (
            <section className={panel}>
              <h2 className="text-lg font-semibold">School timezone</h2>
              <form
                action={saveSchoolTimezone}
                className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
              >
                <label className="text-sm font-medium">
                  IANA timezone
                  <input
                    className={fieldClass}
                    name="timezone"
                    defaultValue={data.timezone}
                    list="school-timezones"
                    required
                  />
                  <datalist id="school-timezones">
                    {commonTimezones.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </label>
                <Button variant="secondary">Save timezone</Button>
              </form>
            </section>
          )}
          {canManage && (
            <section className={panel}>
              <h2 className="text-lg font-semibold">Leave types</h2>
              <form action={createStaffLeaveType} className="mt-4 grid gap-3">
                <label className="text-sm font-medium">
                  Name
                  <input className={fieldClass} name="name" required />
                </label>
                <label className="text-sm font-medium">
                  Code
                  <input
                    className={fieldClass}
                    name="code"
                    placeholder="ANNUAL"
                    required
                  />
                </label>
                <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                  <input
                    className="size-5 accent-emerald-800"
                    type="checkbox"
                    name="isPaid"
                  />
                  Paid leave
                </label>
                <Button variant="secondary">Add leave type</Button>
              </form>
            </section>
          )}
        </div>
        <section className={`${panel} lg:col-span-2`}>
          <h2 className="text-lg font-semibold">Recent requests</h2>
          <ul className="mt-4 divide-y">
            {data.requests.map((item) => (
              <li
                key={item.id}
                className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_auto]"
              >
                <span>
                  <strong className="capitalize">{item.kind}</strong>
                  <span className="text-muted-foreground block">
                    {item.starts_at} to {item.ends_at}
                  </span>
                </span>
                <StatusBadge className="capitalize">{item.status}</StatusBadge>
              </li>
            ))}
          </ul>
          {!data.requests.length && (
            <p className="mt-4 text-sm text-slate-500">
              No requests submitted.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
