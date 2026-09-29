import { Clock3, Settings2 } from "lucide-react";
import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  loadStaffClockCorrections,
  loadStaffClockWorkspace,
} from "@/features/attendance/service";
import { correctStaffClock, recordStaffClock } from "./actions";

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function localTime(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    error?: string;
    message?: string;
  }>;
}) {
  const notice = await searchParams;
  const date = notice.date ?? localDate();
  const workspace = await loadStaffClockWorkspace(date).catch(() => null);
  if (!workspace)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Staff attendance is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school workspace. Staff attendance must be
          enabled before the clock can be used.
        </p>
      </main>
    );

  const canConfigure = workspace.authorization.permissions.includes(
    "attendance.configure",
  );
  const canCorrect = workspace.authorization.permissions.includes(
    "attendance.staff.correct",
  );
  const correctionEvents = canCorrect
    ? await loadStaffClockCorrections(date).catch(() => [])
    : [];
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Staff attendance"
        title={`Staff clock at ${workspace.active.schoolName}`}
        description="Record arrival and departure against the applicable school or position working-hours policy."
        actions={
          canConfigure ? (
            <ButtonLink href="/attendance/staff/setup" variant="secondary">
              <Settings2 aria-hidden="true" className="size-4" />
              Working-hours setup
            </ButtonLink>
          ) : undefined
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
        method="get"
        className="mt-7 max-w-sm rounded-xl border bg-white p-5"
      >
        <label className="text-sm font-medium">
          Attendance date
          <input
            className={fieldClass}
            type="date"
            name="date"
            defaultValue={date}
            required
          />
        </label>
        <Button className="mt-4 w-full" type="submit" variant="secondary">
          View date
        </Button>
      </form>

      {!workspace.assignments.length ? (
        <p className="mt-6 rounded-xl border bg-white p-8 text-center text-slate-600">
          No active staff assignment is available for this account and date.
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 xl:grid-cols-2">
          {workspace.assignments.map((assignment) => {
            const isToday = date === localDate();
            const nextEvent = !assignment.clock_in_at
              ? "clock_in"
              : !assignment.clock_out_at
                ? "clock_out"
                : null;
            return (
              <li
                key={assignment.staff_assignment_id}
                className="min-w-0 rounded-xl border bg-white p-5 sm:p-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="bg-brand-soft text-brand rounded-lg p-2">
                    <Clock3 aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold break-words">
                      {assignment.staff_name}
                    </h2>
                    <p className="mt-1 text-sm [overflow-wrap:anywhere] text-slate-500">
                      {assignment.staff_number} · {assignment.position_name}
                    </p>
                  </div>
                </div>
                {assignment.policy_name ? (
                  <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm">
                    <p className="font-semibold">{assignment.policy_name}</p>
                    <p className="mt-1 text-slate-600">
                      {assignment.policy_starts_at.slice(0, 5)}–
                      {assignment.policy_ends_at.slice(0, 5)} ·{" "}
                      {assignment.policy_grace_minutes} minute grace
                    </p>
                  </div>
                ) : (
                  <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
                    A working-hours policy must be configured before clocking.
                  </p>
                )}
                {assignment.approved_time_off_kind ? (
                  <div
                    className={`mt-4 rounded-lg p-4 text-sm ${assignment.is_excused ? "bg-emerald-50 text-emerald-900" : "bg-sky-50 text-sky-900"}`}
                  >
                    <p className="font-semibold capitalize">
                      Approved {assignment.approved_time_off_kind}
                    </p>
                    <p className="mt-1">
                      {assignment.is_excused
                        ? "The approved request covers the complete scheduled work interval. No clock action is required."
                        : "This approved request covers part of the day. Normal clock requirements still apply."}
                    </p>
                  </div>
                ) : null}
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Clock in</dt>
                    <dd className="mt-1 font-semibold">
                      {localTime(assignment.clock_in_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Clock out</dt>
                    <dd className="mt-1 font-semibold">
                      {localTime(assignment.clock_out_at)}
                    </dd>
                  </div>
                </dl>
                {nextEvent &&
                isToday &&
                assignment.policy_name &&
                !assignment.is_excused ? (
                  <form action={recordStaffClock} className="mt-5">
                    <input
                      type="hidden"
                      name="staffAssignmentId"
                      value={assignment.staff_assignment_id}
                    />
                    <input type="hidden" name="eventType" value={nextEvent} />
                    <input
                      type="hidden"
                      name="idempotencyKey"
                      value={crypto.randomUUID()}
                    />
                    <label className="text-sm font-medium">
                      Note <span className="text-slate-500">(optional)</span>
                      <input
                        className={fieldClass}
                        name="note"
                        maxLength={500}
                      />
                    </label>
                    <Button className="mt-4 w-full" type="submit">
                      {nextEvent === "clock_in" ? "Clock in" : "Clock out"}
                    </Button>
                  </form>
                ) : nextEvent && !isToday && !assignment.is_excused ? (
                  <p className="mt-5 text-sm text-slate-600">
                    Historical dates are read-only.
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {canCorrect && correctionEvents.length ? (
        <section className="mt-10" aria-labelledby="staff-corrections-heading">
          <h2
            id="staff-corrections-heading"
            className="text-xl font-semibold text-slate-950"
          >
            Controlled clock corrections
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Correct an existing event with an audit reason. Original clock
            evidence remains immutable.
          </p>
          <ul className="mt-5 grid gap-5 xl:grid-cols-2">
            {correctionEvents.map((event) => (
              <li
                key={event.clock_event_id}
                className="min-w-0 rounded-xl border bg-white p-5 sm:p-6"
              >
                <h3 className="font-semibold break-words">
                  {event.staff_name}
                </h3>
                <p className="mt-1 text-sm [overflow-wrap:anywhere] text-slate-500">
                  {event.staff_number} · {event.position_name}
                </p>
                <p className="mt-4 text-sm text-slate-700">
                  {event.event_type === "clock_in" ? "Clock in" : "Clock out"}:{" "}
                  {localTime(event.effective_occurred_at)}
                </p>
                <form action={correctStaffClock} className="mt-4 space-y-4">
                  <input
                    type="hidden"
                    name="clockEventId"
                    value={event.clock_event_id}
                  />
                  <input
                    type="hidden"
                    name="attendanceDate"
                    value={event.attendance_date}
                  />
                  <label className="block text-sm font-medium">
                    Corrected time
                    <input
                      className={fieldClass}
                      type="time"
                      name="correctedTime"
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Audit reason
                    <textarea
                      className={fieldClass}
                      name="reason"
                      minLength={3}
                      maxLength={500}
                      required
                    />
                  </label>
                  <Button className="w-full" type="submit" variant="secondary">
                    Save correction
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
