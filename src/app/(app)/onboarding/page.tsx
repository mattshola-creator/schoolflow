import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { createOrganization } from "./actions";
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Workspace setup"
        title="Set up your organization"
        description="This creates the tenant, first location, and first school atomically."
      />
      {error && (
        <p
          role="alert"
          className="mt-6 max-w-2xl rounded-lg bg-red-50 p-3 text-sm break-words text-red-800"
        >
          {error}
        </p>
      )}
      <form
        action={createOrganization}
        className="mt-8 grid max-w-2xl min-w-0 gap-5 rounded-xl border bg-white p-5 sm:p-6"
      >
        <label className="min-w-0 text-sm font-medium">
          Organization name
          <input className={fieldClass} name="organizationName" required />
        </label>
        <label className="min-w-0 text-sm font-medium">
          Workspace slug
          <input
            className={fieldClass}
            name="organizationSlug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label className="min-w-0 text-sm font-medium">
          Location name
          <input className={fieldClass} name="locationName" required />
        </label>
        <label className="min-w-0 text-sm font-medium">
          School name
          <input className={fieldClass} name="schoolName" required />
        </label>
        <label className="min-w-0 text-sm font-medium">
          School code
          <input className={fieldClass} name="schoolCode" required />
        </label>
        <Button className="w-full" type="submit" size="large">
          Create organization
        </Button>
      </form>
    </main>
  );
}
