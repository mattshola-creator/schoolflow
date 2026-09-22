import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { loadAdmissionOptions } from "@/features/admissions/service";
import { createAdmissionApplication } from "../actions";

export default async function NewAdmissionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, options] = await Promise.all([
    searchParams,
    loadAdmissionOptions(),
  ]);
  return (
    <main className="py-10 sm:py-12">
      <Link href="/admissions" className="text-sm font-medium text-emerald-800">
        ← Admissions
      </Link>
      <div className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold text-emerald-800">
          New application
        </p>
        <h1 className="mt-1 text-3xl font-semibold">
          Applicant and guardian details
        </h1>
        <p className="mt-2 text-slate-600">
          This creates an applicant identity only. A student record is created
          later through controlled enrollment conversion.
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-5 max-w-3xl rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <form
        action={createAdmissionApplication}
        className="mt-7 max-w-3xl space-y-7"
      >
        <fieldset className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
          <legend className="px-2 font-semibold">Application</legend>
          <label className="text-sm font-medium">
            Application number
            <input
              className={`${fieldClass} mt-1`}
              name="applicationNumber"
              required
              placeholder="APP-2026-001"
            />
          </label>
          <label className="text-sm font-medium">
            Source
            <select
              className={`${fieldClass} mt-1`}
              name="source"
              defaultValue="staff"
            >
              <option value="staff">Staff entered</option>
              <option value="enquiry">Enquiry</option>
              <option value="parent_online">Parent online</option>
              <option value="import">Controlled import</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Academic session
            <select className={`${fieldClass} mt-1`} name="sessionId" required>
              {options.sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Applied class level
            <select className={`${fieldClass} mt-1`} name="levelId" required>
              {options.levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
        <fieldset className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
          <legend className="px-2 font-semibold">Applicant</legend>
          <label className="text-sm font-medium">
            First name
            <input className={`${fieldClass} mt-1`} name="firstName" required />
          </label>
          <label className="text-sm font-medium">
            Last name
            <input className={`${fieldClass} mt-1`} name="lastName" required />
          </label>
          <label className="text-sm font-medium">
            Date of birth
            <input
              className={`${fieldClass} mt-1`}
              name="dateOfBirth"
              type="date"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Gender
            <input className={`${fieldClass} mt-1`} name="gender" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Previous class (optional)
            <input className={`${fieldClass} mt-1`} name="previousClass" />
          </label>
        </fieldset>
        <fieldset className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
          <legend className="px-2 font-semibold">Guardian (optional)</legend>
          <label className="text-sm font-medium">
            First name
            <input className={`${fieldClass} mt-1`} name="guardianFirstName" />
          </label>
          <label className="text-sm font-medium">
            Last name
            <input className={`${fieldClass} mt-1`} name="guardianLastName" />
          </label>
          <label className="text-sm font-medium">
            Relationship
            <input
              className={`${fieldClass} mt-1`}
              name="guardianRelationship"
              placeholder="Mother, father, guardian"
            />
          </label>
          <label className="text-sm font-medium">
            Email
            <input
              className={`${fieldClass} mt-1`}
              name="guardianEmail"
              type="email"
            />
          </label>
          <label className="text-sm font-medium">
            Phone
            <input
              className={`${fieldClass} mt-1`}
              name="guardianPhone"
              type="tel"
            />
          </label>
        </fieldset>
        <button className="rounded-lg bg-emerald-800 px-5 py-3 text-sm font-semibold text-white">
          Create application
        </button>
      </form>
    </main>
  );
}
