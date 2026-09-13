export type AcademicSetupCounts = {
  settings: number;
  currentSessions: number;
  periods: number;
  levels: number;
  arms: number;
  subjects: number;
  activeSchoolLocks: number;
};

export type AcademicSetupState =
  "not_configured" | "partial" | "ready" | "locked";

export function deriveAcademicSetupState(
  counts: AcademicSetupCounts,
): AcademicSetupState {
  if (counts.activeSchoolLocks > 0) return "locked";
  const configured = [
    counts.settings,
    counts.currentSessions,
    counts.periods,
    counts.levels,
    counts.arms,
    counts.subjects,
  ];
  if (configured.every((count) => count === 0)) return "not_configured";
  return configured.every((count) => count > 0) ? "ready" : "partial";
}

export function nextAcademicSetupStep(counts: AcademicSetupCounts) {
  if (!counts.settings) return "settings";
  if (!counts.currentSessions) return "session";
  if (!counts.periods) return "periods";
  if (!counts.levels) return "levels";
  if (!counts.arms) return "arms";
  if (!counts.subjects) return "subjects";
  return "review";
}
