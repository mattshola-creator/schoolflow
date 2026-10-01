import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportPrintButton } from "@/components/report-print-button";
import {
  addMoney,
  attendanceRate,
  formatNgn,
} from "@/features/reporting/metrics";
import {
  loadReportingWorkspace,
  searchReporting,
} from "@/features/reporting/service";
import { closeAcademic, rolloverSession } from "./actions";

export const dynamic = "force-dynamic";
const panel = "min-w-0 rounded-xl border bg-white p-4 sm:p-5";
const field = "min-h-11 rounded-lg border bg-white px-3 text-sm";
const sum = (items: Array<Record<string, number>>, key: string) =>
  items.reduce((total, item) => total + Number(item[key] ?? 0), 0);

export default async function ManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const requestedSchools =
    typeof query.schools === "string"
      ? query.schools.split(",").filter(Boolean)
      : undefined;
  const workspace = await loadReportingWorkspace({
    schoolIds: requestedSchools,
    sessionId: typeof query.session === "string" ? query.session : undefined,
    periodId: typeof query.period === "string" ? query.period : undefined,
    dateFrom: typeof query.from === "string" ? query.from : undefined,
    dateTo: typeof query.to === "string" ? query.to : undefined,
  }).catch(() => null);
  if (!workspace)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">
          Management reporting unavailable
        </h1>
        <p className="mt-3 text-slate-600">
          Select an authorized school and enable the reporting workspace.
        </p>
      </main>
    );
  const schools = workspace.dashboard.schools;
  const searches =
    typeof query.q === "string" && query.q.trim().length >= 2
      ? await searchReporting(query.q, workspace.filters.schoolIds).catch(
          () => [],
        )
      : [];
  const students = sum(
    schools.map((x) => x.students),
    "activeEnrollments",
  );
  const attendanceEntries = sum(
    schools.map((x) => x.attendance),
    "entries",
  );
  const present = sum(
    schools.map((x) => x.attendance),
    "present",
  );
  const billed = addMoney(schools.map((x) => x.finance.billed));
  const collected = addMoney(schools.map((x) => x.finance.collected));
  const params = new URLSearchParams({
    schools: workspace.filters.schoolIds.join(","),
    from: workspace.filters.dateFrom,
    to: workspace.filters.dateTo,
  });
  if (workspace.filters.sessionId)
    params.set("session", workspace.filters.sessionId);
  if (workspace.filters.periodId)
    params.set("period", workspace.filters.periodId);
  const canClose = workspace.authorization.permissions.includes(
    "reporting.academic_close",
  );
  return (
    <main className="py-8 sm:py-10">
      <PageHeader
        eyebrow="Management & reporting"
        title="Operational overview"
        description="Deterministic, scope-safe reporting across authorized schools. Financial values retain exact decimal precision."
        actions={
          <>
            <ReportPrintButton />
            <Link
              href={`/api/reports/export?${params}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
            >
              <Download className="size-4" aria-hidden="true" />
              CSV export
            </Link>
          </>
        }
      />
      {query.error || query.message ? (
        <p
          role={query.error ? "alert" : "status"}
          className={`mt-5 rounded-lg p-3 text-sm ${query.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
        >
          {String(query.error ?? query.message)}
        </p>
      ) : null}
      <form
        className={`${panel} mt-6 grid gap-3 md:grid-cols-4`}
        aria-label="Report filters"
      >
        <label className="grid gap-1 text-sm font-medium">
          School
          <select
            name="schools"
            defaultValue={workspace.filters.schoolIds.join(",")}
            className={field}
          >
            {workspace.scope.map((school) => (
              <option key={school.school_id} value={school.school_id}>
                {school.school_name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          From
          <input
            name="from"
            type="date"
            defaultValue={workspace.filters.dateFrom}
            className={field}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          To
          <input
            name="to"
            type="date"
            defaultValue={workspace.filters.dateTo}
            className={field}
          />
        </label>
        <button className="min-h-11 self-end rounded-lg border bg-slate-900 px-4 text-sm font-medium text-white">
          Apply filters
        </button>
      </form>
      {workspace.scope.length > 1 &&
      workspace.scope.every((x) => x.can_cross_school) ? (
        <div
          className="mt-3 flex flex-wrap gap-2"
          aria-label="Authorized school scope"
        >
          {workspace.scope
            .map((school) => (
              <Link
                className="rounded-full border bg-white px-3 py-2 text-sm"
                key={school.school_id}
                href={`/management?schools=${workspace.scope.map((x) => x.school_id).join(",")}&from=${workspace.filters.dateFrom}&to=${workspace.filters.dateTo}`}
              >
                All {workspace.scope.length} authorized schools
              </Link>
            ))
            .slice(0, 1)}
        </div>
      ) : null}
      <section
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Key indicators"
      >
        {[
          ["Active enrollment", students.toLocaleString()],
          ["Attendance rate", attendanceRate(present, attendanceEntries)],
          ["Billed", formatNgn(billed)],
          ["Collected", formatNgn(collected)],
        ].map(([label, value]) => (
          <article className={panel} key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </article>
        ))}
      </section>
      <section className="mt-7" aria-labelledby="school-reports">
        <h2 id="school-reports" className="text-xl font-semibold">
          Standard school reports
        </h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {schools.map((school) => (
            <article className={panel} key={school.schoolId}>
              <h3 className="text-lg font-semibold">{school.schoolName}</h3>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">Applications / enrolled</dt>
                  <dd className="font-medium">
                    {school.admissions.applications} /{" "}
                    {school.admissions.enrolled}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Attendance</dt>
                  <dd className="font-medium">
                    {attendanceRate(
                      school.attendance.present,
                      school.attendance.entries,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Staff assignments</dt>
                  <dd className="font-medium">
                    {school.staff.activeAssignments}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Lessons delivered</dt>
                  <dd className="font-medium">
                    {school.teaching.deliveredLessons}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Outstanding</dt>
                  <dd className="font-medium">
                    {formatNgn(school.finance.outstanding)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Expenses</dt>
                  <dd className="font-medium">
                    {formatNgn(school.finance.expenses)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Published results / passed</dt>
                  <dd className="font-medium">
                    {school.results.publishedResults} /{" "}
                    {school.results.passedResults}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Promotions</dt>
                  <dd className="font-medium">{school.results.promoted}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Notice reads</dt>
                  <dd className="font-medium">
                    {school.communication.noticeReads}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Open / overdue tasks</dt>
                  <dd className="font-medium">
                    {school.operations.openTasks} /{" "}
                    {school.operations.overdueTasks}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section className={`${panel} mt-7`}>
        <h2 className="text-xl font-semibold">
          Permission-aware global search
        </h2>
        <form className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="hidden"
            name="schools"
            value={workspace.filters.schoolIds.join(",")}
          />
          <input
            name="q"
            defaultValue={typeof query.q === "string" ? query.q : ""}
            minLength={2}
            maxLength={100}
            placeholder="Student, applicant, staff, guardian, receipt or document"
            className={`${field} min-w-0 flex-1`}
          />
          <button className="min-h-11 rounded-lg bg-slate-900 px-4 text-white">
            Search
          </button>
        </form>
        {typeof query.q === "string" ? (
          <ul className="mt-4 divide-y" aria-label="Search results">
            {searches.length ? (
              searches.map((item) => (
                <li className="py-3" key={`${item.kind}-${item.id}`}>
                  <span className="font-medium">{item.label}</span>
                  <span className="ml-2 text-sm text-slate-500">
                    {item.kind} · {item.context}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3 text-sm text-slate-500">
                No authorized results found.
              </li>
            )}
          </ul>
        ) : null}
      </section>
      {canClose ? (
        <section className={`${panel} mt-7`}>
          <h2 className="text-xl font-semibold">Academic close and rollover</h2>
          <p className="mt-1 text-sm text-slate-600">
            Closing is locked and audited. Rollover creates a planned session
            and draft fee structures.
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <form action={closeAcademic} className="grid gap-3">
              <h3 className="font-semibold">
                Close a current period or session
              </h3>
              <select className={field} name="targetKind" required>
                <option value="period">Period</option>
                <option value="session">Session</option>
              </select>
              <select className={field} name="targetId" required>
                <option value="">Select target</option>
                {workspace.periods
                  .filter((x) => x.status === "current")
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} (period)
                    </option>
                  ))}
                {workspace.sessions
                  .filter((x) => x.status === "current")
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} (session)
                    </option>
                  ))}
              </select>
              <input
                className={field}
                name="reason"
                minLength={3}
                placeholder="Close reason"
                required
              />
              <button className="min-h-11 rounded-lg border px-4 font-medium">
                Close and lock
              </button>
            </form>
            <form action={rolloverSession} className="grid gap-3">
              <h3 className="font-semibold">Prepare session rollover</h3>
              <select className={field} name="sourceSessionId" required>
                <option value="">Closed source session</option>
                {workspace.sessions
                  .filter((x) => x.status === "closed")
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
              </select>
              <input
                className={field}
                name="targetName"
                placeholder="New session name"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={field}
                  name="targetStart"
                  type="date"
                  required
                />
                <input
                  className={field}
                  name="targetEnd"
                  type="date"
                  required
                />
              </div>
              <input
                type="hidden"
                name="idempotencyKey"
                value={crypto.randomUUID()}
              />
              <button className="min-h-11 rounded-lg bg-emerald-800 px-4 font-medium text-white">
                Prepare draft rollover
              </button>
            </form>
          </div>
        </section>
      ) : null}
    </main>
  );
}
