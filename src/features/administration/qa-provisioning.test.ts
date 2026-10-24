import { describe, expect, it } from "vitest";
import {
  isQaInvitationHost,
  isQaProvisioningOrigin,
  isQaSupabaseUrl,
  qaInvitationAcceptanceUrl,
  qaRolePresets,
  qaSignInOrigin,
} from "./qa-provisioning";

describe("QA role provisioning safeguards", () => {
  it("keeps current-origin links by default and permits only an explicit fixed stable-QA destination", () => {
    const preview =
      "https://deploy-preview-119--schoolflow-demo-qa.netlify.app";
    expect(qaSignInOrigin(preview, "current")).toBe(preview);
    expect(qaSignInOrigin(preview, "stable_qa")).toBe(
      "https://schoolflow-demo-qa.netlify.app",
    );
    expect(() =>
      qaSignInOrigin("https://attacker.example", "stable_qa"),
    ).toThrow();
    expect(() =>
      qaSignInOrigin(preview, "https://attacker.example" as "current"),
    ).toThrow();
  });
  it("keeps the teacher preset separate from approval, correction, finance and access administration", () => {
    expect(qaRolePresets.assessment_teacher.permissions).toEqual([
      "students.view",
      "academics.view",
      "academics.scores.view",
      "academics.scores.enter",
      "academics.scores.submit",
    ]);
    expect(qaRolePresets.assessment_teacher.syntheticEmail).toBe(
      "qa-assessment-teacher@schoolflow.test",
    );
  });
  it("accepts only the designated QA Supabase project URL", () => {
    expect(isQaSupabaseUrl("https://afqykqlxecpzspjoyegc.supabase.co")).toBe(
      true,
    );
    expect(isQaSupabaseUrl("https://bgnmvfktscofbwpyougd.supabase.co")).toBe(
      false,
    );
    expect(isQaSupabaseUrl(undefined)).toBe(false);
  });

  it("accepts only protected QA site and Deploy Preview hosts", () => {
    expect(isQaInvitationHost("schoolflow-demo-qa.netlify.app")).toBe(true);
    expect(
      isQaInvitationHost("deploy-preview-119--schoolflow-demo-qa.netlify.app"),
    ).toBe(true);
    expect(isQaInvitationHost("schoolflow-app.netlify.app")).toBe(false);
    expect(
      isQaInvitationHost(
        "attacker.example/deploy-preview-119--schoolflow-demo-qa.netlify.app",
      ),
    ).toBe(false);
  });

  it("accepts only HTTPS application origins on protected QA hosts", () => {
    expect(
      isQaProvisioningOrigin("https://schoolflow-demo-qa.netlify.app"),
    ).toBe(true);
    expect(
      isQaProvisioningOrigin(
        "https://deploy-preview-119--schoolflow-demo-qa.netlify.app",
      ),
    ).toBe(true);
    expect(
      isQaProvisioningOrigin("http://schoolflow-demo-qa.netlify.app"),
    ).toBe(false);
    expect(isQaProvisioningOrigin("https://schoolflow-app.netlify.app")).toBe(
      false,
    );
    expect(isQaProvisioningOrigin("https://attacker.example")).toBe(false);
  });

  it("keeps invitation acceptance on the validated QA request origin", () => {
    expect(
      qaInvitationAcceptanceUrl(
        "synthetic-test-token",
        "https://deploy-preview-119--schoolflow-demo-qa.netlify.app",
      ),
    ).toBe(
      "https://deploy-preview-119--schoolflow-demo-qa.netlify.app/accept-invitation?token=synthetic-test-token",
    );
    expect(qaInvitationAcceptanceUrl("synthetic-test-token")).toBe(
      "https://schoolflow-demo-qa.netlify.app/accept-invitation?token=synthetic-test-token",
    );
    expect(() =>
      qaInvitationAcceptanceUrl(
        "synthetic-test-token",
        "https://attacker.example",
      ),
    ).toThrow("Invitation links require an approved QA application origin.");
  });

  it("uses role keys accepted by the existing database constraint", () => {
    expect(
      Object.values(qaRolePresets).every((preset) =>
        /^[a-z]+(?:_[a-z]+)*$/.test(preset.key),
      ),
    ).toBe(true);
  });

  it("uses fixed synthetic identities without real inboxes", () => {
    expect(qaRolePresets.payment_recorder.syntheticEmail).toBe(
      "qa-payment-recorder@schoolflow.test",
    );
    expect(qaRolePresets.payment_verifier.syntheticEmail).toBe(
      "qa-payment-verifier@schoolflow.test",
    );
    expect(qaRolePresets.internal_qa_reader.syntheticEmail).toBe(
      "qa-internal-reader@schoolflow.test",
    );
    expect(
      Object.values(qaRolePresets).every((preset) =>
        preset.syntheticEmail.endsWith("@schoolflow.test"),
      ),
    ).toBe(true);
  });

  it("keeps payment recording and verification in separate fixed roles", () => {
    expect(qaRolePresets.payment_recorder.permissions).toContain(
      "finance.payments.record",
    );
    expect(qaRolePresets.payment_recorder.permissions).not.toContain(
      "finance.payments.verify",
    );
    expect(qaRolePresets.payment_verifier.permissions).toContain(
      "finance.payments.verify",
    );
    expect(qaRolePresets.payment_verifier.permissions).not.toContain(
      "finance.payments.record",
    );
  });

  it("keeps the Internal QA preset read only", () => {
    expect(qaRolePresets.internal_qa_reader.permissions).not.toContain(
      "finance.payments.record",
    );
    expect(qaRolePresets.internal_qa_reader.permissions).not.toContain(
      "finance.payments.verify",
    );
  });
});

it("keeps approved pilot presets exact and financially separated", () => {
  expect(qaRolePresets.principal_review.permissions).toEqual([
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
  ]);
  expect(qaRolePresets.bursar_recorder.permissions).toEqual(
    qaRolePresets.payment_recorder.permissions,
  );
  expect(
    qaRolePresets.principal_review.permissions.some((key) =>
      key.startsWith("finance."),
    ),
  ).toBe(false);
  expect(qaRolePresets.bursar_recorder.syntheticEmail).not.toBe(
    qaRolePresets.payment_recorder.syntheticEmail,
  );
});
