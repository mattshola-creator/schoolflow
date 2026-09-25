import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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
      <Link href="/admissions" className="text-brand text-sm font-medium">
        ← Admissions
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="New application"
          title="Applicant and guardian details"
          description="This creates an applicant identity only. A student record is created later through controlled enrollment conversion."
        />
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
        className="mt-7 max-w-3xl min-w-0 space-y-7"
      >
        <fieldset className="border-border bg-surface grid min-w-0 gap-4 rounded-xl border p-5 sm:grid-cols-2 sm:p-6">
          <legend className="px-2 font-semibold">Application</legend>
          <label className="min-w-0 text-sm font-medium">
            Application number
            <input
              className={`${fieldClass} mt-1`}
              name="applicationNumber"
              required
              placeholder="APP-2026-001"
            />
          </label>
          <label className="min-w-0 text-sm font-medium">
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
          <label className="min-w-0 text-sm font-medium">
            Academic session
            <select className={`${fieldClass} mt-1`} name="sessionId" required>
              {options.sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 text-sm font-medium">
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
        <fieldset className="border-border bg-surface grid min-w-0 gap-4 rounded-xl border p-5 sm:grid-cols-2 sm:p-6">
          <legend className="px-2 font-semibold">Applicant</legend>
          <label className="min-w-0 text-sm font-medium">
            First name
            <input className={`${fieldClass} mt-1`} name="firstName" required />
          </label>
          <label className="min-w-0 text-sm font-medium">
            Last name
            <input className={`${fieldClass} mt-1`} name="lastName" required />
          </label>
          <label className="min-w-0 text-sm font-medium">
            Date of birth
            <input
              className={`${fieldClass} mt-1`}
              name="dateOfBirth"
              type="date"
              required
            />
          </label>
          <label className="min-w-0 text-sm font-medium">
            Gender
            <select
              className={`${fieldClass} mt-1`}
              name="gender"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </label>
          <label className="min-w-0 text-sm font-medium sm:col-span-2">
            Previous class (optional)
            <input className={`${fieldClass} mt-1`} name="previousClass" />
          </label>
        </fieldset>
        <fieldset className="border-border bg-surface grid min-w-0 gap-4 rounded-xl border p-5 sm:grid-cols-2 sm:p-6">
          <legend className="px-2 font-semibold">Primary guardian</legend>
          <label className="min-w-0 text-sm font-medium">
            First name
            <input
              className={`${fieldClass} mt-1`}
              name="guardianFirstName"
              required
            />
          </label>
          <label className="min-w-0 text-sm font-medium">
            Last name
            <input
              className={`${fieldClass} mt-1`}
              name="guardianLastName"
              required
            />
          </label>
          <label className="min-w-0 text-sm font-medium">
            Relationship
            <input
              className={`${fieldClass} mt-1`}
              name="guardianRelationship"
              placeholder="Mother, father, guardian"
              required
            />
          </label>
          <label className="min-w-0 text-sm font-medium">
            Email
            <input
              className={`${fieldClass} mt-1`}
              name="guardianEmail"
              type="email"
            />
          </label>
          <label className="min-w-0 text-sm font-medium">
            Phone
            <input
              className={`${fieldClass} mt-1`}
              name="guardianPhone"
              type="tel"
            />
          </label>
        </fieldset>
        <Button className="w-full sm:w-auto" size="large" type="submit">
          Create application
        </Button>
      </form>
    </main>
  );
}
