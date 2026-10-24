import { expect, it } from "vitest";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import {
  parseBatchStatus,
  projectAssessmentQueue,
  canPresentBatchTransition,
} from "./assessment-queue";
const auth: AuthorizationSnapshot = {
  organizationId: "org",
  schoolId: "school",
  permissions: ["academics.scores.view"],
  modules: [{ key: "academics", enabled: true, entitled: true }],
  features: [
    { key: "academics.score_entry", module: "academics", enabled: true },
  ],
};
const batches = [
  {
    status: "submitted",
    session_id: "current",
    period_id: "first",
    secret: "must not serialize",
  },
  { status: "submitted", session_id: "old", period_id: "first" },
  { status: "reviewed", session_id: "current", period_id: "second" },
];
it("scopes review counts to selected academic context without serializing batch data", () => {
  const queue = projectAssessmentQueue(
    batches,
    { sessionId: "current", periodId: "first" },
    auth,
  );
  expect(queue?.find((row) => row.status === "submitted")?.count).toBe(1);
  expect(queue?.find((row) => row.status === "reviewed")?.count).toBe(0);
  expect(JSON.stringify(queue)).not.toContain("secret");
});
it("does not expose the queue without school, domain permission or entitlement", () => {
  for (const denied of [
    { ...auth, schoolId: null },
    { ...auth, permissions: [] },
    { ...auth, modules: [] },
    { ...auth, features: [] },
  ])
    expect(
      projectAssessmentQueue(
        batches,
        { sessionId: null, periodId: null },
        denied,
      ),
    ).toBeNull();
});
it("only accepts supported workflow statuses", () => {
  expect(parseBatchStatus("submitted")).toBe("submitted");
  expect(parseBatchStatus("https://foreign.test")).toBeUndefined();
});

it("shows teacher submission but no review, approval or publication controls", () => {
  const teacher = { ...auth, permissions: ["academics.scores.submit"] };
  expect(canPresentBatchTransition("submitted", teacher)).toBe(true);
  for (const status of ["reviewed", "approved", "published"] as const)
    expect(canPresentBatchTransition(status, teacher)).toBe(false);
  expect(
    canPresentBatchTransition("submitted", { ...teacher, features: [] }),
  ).toBe(false);
});
it("requires workflow entitlement even with review permission", () => {
  const manager = {
    ...auth,
    permissions: ["academics.results.review"],
    features: [
      { key: "academics.result_workflow", module: "academics", enabled: true },
    ],
  };
  expect(canPresentBatchTransition("reviewed", manager)).toBe(true);
  expect(canPresentBatchTransition("approved", manager)).toBe(false);
  expect(
    canPresentBatchTransition("reviewed", { ...manager, modules: [] }),
  ).toBe(false);
});
