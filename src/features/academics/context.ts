export type AcademicContextRecord = {
  id: string;
  name: string;
  status: string;
  session_id?: string;
};

export type AcademicContext = {
  sessionId: string | null;
  sessionName: string | null;
  periodId: string | null;
  periodName: string | null;
  available: boolean;
};

export function resolveAcademicContext(
  sessions: AcademicContextRecord[],
  periods: AcademicContextRecord[],
): AcademicContext {
  const session =
    sessions.find((item) => item.status === "current") ?? sessions[0] ?? null;
  const period = session
    ? (periods.find(
        (item) => item.status === "current" && item.session_id === session.id,
      ) ??
      periods.find((item) => item.session_id === session.id) ??
      null)
    : null;

  return {
    sessionId: session?.id ?? null,
    sessionName: session?.name ?? null,
    periodId: period?.id ?? null,
    periodName: period?.name ?? null,
    available: Boolean(session),
  };
}
