import { describe, expect, it } from "vitest";
import {
  assessmentWorkflowLabel,
  unavailableResultLabel,
  assignedTeacherLabel,
} from "./presentation";

describe("Assessment workflow presentation", () => {
  it.each(["submitted", "reviewed", "approved", "published"])(
    "does not describe an unreadable %s result as Draft",
    (status) => {
      expect(assessmentWorkflowLabel(status)).toBe(
        status[0].toUpperCase() + status.slice(1),
      );
      expect(unavailableResultLabel(status)).toBe(
        "Result details unavailable in this workspace",
      );
    },
  );
  it("distinguishes correction and uncomputed scores without inventing publication", () => {
    expect(assessmentWorkflowLabel("reopened")).toBe("Reopened for correction");
    expect(unavailableResultLabel("draft")).toBe("Not yet computed");
    expect(assessmentWorkflowLabel("unknown")).toBe(
      "Workflow status unavailable",
    );
  });
  it("uses only the authorized canonical person name", () => {
    expect(
      assignedTeacherLabel(true, { first_name: "Ada", last_name: "Obi" }),
    ).toBe("Ada Obi");
    expect(assignedTeacherLabel(true, null)).toBe(
      "Assigned teacher details unavailable in this workspace",
    );
    expect(assignedTeacherLabel(false, null)).toBe(
      "No explicit teaching assignment linked",
    );
    expect(
      assignedTeacherLabel(true, { first_name: " ", last_name: " " }),
    ).toBe("Assigned teacher details unavailable in this workspace");
  });
});
