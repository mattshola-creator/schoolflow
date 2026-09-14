import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { employmentTypes } from "@/features/staff/schemas";
import { loadStaffFormOptions } from "@/features/staff/service";
import { createStaff } from "../actions";

const button =
  "rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white";

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
      <p className="mt-4 text-sm font-semibold text-emerald-800">
        Staff records
      </p>
      <h1 className="mt-1 text-3xl font-semibold">Add a staff member</h1>
      <p className="mt-2 text-slate-600">
        Creates identity, employment, and first school assignment atomically.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {!options.positions.length ? (
        <div className="mt-6 rounded-xl border bg-amber-50 p-5">
          <h2 className="font-semibold">A position is required</h2>
          <p className="mt-1 text-sm">
            Configure at least one active position before adding staff.
          </p>
          <Link
            href="/staff/setup"
            className="mt-3 inline-block text-sm font-semibold text-emerald-900"
          >
            Open staff setup →
          </Link>
        </div>
      ) : (
        <form
          action={createStaff}
          className="mt-6 grid gap-6 rounded-xl border bg-white p-5 sm:p-6"
        >
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">Staff identity</legend>
            <label className="text-sm font-medium">
              First name
              <input className={fieldClass} name="firstName" required />
            </label>
            <label className="text-sm font-medium">
              Last name
              <input className={fieldClass} name="lastName" required />
            </label>
            <label className="text-sm font-medium">
              Staff number
              <input
                className={fieldClass}
                name="staffNumber"
                placeholder="SF/STAFF/001"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Work email (optional)
              <input className={fieldClass} name="workEmail" type="email" />
            </label>
            <label className="text-sm font-medium">
              Phone (optional)
              <input className={fieldClass} name="phone" />
            </label>
          </fieldset>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-semibold">
              Employment and assignment
            </legend>
            <label className="text-sm font-medium">
              Employment type
              <select className={fieldClass} name="employmentType">
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Started on
              <input
                className={fieldClass}
                name="startedOn"
                type="date"
                required
              />
            </label>
            <label className="text-sm font-medium">
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
            <label className="text-sm font-medium">
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
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 font-semibold">
                Application access (optional)
              </legend>
              <p className="text-sm text-slate-600 sm:col-span-2">
                Link an existing active organization member and a school-scoped
                role. This does not create an Auth user.
              </p>
              <label className="text-sm font-medium">
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
              <label className="text-sm font-medium">
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
          <button className={button}>Create staff record</button>
        </form>
      )}
    </main>
  );
}
