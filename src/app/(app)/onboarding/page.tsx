import { buttonClass, fieldClass } from "@/components/auth-card";
import { createOrganization } from "./actions";
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-semibold">Set up your organization</h1>
      <p className="mt-2 text-slate-600">
        This creates the tenant, first location, and first school atomically.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <form
        action={createOrganization}
        className="mt-8 grid gap-5 rounded-xl border bg-white p-6"
      >
        <label className="text-sm font-medium">
          Organization name
          <input className={fieldClass} name="organizationName" required />
        </label>
        <label className="text-sm font-medium">
          Workspace slug
          <input
            className={fieldClass}
            name="organizationSlug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label className="text-sm font-medium">
          Location name
          <input className={fieldClass} name="locationName" required />
        </label>
        <label className="text-sm font-medium">
          School name
          <input className={fieldClass} name="schoolName" required />
        </label>
        <label className="text-sm font-medium">
          School code
          <input className={fieldClass} name="schoolCode" required />
        </label>
        <button className={buttonClass}>Create organization</button>
      </form>
    </main>
  );
}
