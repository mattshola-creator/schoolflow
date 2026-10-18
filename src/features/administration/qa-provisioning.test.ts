import { describe, expect, it } from "vitest";
import {
  isQaInvitationHost,
  isQaSupabaseUrl,
  qaRolePresets,
} from "./qa-provisioning";

describe("QA role provisioning safeguards", () => {
  it("accepts only the designated QA Supabase project URL", () => {
    expect(
      isQaSupabaseUrl("https://afqykqlxecpzspjoyegc.supabase.co"),
    ).toBe(true);
    expect(
      isQaSupabaseUrl("https://bgnmvfktscofbwpyougd.supabase.co"),
    ).toBe(false);
    expect(isQaSupabaseUrl(undefined)).toBe(false);
  });

  it("accepts only protected QA site and Deploy Preview hosts", () => {
    expect(isQaInvitationHost("schoolflow-demo-qa.netlify.app")).toBe(true);
    expect(
      isQaInvitationHost("deploy-preview-119--schoolflow-demo-qa.netlify.app"),
    ).toBe(true);
    expect(isQaInvitationHost("schoolflow-app.netlify.app")).toBe(false);
    expect(
      isQaInvitationHost("attacker.example/deploy-preview-119--schoolflow-demo-qa.netlify.app"),
    ).toBe(false);
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
