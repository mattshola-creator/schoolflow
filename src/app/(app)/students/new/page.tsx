import { fieldClass } from "@/components/auth-card";
import { loadStudentFormOptions } from "@/features/students/service";
import { createStudent } from "../actions";

const button =
  "rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900";

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const options = await loadStudentFormOptions().catch(() => null);
  if (!options)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Student creation unavailable</h1>
      </main>
    );
  return (
    <main className="py-10 sm:py-12">
      <p className="text-sm font-semibold text-emerald-800">Student records</p>
      <h1 className="mt-1 text-3xl font-semibold">Add a student</h1>
      <p className="mt-2 text-slate-600">
        Creates permanent identity, enrollment, placement, and an optional
        guardian atomically.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {!options.sessions.length || !options.levels.length ? (
        <div className="mt-6 rounded-xl border bg-amber-50 p-5">
          <h2 className="font-semibold">Academic setup required</h2>
          <p className="mt-1 text-sm">
            Create an academic session and class level before enrolling
            students.
          </p>
        </div>
      ) : (
        <form
          action={createStudent}
          className="mt-6 grid gap-6 rounded-xl border bg-white p-5 sm:p-6"
        >
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">Student identity</legend>
            <label className="text-sm font-medium">
              First name
              <input className={fieldClass} name="firstName" required />
            </label>
            <label className="text-sm font-medium">
              Last name
              <input className={fieldClass} name="lastName" required />
            </label>
            <label className="text-sm font-medium">
              Student number
              <input
                className={fieldClass}
                name="studentNumber"
                placeholder="SF-2026-001"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Date of birth
              <input
                className={fieldClass}
                name="dateOfBirth"
                type="date"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Gender (optional)
              <input className={fieldClass} name="gender" />
            </label>
          </fieldset>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">
              Enrollment and placement
            </legend>
            <label className="text-sm font-medium">
              Academic session
              <select className={fieldClass} name="sessionId" required>
                {options.sessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Enrolled on
              <input
                className={fieldClass}
                name="enrolledOn"
                type="date"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Class level
              <select className={fieldClass} name="levelId" required>
                {options.levels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Class arm (optional)
              <select className={fieldClass} name="armId">
                <option value="">No arm</option>
                {options.arms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">Guardian (optional)</legend>
            <label className="text-sm font-medium">
              First name
              <input className={fieldClass} name="guardianFirstName" />
            </label>
            <label className="text-sm font-medium">
              Last name
              <input className={fieldClass} name="guardianLastName" />
            </label>
            <label className="text-sm font-medium">
              Relationship
              <input
                className={fieldClass}
                name="guardianRelationship"
                placeholder="Mother, uncle, sponsor…"
              />
            </label>
            <div className="flex flex-col justify-end gap-2 text-sm">
              <label>
                <input
                  className="mr-2"
                  type="checkbox"
                  name="guardianPrimary"
                />
                Primary contact
              </label>
              <label>
                <input
                  className="mr-2"
                  type="checkbox"
                  name="guardianFinancial"
                />
                Financially responsible
              </label>
            </div>
          </fieldset>
          <button className={button}>Create student record</button>
        </form>
      )}
    </main>
  );
}
