import { ButtonLink } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
import { AuthorizationError } from "@/lib/authorization";

const messages = {
  invalid_context: {
    kind: "invalid-context",
    title: "School context could not be verified",
    description:
      "Choose an authorized school workspace, then open Finance again.",
  },
  permission_denied: {
    kind: "unauthorized",
    title: "Finance access is not available for this role",
    description:
      "Ask an organization administrator to review your existing Finance permissions.",
  },
  not_entitled: {
    kind: "unentitled",
    title: "Finance is not included in this organization plan",
    description:
      "An organization administrator can review the current module entitlement.",
  },
  module_disabled: {
    kind: "disabled",
    title: "Finance is disabled for this organization",
    description:
      "An organization administrator can review the existing Finance module setting.",
  },
  feature_disabled: {
    kind: "disabled",
    title: "This Finance workspace is not enabled",
    description:
      "The feature is not active in the current school context. Contact an organization administrator.",
  },
} as const;

export function FinanceUnavailableState({
  area,
  error,
}: {
  area: string;
  error: unknown;
}) {
  const authorizationReason =
    error instanceof AuthorizationError ? error.reason : null;
  const state = authorizationReason
    ? messages[authorizationReason]
    : {
        kind: "error" as const,
        title: `${area} could not be loaded`,
        description:
          "Finance data is temporarily unavailable. Try again later or contact support if the problem continues.",
      };

  return (
    <main className="py-10 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <p className="text-brand text-sm font-semibold">Finance · {area}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {state.title}
        </h1>
        <div className="mt-5">
          <StatePanel
            kind={state.kind}
            title={state.title}
            description={state.description}
            action={
              <ButtonLink href="/dashboard">Back to school overview</ButtonLink>
            }
          />
        </div>
      </div>
    </main>
  );
}
