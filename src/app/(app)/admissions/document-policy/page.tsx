import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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
      <Link href="/admissions" className="text-brand text-sm font-medium">
        ← Admissions
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Admissions setup"
          title="Admission document policy"
          description={
            <>
              School-specific requirements for future applications at{" "}
              <span className="[overflow-wrap:anywhere]">
                {result.active.schoolName}
              </span>
              . Existing application snapshots are unchanged.
            </>
          }
        />
      </div>
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
      <div className="mt-6 min-w-0 space-y-4">
        {result.policies.map((policy) => (
          <form
            key={policy.id}
            action="/api/admissions/documents"
            method="post"
            className="border-border bg-surface grid min-w-0 gap-4 rounded-xl border p-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end sm:p-6"
          >
            <input type="hidden" name="operation" value="configure" />
            <input
              type="hidden"
              name="categoryKey"
              value={policy.category_key}
            />
            <label className="min-w-0 text-sm font-medium sm:col-span-3">
              Label
              <input
                name="label"
                defaultValue={policy.label}
                required
                className={fieldClass}
              />
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg py-2 text-sm font-medium">
              <input
                className="size-5 shrink-0 accent-emerald-800"
                type="checkbox"
                name="required"
                defaultChecked={policy.required}
              />{" "}
              Required
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg py-2 text-sm font-medium">
              <input
                className="size-5 shrink-0 accent-emerald-800"
                type="checkbox"
                name="enabled"
                defaultChecked={policy.enabled}
              />{" "}
              Enabled
            </label>
            <Button
              className="w-full sm:col-span-3 sm:w-auto"
              disabled={!canConfigure}
              type="submit"
            >
              Save policy · version {policy.version}
            </Button>
          </form>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-500">
        Not Applicable is disabled for both approved mandatory categories.
      </p>
    </main>
  );
}
