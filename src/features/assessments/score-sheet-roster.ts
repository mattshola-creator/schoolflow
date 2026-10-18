type MembershipStudent = { student_id: string };

type StudentProfile = {
  id: string;
  student_number: string;
  people: { first_name: string; last_name: string };
};

export type ScoreSheetRosterStudent = {
  student_id: string;
  student_profiles: Pick<StudentProfile, "student_number" | "people">[];
};

export function buildScoreSheetRoster(
  memberships: readonly MembershipStudent[],
  profiles: readonly StudentProfile[],
): ScoreSheetRosterStudent[] {
  const profilesById = new Map(
    profiles.map(({ id, ...profile }) => [id, profile]),
  );
  return memberships.flatMap(({ student_id }) => {
    const profile = profilesById.get(student_id);
    return profile
      ? [{ student_id, student_profiles: [profile] }]
      : [];
  });
}
