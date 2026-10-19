export const QA_SUPABASE_PROJECT_REF = "afqykqlxecpzspjoyegc";
export const QA_APP_ORIGIN = "https://schoolflow-demo-qa.netlify.app";

export const qaRolePresets = {
  payment_recorder: {
    key: "qa_payment_recorder",
    name: "QA Payment Recorder",
    description: "SchoolFlow QA fixed least-privilege payment recorder preset.",
    syntheticEmail: "qa-payment-recorder@schoolflow.test",
    fullName: "QA Payment Recorder",
    organizationSlug: "cedarbridge-learning-group",
    label: "Cedarbridge payment recorder",
    permissions: [
      "finance.view",
      "finance.billing.view",
      "finance.payments.view",
      "finance.payments.record",
    ],
  },
  payment_verifier: {
    key: "qa_payment_verifier",
    name: "QA Independent Payment Verifier",
    description: "SchoolFlow QA fixed least-privilege payment verifier preset.",
    syntheticEmail: "qa-payment-verifier@schoolflow.test",
    fullName: "QA Independent Payment Verifier",
    organizationSlug: "cedarbridge-learning-group",
    label: "Cedarbridge independent payment verifier",
    permissions: [
      "finance.view",
      "finance.billing.view",
      "finance.payments.view",
      "finance.payments.verify",
      "finance.payments.allocate",
    ],
  },
  internal_qa_reader: {
    key: "qa_internal_read_only",
    name: "QA Read Only",
    description: "SchoolFlow QA fixed read-only internal QA preset.",
    syntheticEmail: "qa-internal-reader@schoolflow.test",
    fullName: "SchoolFlow Internal QA Reader",
    organizationSlug: "schoolflow-internal-qa",
    label: "SchoolFlow Internal QA only",
    permissions: [
      "organization.view",
      "school.view",
      "students.view",
      "academics.view",
      "academics.scores.view",
      "academics.results.view",
      "attendance.view",
      "finance.view",
      "finance.billing.view",
      "finance.payments.view",
      "communication.view",
      "reporting.dashboard.view",
      "shared.documents.view",
      "shared.tasks.view",
      "shared.audit.view",
    ],
  },
} as const;

export type QaRolePresetKey = keyof typeof qaRolePresets;

export function qaInvitationAcceptanceUrl(token: string) {
  const url = new URL("/accept-invitation", QA_APP_ORIGIN);
  url.searchParams.set("token", token);
  return url.toString();
}

export function isQaSupabaseUrl(value: string | undefined) {
  if (!value) return false;
  try {
    return new URL(value).hostname === `${QA_SUPABASE_PROJECT_REF}.supabase.co`;
  } catch {
    return false;
  }
}

export function isQaInvitationHost(value: string | null) {
  if (!value) return false;
  const host = value.toLowerCase();
  if (
    host === "schoolflow-demo-qa.netlify.app" ||
    host === "ops-option-bplus-px6-integration--schoolflow-demo-qa.netlify.app"
  )
    return true;
  const prefix = "deploy-preview-";
  const suffix = "--schoolflow-demo-qa.netlify.app";
  if (!host.startsWith(prefix) || !host.endsWith(suffix)) return false;
  const previewId = host.slice(prefix.length, -suffix.length);
  return (
    previewId.length > 0 &&
    [...previewId].every((character) => character >= "0" && character <= "9")
  );
}

export function isQaProvisioningOrigin(value: string | null) {
  if (!value) return false;
  try {
    const origin = new URL(value);
    return (
      origin.protocol === "https:" &&
      origin.origin === value &&
      isQaInvitationHost(origin.host)
    );
  } catch {
    return false;
  }
}
