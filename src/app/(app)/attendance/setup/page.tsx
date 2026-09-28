import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadAttendanceFoundation } from "@/features/attendance/service";
import { saveAttendancePolicy } from "./actions";

const statuses = [
  ["present", "Present"],
  ["late", "Late"],
  ["absent", "Absent"],
  ["excused", "Excused"],
  ["left_early", "Left early"],
] as const;
const weekdays = [
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
  [6, "Saturday"],
  [0, "Sunday"],
] as const;

export default async function AttendanceSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const foundation = await loadAttendanceFoundation().catch(() => null);
  if (!foundation)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Attendance setup is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school workspace. Attendance configuration must
          also be temporarily enabled for this school.
        </p>
      </main>
    );
  if (!foundation.authorization.permissions.includes("attendance.configure"))
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Attendance setup is not available
        </h1>
      </main>
    );

  const settings = foundation.settings;
  const enabledStatuses = new Set(
    settings?.enabled_student_statuses ?? statuses.map(([key]) => key),
  );
  const enabledDays = new Set(
    settings?.student_attendance_days ?? [1, 2, 3, 4, 5],
  );

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Attendance setup"
        title={`Attendance policy for ${foundation.active.schoolName}`}
        description="Configure the school-scoped student register policy before attendance is enabled for operational use."
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
        action={saveAttendancePolicy}
        className="mt-7 max-w-3xl rounded-xl border bg-white p-5 sm:p-6"
      >
        <p className="text-sm text-slate-600">
          Morning registers are always enabled. Closing registers remain
          optional.
        </p>
        <label className="mt-5 block text-sm font-medium">
          Lock corrections after
          <select
            className={fieldClass}
            name="lockAfterDays"
            defaultValue={String(settings?.lock_after_days ?? 1)}
          >
            {[0, 1, 2, 3, 5, 7, 14, 30].map((day) => (
              <option key={day} value={day}>
                {day} day{day === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-5 flex min-h-11 items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="closingRegisterEnabled"
            defaultChecked={settings?.closing_register_enabled ?? false}
          />
          Enable closing register
        </label>
        <fieldset className="mt-6">
          <legend className="font-semibold">Available statuses</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {statuses.map(([key, label]) => (
              <label
                key={key}
                className="flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="enabledStudentStatuses"
                  value={key}
                  defaultChecked={enabledStatuses.has(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="font-semibold">Attendance days</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {weekdays.map(([value, label]) => (
              <label
                key={value}
                className="flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm"
              >
                <input
                  type="checkbox"
                  name="studentAttendanceDays"
                  value={value}
                  defaultChecked={enabledDays.has(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <Button className="mt-7 w-full sm:w-auto" type="submit">
          Save attendance policy
        </Button>
      </form>
    </main>
  );
}
