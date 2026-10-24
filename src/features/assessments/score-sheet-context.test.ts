import { expect, it, vi } from "vitest";
import { AuthorizationError } from "@/lib/authorization";
import { readScoreSheetContext } from "./score-sheet-context";

const args = {
  target_batch_id: "batch",
  target_organization_id: "org",
  target_school_id: "school",
};
const labels = {
  subjectName: "Mathematics",
  sessionName: "Session A",
  periodName: "Term A",
  className: "Primary 3",
  armName: "Blue",
  assignedTeacherName: "Fictional Teacher",
};
it("uses the authenticated probe with explicit selected context and only six labels", async () => {
  const probe = vi.fn().mockResolvedValue({ data: labels, error: null });
  await expect(readScoreSheetContext(probe, args)).resolves.toEqual(labels);
  expect(probe).toHaveBeenCalledExactlyOnceWith(
    "get_assessment_score_sheet_context",
    args,
  );
});
it("preserves genuinely missing and unauthorized name labels as null", async () => {
  const missing = Object.fromEntries(
    Object.keys(labels).map((key) => [key, null]),
  );
  await expect(
    readScoreSheetContext(
      vi.fn().mockResolvedValue({ data: missing, error: null }),
      args,
    ),
  ).resolves.toEqual(missing);
});
it("distinguishes a permission denial from an unexpected database failure", async () => {
  await expect(
    readScoreSheetContext(
      vi.fn().mockResolvedValue({ data: null, error: { code: "42501" } }),
      args,
    ),
  ).rejects.toBeInstanceOf(AuthorizationError);
  const failure = readScoreSheetContext(
    vi.fn().mockResolvedValue({ data: null, error: { code: "XX000" } }),
    args,
  );
  await expect(failure).rejects.toThrow(
    "Score sheet context could not be loaded",
  );
  await expect(failure).rejects.not.toBeInstanceOf(AuthorizationError);
});
it.each([
  null,
  {},
  { ...labels, privateStaffEmail: "must-not-pass" },
  { ...labels, subjectName: 42 },
])(
  "rejects unexpected RPC shapes rather than serializing extra data",
  async (data) => {
    await expect(
      readScoreSheetContext(
        vi.fn().mockResolvedValue({ data, error: null }),
        args,
      ),
    ).rejects.toThrow("Score sheet context response is invalid");
  },
);
