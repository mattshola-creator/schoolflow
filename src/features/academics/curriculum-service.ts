import { requireTeachingContext } from "./teaching-service";
import {
  curriculumCoverageSchema,
  curriculumItemSchema,
  type CurriculumCoverageInput,
  type CurriculumItemInput,
} from "./curriculum-schemas";

export async function loadCurriculumWorkspace() {
  const context = await requireTeachingContext("academics.curriculum.view");
  const [
    sessions,
    periods,
    assignments,
    items,
    levels,
    arms,
    subjects,
    staffAssignments,
    profiles,
  ] = await Promise.all([
    context.supabase
      .from("academic_sessions")
      .select("id, name, start_date, end_date, status")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .in("status", ["planned", "current"])
      .order("start_date", { ascending: false }),
    context.supabase
      .from("academic_periods")
      .select("id, session_id, name, start_date, end_date, sequence")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .in("status", ["planned", "current"])
      .order("sequence"),
    context.supabase
      .from("teaching_assignments")
      .select(
        "id, session_id, staff_assignment_id, subject_id, class_level_id, class_arm_id",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("assignment_type", "subject_teacher")
      .in("status", ["planned", "active"]),
    context.supabase
      .from("curriculum_items")
      .select(
        "id, session_id, academic_period_id, teaching_assignment_id, subject_id, class_level_id, class_arm_id, sequence, title, learning_objectives, planned_start, planned_end, status, completed_on",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("sequence"),
    context.supabase
      .from("class_levels")
      .select("id, name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!),
    context.supabase
      .from("class_arms")
      .select("id, name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!),
    context.supabase
      .from("subjects")
      .select("id, name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!),
    context.supabase
      .from("staff_assignments")
      .select("id, staff_profile_id")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!),
    context.supabase
      .from("staff_profiles")
      .select("id, staff_number, people!inner(first_name, last_name)")
      .eq("organization_id", context.active.organizationId),
  ]);
  if (
    [
      sessions,
      periods,
      assignments,
      items,
      levels,
      arms,
      subjects,
      staffAssignments,
      profiles,
    ].some((result) => result.error)
  )
    throw new Error("The curriculum workspace could not be loaded");
  const profileMap = new Map(
    (profiles.data ?? []).map((profile) => [profile.id, profile]),
  );
  return {
    ...context,
    sessions: sessions.data ?? [],
    periods: periods.data ?? [],
    assignments: assignments.data ?? [],
    items: items.data ?? [],
    levels: levels.data ?? [],
    arms: arms.data ?? [],
    subjects: subjects.data ?? [],
    staff: (staffAssignments.data ?? []).flatMap((assignment) => {
      const profile = profileMap.get(assignment.staff_profile_id);
      return profile ? [{ ...assignment, staff_profiles: profile }] : [];
    }),
  };
}

export async function createCurriculumItem(input: CurriculumItemInput) {
  const parsed = curriculumItemSchema.parse(input);
  const context = await requireTeachingContext("academics.curriculum.manage");
  const assignment = await context.supabase
    .from("teaching_assignments")
    .select("subject_id, class_level_id, class_arm_id")
    .eq("id", parsed.teachingAssignmentId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .eq("session_id", parsed.sessionId)
    .eq("assignment_type", "subject_teacher")
    .in("status", ["planned", "active"])
    .maybeSingle();
  if (assignment.error || !assignment.data?.subject_id)
    throw new Error("The curriculum teaching assignment is unavailable");
  const { error } = await context.supabase.from("curriculum_items").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    session_id: parsed.sessionId,
    academic_period_id: parsed.academicPeriodId ?? null,
    teaching_assignment_id: parsed.teachingAssignmentId,
    subject_id: assignment.data.subject_id,
    class_level_id: assignment.data.class_level_id,
    class_arm_id: assignment.data.class_arm_id,
    sequence: parsed.sequence,
    title: parsed.title,
    learning_objectives: parsed.learningObjectives ?? null,
    planned_start: parsed.plannedStart,
    planned_end: parsed.plannedEnd,
  });
  if (error) throw new Error("The curriculum item could not be created");
}

export async function updateCurriculumCoverage(input: CurriculumCoverageInput) {
  const parsed = curriculumCoverageSchema.parse(input);
  const context = await requireTeachingContext("academics.curriculum.manage");
  const { error } = await context.supabase
    .from("curriculum_items")
    .update({
      status: parsed.status,
      completed_on: parsed.status === "completed" ? parsed.completedOn : null,
      updated_by: context.user.id,
    })
    .eq("id", parsed.curriculumItemId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!);
  if (error) throw new Error("Curriculum coverage could not be updated");
}
