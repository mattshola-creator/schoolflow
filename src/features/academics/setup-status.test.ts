import { describe, expect, it } from "vitest";
import {
  deriveAcademicSetupState,
  nextAcademicSetupStep,
} from "./setup-status";

const empty = {
  settings: 0,
  currentSessions: 0,
  periods: 0,
  levels: 0,
  arms: 0,
  subjects: 0,
  activeSchoolLocks: 0,
};

describe("academic setup status", () => {
  it("distinguishes fresh, partial, ready, and locked schools", () => {
    expect(deriveAcademicSetupState(empty)).toBe("not_configured");
    expect(deriveAcademicSetupState({ ...empty, settings: 1 })).toBe("partial");
    expect(
      deriveAcademicSetupState({
        ...empty,
        settings: 1,
        currentSessions: 1,
        periods: 3,
        levels: 6,
        arms: 6,
        subjects: 8,
      }),
    ).toBe("ready");
    expect(deriveAcademicSetupState({ ...empty, activeSchoolLocks: 1 })).toBe(
      "locked",
    );
  });

  it("resumes at the first missing persisted step", () => {
    expect(nextAcademicSetupStep(empty)).toBe("settings");
    expect(
      nextAcademicSetupStep({
        ...empty,
        settings: 1,
        currentSessions: 1,
        periods: 3,
      }),
    ).toBe("levels");
    expect(
      nextAcademicSetupStep({
        ...empty,
        settings: 1,
        currentSessions: 1,
        periods: 3,
        levels: 2,
        arms: 2,
        subjects: 5,
      }),
    ).toBe("review");
  });
});
