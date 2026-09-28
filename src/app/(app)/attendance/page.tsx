import { ClipboardCheck } from "lucide-react";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  attendanceRegisterQuerySchema,
  attendanceScopeKey,
  parseAttendanceScopeKey,
} from "@/features/attendance/schemas";
import {
  loadStudentAttendanceRoster,
  loadStudentAttendanceWorkspace,
} from "@/features/attendance/service";
import { submitAttendanceRegister } from "./actions";

const statusLabels = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused",
  left_early: "Left early",
} as const;

function currentDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function Notice({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-5 rounded-lg p-3 text-sm font-medium ${error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
    >
      {error ?? message}
    </p>
  );
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    type?: string;
    scope?: string;
    error?: string;
    message?: string;
  }>;
}) {
  const raw = await searchParams;
  const query = attendanceRegisterQuerySchema.safeParse({
    date: raw.date ?? currentDate(),
    type: raw.type ?? "morning",
    scope: raw.scope,
  });
  const selected = query.success
    ? query.data
    : { date: currentDate(), type: "morning" as const, scope: undefined };
  const workspace = await loadStudentAttendanceWorkspace(selected.date).catch(
    () => null,
  );
  if (!workspace)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Student attendance is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school workspace. Attendance must also be enabled
          for the school before this register can be used.
        </p>
      </main>
    );

  const registerType =
    selected.type === "closing" && !workspace.settings?.closing_register_enabled
      ? "morning"
      : selected.type;
  const scope = selected.scope
    ? workspace.scopes.find(
        (item) => attendanceScopeKey(item) === selected.scope,
      )
    : undefined;
  const parsedScope = scope
    ? parseAttendanceScopeKey(attendanceScopeKey(scope))
    : null;
  const rosterResult = parsedScope
    ? await loadStudentAttendanceRoster({
        ...parsedScope,
        attendanceDate: selected.date,
        registerType,
      }).catch(() => null)
    : null;
  const roster = rosterResult?.roster ?? [];
  const existingRegister = roster.find((item) => item.register_id);
  const enabledStatuses = workspace.settings?.enabled_student_statuses ?? [];

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Student attendance"
        title={`Attendance at ${workspace.active.schoolName}`}
        description="Record one complete class register for a teaching day. Submissions are atomic and become correction-controlled after the school lock window."
        actions={
          <div className="bg-brand-soft text-brand rounded-lg px-4 py-3 text-sm font-semibold">
            <ClipboardCheck aria-hidden="true" className="mr-2 inline size-4" />
            {workspace.settings?.lock_after_days ?? 1}-day lock policy
          </div>
        }
      />
      <Notice error={raw.error} message={raw.message} />

      <form
        method="get"
        className="mt-7 grid min-w-0 gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr_auto] lg:items-end"
      >
        <label className="min-w-0 text-sm font-medium">
          Attendance date
          <input
            className={fieldClass}
            type="date"
            name="date"
            defaultValue={selected.date}
            required
          />
        </label>
        <label className="min-w-0 text-sm font-medium">
          Class
          <select
            className={fieldClass}
            name="scope"
            defaultValue={scope ? attendanceScopeKey(scope) : ""}
            required
          >
            <option value="">Select an assigned class</option>
            {workspace.scopes.map((item) => {
              const key = attendanceScopeKey(item);
              return (
                <option key={key} value={key}>
                  {item.class_level_name}
                  {item.class_arm_name
                    ? ` · ${item.class_arm_name}`
                    : ""} · {item.session_name} ({item.student_count})
                </option>
              );
            })}
          </select>
        </label>
        <label className="min-w-0 text-sm font-medium">
          Register
          <select
            className={fieldClass}
            name="type"
            defaultValue={registerType}
          >
            <option value="morning">Morning</option>
            {workspace.settings?.closing_register_enabled ? (
              <option value="closing">Closing</option>
            ) : null}
          </select>
        </label>
        <Button className="w-full" type="submit" variant="secondary">
          Load register
        </Button>
      </form>

      {!workspace.settings ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Attendance policy must be configured before registers can be
          submitted.
        </p>
      ) : !workspace.scopes.length ? (
        <p className="mt-6 rounded-xl border bg-white p-8 text-center text-slate-600">
          No assigned class with an active roster is available for this date.
        </p>
      ) : scope && !rosterResult ? (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 p-5 text-red-800">
          This register could not be loaded. Confirm your assigned teaching
          scope and try again.
        </p>
      ) : scope ? (
        <section className="mt-6 overflow-hidden rounded-xl border bg-white">
          <div className="border-b px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <h2 className="font-semibold">
                  {scope.class_level_name}
                  {scope.class_arm_name ? ` · ${scope.class_arm_name}` : ""}
                </h2>
                <p className="text-sm text-slate-500">
                  {scope.session_name} · {selected.date} ·{" "}
                  <span className="capitalize">{registerType}</span>
                </p>
              </div>
              <span className="text-sm font-medium text-slate-600">
                {roster.length} student{roster.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {existingRegister ? (
            <div className="border-b bg-emerald-50 px-5 py-3 text-sm text-emerald-900 sm:px-6">
              This register has been submitted. Current values are shown
              read-only; corrections use the controlled correction workflow.
            </div>
          ) : null}

          <form action={submitAttendanceRegister}>
            <input type="hidden" name="attendanceDate" value={selected.date} />
            <input type="hidden" name="registerType" value={registerType} />
            <input
              type="hidden"
              name="scope"
              value={attendanceScopeKey(scope)}
            />
            <input
              type="hidden"
              name="idempotencyKey"
              value={crypto.randomUUID()}
            />
            <ul className="divide-y">
              {roster.map((student) => (
                <li
                  key={student.student_id}
                  className="grid min-w-0 gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[minmax(12rem,1fr)_12rem_minmax(12rem,1fr)] lg:items-end"
                >
                  <div className="min-w-0">
                    <p className="font-semibold break-words">
                      {student.last_name}, {student.first_name}
                    </p>
                    <p className="mt-1 text-sm [overflow-wrap:anywhere] text-slate-500">
                      {student.student_number}
                    </p>
                    <input
                      type="hidden"
                      name="studentId"
                      value={student.student_id}
                    />
                  </div>
                  <label className="min-w-0 text-sm font-medium">
                    Status
                    <select
                      className={fieldClass}
                      name={`status:${student.student_id}`}
                      defaultValue={student.attendance_status ?? "present"}
                      disabled={Boolean(existingRegister)}
                      required
                    >
                      {enabledStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="min-w-0 text-sm font-medium">
                    Note <span className="text-slate-500">(optional)</span>
                    <input
                      className={fieldClass}
                      name={`note:${student.student_id}`}
                      defaultValue={student.attendance_note ?? ""}
                      maxLength={500}
                      disabled={Boolean(existingRegister)}
                    />
                  </label>
                </li>
              ))}
            </ul>
            {!existingRegister && roster.length ? (
              <div className="border-t bg-slate-50 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <p className="mb-3 text-sm text-slate-600 sm:mb-0">
                  Review every student. The complete roster is saved together.
                </p>
                <Button className="w-full sm:w-auto" type="submit">
                  Submit register
                </Button>
              </div>
            ) : null}
          </form>
        </section>
      ) : (
        <p className="mt-6 rounded-xl border bg-white p-8 text-center text-slate-600">
          Select a class and register type to begin.
        </p>
      )}
    </main>
  );
}
