export const QA_SUPABASE_PROJECT_REF = "afqykqlxecpzspjoyegc";
export const QA_APP_ORIGIN = "https://schoolflow-demo-qa.netlify.app";

export const qaRolePresets = {
  principal_review: {
    key: "qa_principal_review",
    name: "QA Principal Review",
    description:
      "Founder-approved PR131 QA pilot. School-scoped assignments only; not production.",
    syntheticEmail: "qa-principal-review@schoolflow.test",
    fullName: "QA Principal Review",
    organizationSlug: "cedarbridge-learning-group",
    permissions: [
      "organization.view",
      "school.view",
      "students.view",
      "attendance.view",
      "academics.view",
      "academics.scores.view",
      "academics.results.view",
      "academics.results.review",
      "reporting.dashboard.view",
      "reporting.school.view",
      "reporting.academic.view",
      "reporting.attendance.view",
      "shared.tasks.view",
    ],
  },
  bursar_recorder: {
    key: "qa_bursar_recorder",
    name: "QA Bursar Recorder",
    description:
      "Founder-approved PR131 QA pilot. School-scoped assignments only; not production.",
    syntheticEmail: "qa-bursar-recorder@schoolflow.test",
    fullName: "QA Bursar Recorder",
    organizationSlug: "cedarbridge-learning-group",
    permissions: [
      "finance.view",
      "finance.billing.view",
      "finance.payments.view",
      "finance.payments.record",
    ],
  },
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
  assessment_teacher: {
    key: "qa_assessment_teacher",
    name: "QA Assessment Teacher",
    description: "SchoolFlow QA fixed Assessment entry and submission preset.",
    syntheticEmail: "qa-assessment-teacher@schoolflow.test",
    fullName: "QA Assessment Teacher",
    organizationSlug: "cedarbridge-learning-group",
    permissions: [
      "students.view",
      "academics.view",
      "academics.scores.view",
      "academics.scores.enter",
      "academics.scores.submit",
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

export function qaSignInOrigin(
  requestOrigin: string,
  destination: "current" | "stable_qa",
) {
  if (!isQaProvisioningOrigin(requestOrigin))
    throw new Error("Invalid QA request origin");
  if (destination === "stable_qa") return QA_APP_ORIGIN;
  if (destination === "current") return requestOrigin;
  throw new Error("Invalid QA sign-in destination");
}

export function qaInvitationAcceptanceUrl(
  token: string,
  appOrigin: string = QA_APP_ORIGIN,
) {
  if (!isQaProvisioningOrigin(appOrigin)) {
    throw new Error(
      "Invitation links require an approved QA application origin.",
    );
  }
  const url = new URL("/accept-invitation", appOrigin);
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
