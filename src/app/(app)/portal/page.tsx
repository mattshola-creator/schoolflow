import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusNotice } from "@/components/ui/status-notice";
import { learnerSelectionSchema } from "@/features/communication/schemas";
import {
  loadPortalContext,
  loadPortalDashboard,
} from "@/features/communication/service";

export const dynamic = "force-dynamic";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const contexts = await loadPortalContext();
  const params = await searchParams;
  const first = contexts.flatMap((context) =>
    context.learners.map((learner) => ({
      studentId: learner.studentId,
      schoolId: context.schoolId,
    })),
  )[0];
  const selected = learnerSelectionSchema.safeParse({
    studentId:
      typeof params.student === "string" ? params.student : first?.studentId,
    schoolId:
      typeof params.school === "string" ? params.school : first?.schoolId,
  });
  const allowed =
    selected.success &&
    contexts.some(
      (context) =>
        context.schoolId === selected.data.schoolId &&
        context.learners.some(
          (learner) => learner.studentId === selected.data.studentId,
        ),
    );
  if (!allowed)
    return (
      <div className="py-8">
        <PageHeader
          eyebrow="Portal"
          title="Family and student portal"
          description="Your authorized school information in one place."
        />
        <StatusNotice tone="success">
          No linked learner is available. Ask the school to verify your portal
          relationship.
        </StatusNotice>
      </div>
    );
  const { dashboard, notices } = await loadPortalDashboard(
    selected.data.studentId,
    selected.data.schoolId,
  );
  const balance =
    Number(dashboard.finance.billed ?? 0) - Number(dashboard.finance.paid ?? 0);
  return (
    <div className="space-y-6 py-8">
      <PageHeader
        eyebrow="Portal"
        title={`${dashboard.student.firstName} ${dashboard.student.lastName}`}
        description={`Student number ${dashboard.student.studentNumber}`}
      />
      {contexts.reduce((sum, context) => sum + context.learners.length, 0) >
      1 ? (
        <nav aria-label="Linked learners" className="flex flex-wrap gap-2">
          {contexts.flatMap((context) =>
            context.learners.map((learner) => (
              <Link
                className="min-h-11 rounded-lg border bg-white px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-emerald-700"
                key={`${context.schoolId}:${learner.studentId}`}
                href={`/portal?student=${learner.studentId}&school=${context.schoolId}`}
              >
                {learner.firstName} · {context.schoolName}
              </Link>
            )),
          )}
        </nav>
      ) : null}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="mb-3 text-lg font-semibold">
          At a glance
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Published results", dashboard.publishedResults.length],
            ["Attendance entries", dashboard.attendance.total ?? 0],
            ["Present", dashboard.attendance.present ?? 0],
            [
              "Outstanding (NGN)",
              balance.toLocaleString("en-NG", { minimumFractionDigits: 2 }),
            ],
          ].map(([label, value]) => (
            <article
              className="rounded-xl border bg-white p-4"
              key={String(label)}
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {value}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="mb-3 text-lg font-semibold">
          Published results
        </h2>
        {dashboard.publishedResults.length ? (
          <div className="space-y-3">
            {dashboard.publishedResults.map((result) => (
              <article
                className="rounded-xl border bg-white p-4"
                key={result.publicationId}
              >
                <p className="font-medium">Published report</p>
                <p className="text-sm text-slate-500">
                  {new Date(result.publishedAt).toLocaleDateString("en-NG")}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <StatusNotice tone="success">
            No published result is available. Draft and review data are never
            shown here.
          </StatusNotice>
        )}
      </section>
      <section aria-labelledby="notices-heading">
        <h2 id="notices-heading" className="mb-3 text-lg font-semibold">
          Information center
        </h2>
        {notices.length ? (
          <div className="space-y-3">
            {notices.map((notice) => (
              <article
                className="rounded-xl border bg-white p-4"
                key={notice.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{notice.title}</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                    {notice.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">
                  {notice.body}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <StatusNotice tone="success">
            There are no current notices for this learner.
          </StatusNotice>
        )}
      </section>
    </div>
  );
}
