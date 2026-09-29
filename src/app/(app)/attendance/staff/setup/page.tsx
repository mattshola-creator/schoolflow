import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadStaffAttendanceSetup } from "@/features/attendance/service";
import { saveWorkingHoursPolicy } from "./actions";

const weekdays = [
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
  [6, "Saturday"],
  [0, "Sunday"],
] as const;

export default async function StaffAttendanceSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const setup = await loadStaffAttendanceSetup().catch(() => null);
  if (!setup)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Staff attendance setup is not available
        </h1>
      </main>
    );

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Staff attendance setup"
        title={`Working hours for ${setup.active.schoolName}`}
        description="Set one school default or override it for a position. The effective policy is snapshotted when staff clock activity is recorded."
        actions={
          <ButtonLink href="/attendance/staff" variant="secondary">
            Back to staff clock
          </ButtonLink>
        }
      />
      {notice.error || notice.message ? (
        <p
          role={notice.error ? "alert" : "status"}
          className={`mt-5 rounded-lg p-3 text-sm font-medium ${notice.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
        >
          {notice.error ?? notice.message}
        </p>
      ) : null}
      <form
        action={saveWorkingHoursPolicy}
        className="mt-7 max-w-3xl rounded-xl border bg-white p-5 sm:p-6"
      >
        <label className="block text-sm font-medium">
          Policy applies to
          <select className={fieldClass} name="positionId" defaultValue="">
            <option value="">All staff (school default)</option>
            {setup.positions.map((position) => (
              <option key={position.position_id} value={position.position_id}>
                {position.position_name}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-5 block text-sm font-medium">
          Policy name
          <input className={fieldClass} name="name" maxLength={120} required />
        </label>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">
            Starts at
            <input
              className={fieldClass}
              type="time"
              name="startsAt"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Ends at
            <input className={fieldClass} type="time" name="endsAt" required />
          </label>
          <label className="text-sm font-medium">
            Grace minutes
            <input
              className={fieldClass}
              type="number"
              name="graceMinutes"
              min={0}
              max={240}
              defaultValue={0}
              required
            />
          </label>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Effective from
            <input
              className={fieldClass}
              type="date"
              name="effectiveFrom"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Effective to <span className="text-slate-500">(optional)</span>
            <input className={fieldClass} type="date" name="effectiveTo" />
          </label>
        </div>
        <fieldset className="mt-6">
          <legend className="font-semibold">Working days</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {weekdays.map(([value, label]) => (
              <label
                key={value}
                className="flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="workingDays"
                  value={value}
                  defaultChecked={value >= 1 && value <= 5}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <Button className="mt-7 w-full sm:w-auto" type="submit">
          Save working-hours policy
        </Button>
      </form>

      <section className="mt-7 max-w-3xl rounded-xl border bg-white p-5 sm:p-6">
        <h2 className="font-semibold">Active policies</h2>
        {!setup.policies.length ? (
          <p className="mt-3 text-sm text-slate-600">
            No staff working-hours policy is configured.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {setup.policies.map((policy) => {
              const position = setup.positions.find(
                (item) => item.position_id === policy.position_id,
              );
              return (
                <li key={policy.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-semibold break-words">{policy.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {position?.position_name ?? "School default"} ·{" "}
                    {policy.starts_at.slice(0, 5)}–{policy.ends_at.slice(0, 5)}{" "}
                    · {policy.grace_minutes} minute grace
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
