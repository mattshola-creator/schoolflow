import Link from "next/link";
import { loadAdmissionDocumentPolicy } from "@/features/admissions/service";

export default async function AdmissionDocumentPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [notice, result] = await Promise.all([
    searchParams,
    loadAdmissionDocumentPolicy(),
  ]);
  const canConfigure = result.authorization.permissions.includes(
    "admissions.documents.configure",
  );
  return (
    <main className="py-10 sm:py-12">
      <Link href="/admissions" className="text-sm font-medium text-emerald-800">
        ← Admissions
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">Admission document policy</h1>
      <p className="mt-2 text-slate-600">
        School-specific requirements for future applications at{" "}
        {result.active.schoolName}. Existing application snapshots are
        unchanged.
      </p>
      {notice.message && (
        <p className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          {notice.message}
        </p>
      )}
      {notice.error && (
        <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-900">
          {notice.error}
        </p>
      )}
      <div className="mt-6 space-y-4">
        {result.policies.map((policy) => (
          <form
            key={policy.id}
            action="/api/admissions/documents"
            method="post"
            className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
          >
            <input type="hidden" name="operation" value="configure" />
            <input
              type="hidden"
              name="categoryKey"
              value={policy.category_key}
            />
            <label className="text-sm">
              Label
              <input
                name="label"
                defaultValue={policy.label}
                required
                className="mt-1 block w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                name="required"
                defaultChecked={policy.required}
              />{" "}
              Required
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={policy.enabled}
              />{" "}
              Enabled
            </label>
            <button
              disabled={!canConfigure}
              className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-4"
            >
              Save policy · version {policy.version}
            </button>
          </form>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-500">
        Not Applicable is disabled for both approved mandatory categories.
      </p>
    </main>
  );
}
