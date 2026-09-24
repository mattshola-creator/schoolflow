import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailItem, DetailList } from "@/components/ui/detail-list";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { loadStudent } from "@/features/students/service";

const panel = "border-border bg-surface rounded-xl border p-5 sm:p-6";

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const { studentId } = await params;
  const { message } = await searchParams;
  const record = await loadStudent(studentId).catch(() => null);
  if (!record) notFound();
  const person = record.profile.people;
  return (
    <main className="py-10 sm:py-12">
      <Link href="/students" className="text-sm font-medium text-emerald-800">
        ← Students
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Student 360"
          title={
            <span className="break-words">
              {person.first_name} {person.last_name}
            </span>
          }
          description={
            <span className="block [overflow-wrap:anywhere]">
              {record.profile.student_number} · {record.active.schoolName}
            </span>
          }
          actions={
            <StatusBadge tone="success" className="capitalize">
              {record.profile.status.replace("_", " ")}
            </StatusBadge>
          }
        />
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
          <h2 className="text-lg font-semibold">Profile</h2>
          <DetailList className="mt-4">
            <DetailItem label="Date of birth">
              {record.profile.date_of_birth ?? "Not recorded"}
            </DetailItem>
            <DetailItem label="Gender">
              {record.profile.gender ?? "Not recorded"}
            </DetailItem>
          </DetailList>
        </section>
        <section className={panel}>
          <h2 className="text-lg font-semibold">Guardians</h2>
          {record.guardians.length ? (
            <ul className="mt-4 space-y-3">
              {record.guardians.map((guardian) => (
                <li
                  key={guardian.id}
                  className="bg-surface-subtle min-w-0 rounded-lg p-3 text-sm"
                >
                  <span className="font-semibold">
                    {guardian.people.first_name} {guardian.people.last_name}
                  </span>
                  <span className="text-muted-foreground block font-medium break-words">
                    {guardian.relationship_type}
                    {guardian.is_primary_contact ? " · Primary contact" : ""}
                    {guardian.is_financially_responsible
                      ? " · Financially responsible"
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No guardian relationship recorded.
            </p>
          )}
        </section>
        <section className={`${panel} lg:col-span-2`}>
          <h2 className="text-lg font-semibold">
            Enrollment and class history
          </h2>
          <ul className="mt-4 space-y-4">
            {record.enrollments.map((enrollment) => (
              <li key={enrollment.id} className="rounded-lg border p-4">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <span className="min-w-0 font-semibold break-words">
                    {enrollment.academic_sessions.name}
                  </span>
                  <StatusBadge tone="success" className="capitalize">
                    {enrollment.status}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Enrolled {enrollment.enrolled_on}
                  {enrollment.ended_on ? ` · Ended ${enrollment.ended_on}` : ""}
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {enrollment.class_memberships.map((placement) => (
                    <li
                      key={placement.id}
                      className="bg-surface-subtle px-3 py-2 break-words"
                    >
                      {placement.class_levels.name}
                      {placement.class_arms
                        ? ` · ${placement.class_arms.name}`
                        : ""}{" "}
                      · {placement.started_on}
                      {placement.ended_on
                        ? ` to ${placement.ended_on}`
                        : " to present"}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
