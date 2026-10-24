import Link from "next/link";
import {
  ExecutiveHeader,
  ExecutiveMetric,
} from "@/components/operational/premium";
import type { CSSProperties } from "react";
import type { OwnerDashboardDTO } from "./service";
import { ProgressCard } from "@/features/showroom/charts";
import { attendanceRate } from "@/features/reporting/metrics";

const panel = "min-w-0 rounded-2xl border p-5 shadow-sm sm:p-6";
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
      <ExecutiveHeader
        eyebrow="Organization Owner · selected school"
        title={`${data.schoolName} overview`}
        context={`${data.organizationName} · ${data.sessionName} · ${data.periodName}`}
      >
        <p className="text-sm leading-6">
          Your school’s priorities, people and operations in one place.
        </p>
      </ExecutiveHeader>
      <details className="rounded-xl border p-3 text-sm">
        <summary className="cursor-pointer font-medium">
          Appearance & display options
        </summary>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
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
      </details>
      <nav aria-label="Owner quick actions" className="flex flex-wrap gap-3">
        <Link
          href="/workspaces"
          className="min-h-11 rounded-xl border px-4 py-3 font-medium"
        >
          My workspaces
        </Link>
        {visibility.finance ? (
          <Link
            href="/finance/overview"
            className="min-h-11 rounded-xl border px-4 py-3 font-medium"
          >
            Finance overview
          </Link>
        ) : null}
        {visibility.work ? (
          <Link
            href="/action-center"
            className="min-h-11 rounded-xl border px-4 py-3 font-medium"
          >
            Review my work
          </Link>
        ) : null}
      </nav>
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
          <ExecutiveMetric
            title="Active enrollments"
            value={summary.activeEnrollments.toLocaleString()}
          >
            <p>
              Active enrollment rows · {data.sessionName}. Not unique learners.
            </p>
          </ExecutiveMetric>
        ) : null}
        {summary.attendance ? (
          <ExecutiveMetric
            title="Recorded attendance"
            value={attendanceRate(
              summary.attendance.presentIncludingLate,
              summary.attendance.recordedMarks,
            )}
          >
            <p>
              Present plus late: {summary.attendance.presentIncludingLate} /{" "}
              {summary.attendance.recordedMarks} recorded marks.
            </p>
            <details className="mt-2">
              <summary className="min-h-11 cursor-pointer py-2 underline underline-offset-4 focus-visible:outline-2">
                Period & metric definition
              </summary>
              <p>
                {data.reportingWindow?.from} through {data.reportingWindow?.to},
                inclusive · {data.sessionName}. Date/session scoped, not
                period-filtered. Missing marks do not count as absences.
              </p>
            </details>
          </ExecutiveMetric>
        ) : null}
        {summary.publicationVersions !== undefined ? (
          <ExecutiveMetric
            title="Published batch versions"
            value={summary.publicationVersions.toLocaleString()}
            href="/assessments"
            linkLabel="Open Assessment"
          >
            <p>
              Publication rows, including historical versions ·{" "}
              {data.sessionName} · {data.periodName}. Not unique learners or
              current batch count.
            </p>
          </ExecutiveMetric>
        ) : null}
      </section>
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-2">
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
