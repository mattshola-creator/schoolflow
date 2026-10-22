import { EmeraldFoundationPreview } from "@/components/emerald-foundation-preview";
import { requireCapability } from "@/lib/authorization";

export default async function EmeraldDesignPage() {
  await requireCapability({
    permission: "organization.view",
    module: "foundation",
    feature: "foundation.authorization_inspection",
  });
  return (
    <main className="space-y-6 py-6">
      <h1 className="text-2xl font-semibold">Premium Emerald design review</h1>
      <p className="max-w-3xl text-slate-600">
        Contained appearance preview with synthetic figures. Theme choices
        affect this sample only. Shared branding, personal preference
        persistence and tenant dashboards are unchanged.
      </p>
      <EmeraldFoundationPreview />
    </main>
  );
}
