import Link from "next/link";
import { notFound } from "next/navigation";
import { loadStudent } from "@/features/students/service";

const panel = "rounded-xl border bg-white p-5 sm:p-6";

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
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Student 360</p>
          <h1 className="mt-1 text-3xl font-semibold">
            {person.first_name} {person.last_name}
          </h1>
          <p className="mt-2 text-slate-600">
            {record.profile.student_number} ·{" "}
            <span className="capitalize">
              {record.profile.status.replace("_", " ")}
            </span>
          </p>
        </div>
        <p className="text-sm text-slate-500">{record.active.schoolName}</p>
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
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Date of birth</dt>
              <dd className="font-medium">
                {record.profile.date_of_birth ?? "Not recorded"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Gender</dt>
              <dd className="font-medium">
                {record.profile.gender ?? "Not recorded"}
              </dd>
            </div>
          </dl>
        </section>
        <section className={panel}>
          <h2 className="text-lg font-semibold">Guardians</h2>
          {record.guardians.length ? (
            <ul className="mt-4 space-y-3">
              {record.guardians.map((guardian) => (
                <li
                  key={guardian.id}
                  className="rounded-lg bg-slate-50 p-3 text-sm"
                >
                  <span className="font-semibold">
                    {guardian.people.first_name} {guardian.people.last_name}
                  </span>
                  <span className="block text-slate-500">
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
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">
                    {enrollment.academic_sessions.name}
                  </span>
                  <span className="text-sm text-slate-500 capitalize">
                    {enrollment.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Enrolled {enrollment.enrolled_on}
                  {enrollment.ended_on ? ` · Ended ${enrollment.ended_on}` : ""}
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {enrollment.class_memberships.map((placement) => (
                    <li key={placement.id} className="bg-slate-50 px-3 py-2">
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
