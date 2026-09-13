import Link from "next/link";
import { findModuleNavigationItem } from "@/features/authorization/catalog";
import { evaluateAccess } from "@/features/authorization/evaluator";
import { loadEffectiveAuthorization } from "@/lib/authorization";

const messages = {
  permission_denied: "Your current role does not allow this action.",
  not_entitled:
    "This module is not included in your organization’s current plan.",
  module_disabled: "This module is currently unavailable.",
  feature_disabled: "This feature is currently disabled.",
} as const;

export default async function CapabilityPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const item = findModuleNavigationItem(module);
  const authorization = await loadEffectiveAuthorization();
  if (!item || !authorization)
    return (
      <AccessState
        title="Workspace unavailable"
        message="Select an authorized workspace to continue."
      />
    );
  const decision = evaluateAccess(authorization, item);
  if (!decision.allowed)
    return (
      <AccessState
        title="Access unavailable"
        message={messages[decision.reason]}
      />
    );
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-sm font-semibold text-emerald-800">
        Authorized capability
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{item.label}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Your active tenant context, role permission, plan entitlement and module
        state were verified server-side. The business module itself begins in
        its approved milestone.
      </p>
    </main>
  );
}

function AccessState({ title, message }: { title: string; message: string }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold text-amber-700">
        SchoolFlow access control
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-slate-600">{message}</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex rounded-lg border bg-white px-4 py-2 font-semibold"
      >
        Return to dashboard
      </Link>
    </main>
  );
}
