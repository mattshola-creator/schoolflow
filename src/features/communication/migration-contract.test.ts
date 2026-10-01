import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/20261001173322_m11_parent_student_communication.sql",
  "utf8",
);
describe("M11 database contract", () => {
  it("enforces relationship/self portal access", () => {
    expect(sql).toContain("portal_can_access_student");
    expect(sql).toContain("gr.has_portal_access");
    expect(sql).toContain("pa.actor_kind='student'");
  });
  it("exposes only immutable published snapshots", () => {
    expect(sql).toContain("from public.result_publications");
    expect(sql).not.toContain("from public.assessment_scores ae");
  });
  it("protects all M11 tables with RLS", () =>
    expect(sql.match(/enable row level security/g)?.length).toBe(10));
  it("deduplicates notification and message retries", () => {
    expect(sql).toContain("notifications_recipient_event_key_idx");
    expect(sql).toContain("unique(thread_id,sender_user_id,client_request_id)");
  });
  it("keeps external channels adapter-only", () => {
    expect(sql).toContain("communication_channel");
    expect(sql).not.toContain("twilio");
  });
});
