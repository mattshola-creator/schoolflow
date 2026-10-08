import { describe, expect, it } from "vitest";
import { resolveAcademicContext } from "./context";

describe("academic context", () => {
  it("uses the current session and its current period", () => {
    const context = resolveAcademicContext(
      [
        { id: "planned", name: "2027/2028", status: "planned" },
        { id: "current", name: "2026/2027", status: "current" },
      ],
      [
        {
          id: "wrong",
          name: "First term",
          status: "current",
          session_id: "planned",
        },
        {
          id: "right",
          name: "Second term",
          status: "current",
          session_id: "current",
        },
      ],
    );
    expect(context).toMatchObject({
      sessionId: "current",
      periodId: "right",
      available: true,
    });
  });

  it("does not invent an academic context when none is configured", () => {
    expect(resolveAcademicContext([], [])).toEqual({
      sessionId: null,
      sessionName: null,
      periodId: null,
      periodName: null,
      available: false,
    });
  });
});
