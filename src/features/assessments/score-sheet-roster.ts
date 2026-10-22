type ScoreSheetMembership = { student_id: string };
type ScoreSheetProfile = {
  id: string;
  student_number: string;
  people: { first_name: string; last_name: string };
};

export function assembleScoreSheetStudents(
  memberships: ScoreSheetMembership[],
  profiles: ScoreSheetProfile[],
) {
  const profilesById = new Map(
    profiles.map((profile) => [profile.id, profile]),
  );
  return memberships.flatMap(({ student_id }) => {
    const profile = profilesById.get(student_id);
    if (!profile) return [];
    return [
      {
        student_id,
        student_profiles: [
          {
            student_number: profile.student_number,
            people: profile.people,
          },
        ],
      },
    ];
  });
}
