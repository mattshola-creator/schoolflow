import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Authorized capability"
        title={item.label}
        description="Your active tenant context, role permission, plan entitlement and module state were verified server-side. The business module itself begins in its approved milestone."
      />
    </main>
  );
}

function AccessState({ title, message }: { title: string; message: string }) {
  return (
    <main className="py-10 sm:py-16">
      <PageHeader
        eyebrow="SchoolFlow access control"
        title={title}
        description={message}
      />
      <ButtonLink
        href="/dashboard"
        className="mt-7 w-full sm:w-auto"
        variant="secondary"
      >
        Return to dashboard
      </ButtonLink>
    </main>
  );
}
