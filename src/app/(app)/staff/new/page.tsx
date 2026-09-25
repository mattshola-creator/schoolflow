import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { employmentTypes } from "@/features/staff/schemas";
import { loadStaffFormOptions } from "@/features/staff/service";
import { createStaff } from "../actions";

export default async function NewStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const options = await loadStaffFormOptions().catch(() => null);
  if (!options)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Staff creation unavailable</h1>
      </main>
    );
  return (
    <main className="py-10 sm:py-12">
      <Link href="/staff" className="text-sm font-medium text-emerald-800">
        ← Staff
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Staff records"
          title="Add a staff member"
          description="Creates identity, employment, and first school assignment atomically."
        />
      </div>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {!options.positions.length ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold">A position is required</h2>
          <p className="mt-1 text-sm">
            Configure at least one active position before adding staff.
          </p>
          <ButtonLink className="mt-3" href="/staff/setup" variant="secondary">
            Open staff setup →
          </ButtonLink>
        </div>
      ) : (
        <form
          action={createStaff}
          className="border-border bg-surface mt-6 grid min-w-0 gap-6 rounded-xl border p-5 sm:p-6"
        >
          <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">Staff identity</legend>
            <label className="min-w-0 text-sm font-medium">
              First name
              <input className={fieldClass} name="firstName" required />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Last name
              <input className={fieldClass} name="lastName" required />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Staff number
              <input
                className={fieldClass}
                name="staffNumber"
                placeholder="SF/STAFF/001"
                required
              />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Work email (optional)
              <input className={fieldClass} name="workEmail" type="email" />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Phone (optional)
              <input className={fieldClass} name="phone" />
            </label>
          </fieldset>
          <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">
              Employment and assignment
            </legend>
            <label className="min-w-0 text-sm font-medium">
              Employment type
              <select className={fieldClass} name="employmentType">
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 text-sm font-medium">
              Started on
              <input
                className={fieldClass}
                name="startedOn"
                type="date"
                required
              />
            </label>
            <label className="min-w-0 text-sm font-medium">
              Department
              <select className={fieldClass} name="departmentId">
                <option value="">No department</option>
                {options.departments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 text-sm font-medium">
              Position
              <select className={fieldClass} name="positionId" required>
                {options.positions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
          {options.authorization.permissions.includes(
            "staff.access.manage",
          ) && (
            <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
              <legend className="mb-3 font-semibold">
                Application access (optional)
              </legend>
              <p className="text-muted-foreground text-sm font-medium sm:col-span-2">
                Link an existing active organization member and a school-scoped
                role. This does not create an Auth user.
              </p>
              <label className="min-w-0 text-sm font-medium">
                Organization member
                <select className={fieldClass} name="linkedUserId">
                  <option value="">No account link</option>
                  {options.memberships.map((item) => (
                    <option key={item.user_id} value={item.user_id}>
                      {item.display_name} · {item.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-0 text-sm font-medium">
                Role
                <select className={fieldClass} name="linkedRoleId">
                  <option value="">No linked role</option>
                  {options.roles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
          )}
          <Button className="w-full sm:w-auto" type="submit">
            Create staff record
          </Button>
        </form>
      )}
    </main>
  );
}
