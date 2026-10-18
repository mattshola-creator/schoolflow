export const QA_SUPABASE_PROJECT_REF = "afqykqlxecpzspjoyegc";

export const qaRolePresets = {
  payment_recorder: {
    key: "px6qa_payment_recorder",
    name: "QA Payment Recorder",
    description: "SchoolFlow QA fixed least-privilege payment recorder preset.",
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
    key: "px6qa_payment_verifier",
    name: "QA Independent Payment Verifier",
    description: "SchoolFlow QA fixed least-privilege payment verifier preset.",
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
    key: "px6qa_internal_read_only",
    name: "QA Read Only",
    description: "SchoolFlow QA fixed read-only internal QA preset.",
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
  return (
    host === "schoolflow-demo-qa.netlify.app" ||
    host === "ops-option-bplus-px6-integration--schoolflow-demo-qa.netlify.app" ||
    /^deploy-preview-\\d+--schoolflow-demo-qa\\.netlify\\.app$/.test(host)
  );
}
