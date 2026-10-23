import Link from "next/link";
import type { CSSProperties } from "react";
import type { OwnerDashboardDTO } from "./service";
import { ProgressCard } from "@/features/showroom/charts";
import { attendanceRate } from "@/features/reporting/metrics";

const panel = "min-w-0 rounded-2xl border p-5";
const surface = {
  background: "var(--shell-surface,white)",
  color: "var(--shell-ink,#17211d)",
  borderColor: "var(--shell-border,#d8e0dc)",
};
const chartStyle = {
  "--sf-surface": "var(--shell-surface,white)",
  "--sf-ink": "var(--shell-ink,#17211d)",
  "--sf-muted": "var(--shell-muted,#52615a)",
  "--sf-border": "var(--shell-border,#d8e0dc)",
  "--sf-primary": "var(--shell-primary,#087C57)",
  "--sf-on-primary": "var(--shell-primary-ink,white)",
  "--sf-accent": "#D6AE62",
} as CSSProperties;
export function OwnerDashboard({ data }: { data: OwnerDashboardDTO }) {
  const { summary, visibility } = data;
  return (
    <main
      aria-label="Organization Owner dashboard"
      className="min-w-0 space-y-6 py-4"
      style={{ color: "var(--shell-ink,#17211d)" }}
    >
      <header
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: "var(--shell-nav,#073D2B)",
          color: "var(--shell-nav-ink,white)",
        }}
      >
        <p className="text-sm font-medium">
          Organization Owner · selected school
        </p>
        <h1 className="mt-2 text-3xl font-semibold break-words">
          {data.schoolName} overview
        </h1>
        <p className="mt-3 break-words">
          {data.organizationName} · {data.sessionName} · {data.periodName}
        </p>
        <p className="mt-2 text-sm">
          Authorized school records. No cross-school comparisons.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/dashboard?appearance=legacy"
          className="min-h-11 rounded-lg border px-4 py-3 underline"
        >
          Use legacy dashboard
        </Link>
        <Link
          href="?appearance=legacy"
          className="min-h-11 rounded-lg border px-4 py-3 underline"
        >
          Disable appearance opt-in
        </Link>
        <Link
          href="?appearance=premium"
          className="min-h-11 rounded-lg border px-4 py-3 underline"
        >
          Enable appearance
        </Link>
      </div>
      {data.reportingError ? (
        <p role="alert">
          School reporting could not be loaded. No zero values are inferred.
        </p>
      ) : null}
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Permitted school summaries"
      >
        {summary.activeEnrollments !== undefined ? (
          <article className={panel} style={surface}>
            <h2>Active enrollments</h2>
            <p className="my-2 text-3xl font-semibold">
              {summary.activeEnrollments.toLocaleString()}
            </p>
            <p className="text-sm">
              Active enrollment rows · {data.sessionName}. Not unique learners.
            </p>
          </article>
        ) : null}
        {summary.attendance ? (
          <article className={panel} style={surface}>
            <h2>Recorded attendance</h2>
            <p className="my-2 text-3xl font-semibold">
              {attendanceRate(
                summary.attendance.presentIncludingLate,
                summary.attendance.recordedMarks,
              )}
            </p>
            <p className="text-sm">
              Present plus late: {summary.attendance.presentIncludingLate} /{" "}
              {summary.attendance.recordedMarks} recorded marks.
            </p>
            <p className="mt-2 text-sm">
              {data.reportingWindow?.from} through {data.reportingWindow?.to},
              inclusive · {data.sessionName}. Date/session scoped, not
              period-filtered.
            </p>
          </article>
        ) : null}
        {summary.publicationVersions !== undefined ? (
          <article className={panel} style={surface}>
            <h2>Published batch versions</h2>
            <p className="my-2 text-3xl font-semibold">
              {summary.publicationVersions.toLocaleString()}
            </p>
            <p className="text-sm">
              Publication rows, including historical versions ·{" "}
              {data.sessionName} · {data.periodName}. Not unique learners or
              current batch count.
            </p>
            <Link className="mt-3 inline-block underline" href="/assessments">
              Open Assessment
            </Link>
          </article>
        ) : null}
      </section>
      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        {summary.attendance ? (
          <div style={chartStyle}>
            <ProgressCard
              dataKind="authorized"
              title="Recorded-mark attendance"
              description="Present plus late divided by recorded marks. Missing marks do not count as absences. Session and date scoped; the reporting source does not apply the selected period to attendance."
              period={`${data.reportingWindow?.from} through ${data.reportingWindow?.to} inclusive`}
              numerator={summary.attendance.presentIncludingLate}
              denominator={summary.attendance.recordedMarks}
            />
          </div>
        ) : null}
        {visibility.finance ? (
          <section className={panel} style={surface}>
            <h2 className="text-xl font-semibold">School Finance</h2>
            {data.financeError ? (
              <p role="alert" className="mt-3">
                Finance could not be loaded.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm">
                  Separate currency totals from the existing Finance overview.
                  SaaS subscription billing is excluded.
                </p>
                {Object.entries(data.finance?.collectionsByCurrency ?? {}).map(
                  ([currency, value]) => (
                    <p className="mt-3" key={currency}>
                      Verified receipts · {currency}:{" "}
                      <strong>
                        {value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                      <span className="block text-sm">
                        Existing Finance rolling window, from{" "}
                        {data.finance?.windowStart}; all academic periods.
                      </span>
                    </p>
                  ),
                )}
                {Object.entries(data.finance?.outstandingByCurrency ?? {}).map(
                  ([currency, value]) => (
                    <p className="mt-3" key={currency}>
                      Current outstanding · {currency}:{" "}
                      <strong>
                        {value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                      <span className="block text-sm">
                        Current balance; not limited to the reporting window.
                      </span>
                    </p>
                  ),
                )}
                {data.finance?.pendingPayments !== undefined ? (
                  <p className="mt-3">
                    Awaiting independent verification:{" "}
                    {data.finance.pendingPayments}
                  </p>
                ) : null}
              </>
            )}
            <Link
              className="mt-4 inline-block underline"
              href="/finance/overview"
            >
              Open permitted Finance overview
            </Link>
          </section>
        ) : null}
        {visibility.work ? (
          <section className={panel} style={surface}>
            <h2 className="text-xl font-semibold">
              Pending work and exceptions
            </h2>
            {data.workError ? (
              <p role="alert">Your work could not be loaded.</p>
            ) : data.work ? (
              <>
                <p className="mt-2">
                  {data.work.counts.tasks} open tasks ·{" "}
                  {data.work.counts.approvals !== undefined
                    ? `${data.work.counts.approvals} pending approvals · `
                    : ""}{" "}
                  {data.work.counts.urgent} high/urgent tasks
                </p>
                <ul className="mt-4 space-y-3">
                  {data.work.tasks.map((task) => (
                    <li key={`${task.kind}-${task.id}`}>
                      <Link
                        className="block min-h-11 rounded-lg border p-3 underline"
                        href={task.href}
                      >
                        {task.title}
                        <span className="block text-sm no-underline">
                          {task.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {!data.work.tasks.length ? (
                  <p className="mt-3">
                    No pending work returned for this scope.
                  </p>
                ) : null}
              </>
            ) : null}
            <Link className="mt-4 inline-block underline" href="/action-center">
              Open Action Center
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}
