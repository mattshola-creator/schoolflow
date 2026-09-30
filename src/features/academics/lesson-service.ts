import { requireTeachingContext } from "./teaching-service";
import {
  lessonDeliverySchema,
  homeworkAssignmentSchema,
  homeworkStatusSchema,
  lessonPlanReviewSchema,
  lessonPlanSchema,
  type LessonDeliveryInput,
  type HomeworkAssignmentInput,
  type HomeworkStatusInput,
  type LessonPlanInput,
  type LessonPlanReviewInput,
} from "./lesson-schemas";

async function requireLessonWorkspaceContext() {
  for (const permission of [
    "academics.lesson_plans.manage",
    "academics.lesson_plans.approve",
    "academics.lesson_delivery.record",
    "academics.homework.manage",
  ]) {
    try {
      return await requireTeachingContext(permission);
    } catch {}
  }
  throw new Error("Lesson management is unavailable");
}

export async function loadLessonWorkspace() {
  const context = await requireLessonWorkspaceContext();
  const [
    sessions,
    periods,
    assignments,
    curriculum,
    plans,
    deliveries,
    homework,
  ] = await Promise.all([
    context.supabase
      .from("academic_sessions")
      .select("id, name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .in("status", ["planned", "current"]),
    context.supabase
      .from("academic_periods")
      .select("id, session_id, name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .in("status", ["planned", "current"]),
    context.supabase
      .from("teaching_assignments")
      .select("id, session_id, subject_id, class_level_id, class_arm_id")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("assignment_type", "subject_teacher")
      .in("status", ["planned", "active"]),
    context.supabase
      .from("curriculum_items")
      .select("id, teaching_assignment_id, title, sequence")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("sequence"),
    context.supabase
      .from("lesson_plans")
      .select(
        "id, teaching_assignment_id, curriculum_item_id, lesson_date, topic, objectives, content_outline, teaching_resources, status, review_comment",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("lesson_date", { ascending: false }),
    context.supabase
      .from("lesson_deliveries")
      .select(
        "id, teaching_assignment_id, lesson_plan_id, curriculum_item_id, delivered_on, topic, coverage_notes, classwork, homework, reflection, status",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("delivered_on", { ascending: false }),
    context.supabase
      .from("homework_assignments")
      .select(
        "id, teaching_assignment_id, lesson_delivery_id, curriculum_item_id, title, instructions, assigned_on, due_on, status",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("due_on", { ascending: false }),
  ]);
  if (
    [
      sessions,
      periods,
      assignments,
      curriculum,
      plans,
      deliveries,
      homework,
    ].some((x) => x.error)
  )
    throw new Error("The lesson workspace could not be loaded");
  return {
    ...context,
    sessions: sessions.data ?? [],
    periods: periods.data ?? [],
    assignments: assignments.data ?? [],
    curriculum: curriculum.data ?? [],
    plans: plans.data ?? [],
    deliveries: deliveries.data ?? [],
    homework: homework.data ?? [],
  };
}

export async function createHomeworkAssignment(input: HomeworkAssignmentInput) {
  const parsed = homeworkAssignmentSchema.parse(input);
  const context = await requireTeachingContext("academics.homework.manage");
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
    throw new Error("The subject teaching assignment is unavailable");
  const { error } = await context.supabase.from("homework_assignments").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    session_id: parsed.sessionId,
    academic_period_id: parsed.academicPeriodId ?? null,
    teaching_assignment_id: parsed.teachingAssignmentId,
    lesson_delivery_id: parsed.lessonDeliveryId ?? null,
    curriculum_item_id: parsed.curriculumItemId ?? null,
    subject_id: assignment.data.subject_id,
    class_level_id: assignment.data.class_level_id,
    class_arm_id: assignment.data.class_arm_id,
    title: parsed.title,
    instructions: parsed.instructions,
    assigned_on: parsed.assignedOn,
    due_on: parsed.dueOn,
  });
  if (error) throw new Error("The homework assignment could not be created");
}

export async function updateHomeworkStatus(input: HomeworkStatusInput) {
  const parsed = homeworkStatusSchema.parse(input);
  const context = await requireTeachingContext("academics.homework.manage");
  const { error } = await context.supabase
    .from("homework_assignments")
    .update({ status: parsed.status, updated_by: context.user.id })
    .eq("id", parsed.homeworkAssignmentId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!);
  if (error) throw new Error("The homework assignment could not be updated");
}

async function resolveAssignment(input: {
  sessionId: string;
  teachingAssignmentId: string;
}) {
  const context = await requireTeachingContext("academics.lesson_plans.manage");
  const assignment = await context.supabase
    .from("teaching_assignments")
    .select("subject_id, class_level_id, class_arm_id")
    .eq("id", input.teachingAssignmentId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .eq("session_id", input.sessionId)
    .eq("assignment_type", "subject_teacher")
    .in("status", ["planned", "active"])
    .maybeSingle();
  if (assignment.error || !assignment.data?.subject_id)
    throw new Error("The subject teaching assignment is unavailable");
  return { context, assignment: assignment.data };
}

export async function createLessonPlan(input: LessonPlanInput) {
  const parsed = lessonPlanSchema.parse(input);
  const { context, assignment } = await resolveAssignment(parsed);
  const { error } = await context.supabase.from("lesson_plans").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    session_id: parsed.sessionId,
    academic_period_id: parsed.academicPeriodId ?? null,
    teaching_assignment_id: parsed.teachingAssignmentId,
    curriculum_item_id: parsed.curriculumItemId ?? null,
    subject_id: assignment.subject_id!,
    class_level_id: assignment.class_level_id,
    class_arm_id: assignment.class_arm_id,
    lesson_date: parsed.lessonDate,
    topic: parsed.topic,
    objectives: parsed.objectives,
    content_outline: parsed.contentOutline,
    teaching_resources: parsed.teachingResources ?? null,
  });
  if (error) throw new Error("The lesson plan could not be created");
}

export async function updateLessonPlanStatus(input: LessonPlanReviewInput) {
  const parsed = lessonPlanReviewSchema.parse(input);
  const permission = ["approved", "rejected"].includes(parsed.status)
    ? "academics.lesson_plans.approve"
    : "academics.lesson_plans.manage";
  const context = await requireTeachingContext(permission);
  const { error } = await context.supabase
    .from("lesson_plans")
    .update({
      status: parsed.status,
      review_comment: parsed.reviewComment ?? null,
      updated_by: context.user.id,
    })
    .eq("id", parsed.lessonPlanId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!);
  if (error) throw new Error("The lesson plan could not be updated");
}

export async function createLessonDelivery(input: LessonDeliveryInput) {
  const parsed = lessonDeliverySchema.parse(input);
  const context = await requireTeachingContext(
    "academics.lesson_delivery.record",
  );
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
    throw new Error("The subject teaching assignment is unavailable");
  const { error } = await context.supabase.from("lesson_deliveries").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    session_id: parsed.sessionId,
    academic_period_id: parsed.academicPeriodId ?? null,
    teaching_assignment_id: parsed.teachingAssignmentId,
    lesson_plan_id: parsed.lessonPlanId ?? null,
    curriculum_item_id: parsed.curriculumItemId ?? null,
    subject_id: assignment.data.subject_id,
    class_level_id: assignment.data.class_level_id,
    class_arm_id: assignment.data.class_arm_id,
    delivered_on: parsed.deliveredOn,
    topic: parsed.topic,
    coverage_notes: parsed.coverageNotes,
    classwork: parsed.classwork ?? null,
    homework: parsed.homework ?? null,
    reflection: parsed.reflection ?? null,
    status: parsed.status,
  });
  if (error) throw new Error("The lesson delivery could not be recorded");
}
