import { evaluateAccess } from "@/features/authorization/evaluator";
// Assignment-scoped operations use the authenticated client and approved V2 RLS.
import { z } from "zod";
import { AuthorizationError } from "@/lib/authorization";
import { requireTeachingContext } from "./teaching-service";
import { LessonOperationError } from "./lesson-operation-error";
import { lessonPlanSchema, lessonDeliverySchema } from "./lesson-schemas";

export const ownTeachingPermission = "academics.teaching.own";
const assignedPlan = lessonPlanSchema.extend({
  academicPeriodId: z.string().uuid(),
});
const assignedDelivery = lessonDeliverySchema.extend({
  academicPeriodId: z.string().uuid(),
  status: z.enum(["delivered", "partially_delivered"]),
});
const context = () => requireTeachingContext(ownTeachingPermission);

async function resolveOwnAssignment(assignmentId: string, sessionId: string) {
  const ctx = await context();
  // SQL RLS is authoritative. This query must not be used before the approved migration.
  const response = await ctx.supabase
    .from("teaching_assignments")
    .select("id,subject_id,class_level_id,class_arm_id")
    .eq("id", assignmentId)
    .eq("session_id", sessionId)
    .eq("organization_id", ctx.active.organizationId)
    .eq("school_id", ctx.active.schoolId!)
    .eq("status", "active")
    .eq("assignment_type", "subject_teacher")
    .maybeSingle();
  if (response.error) throw new LessonOperationError(response.error.code);
  if (!response.data?.subject_id)
    throw new AuthorizationError("permission_denied");
  return { ctx, assignment: response.data };
}

export async function loadOwnTeachingWorkspace() {
  const ctx = await context();
  const results = await Promise.all([
    ctx.supabase
      .from("teaching_assignments")
      .select("id,session_id,subject_id,class_level_id,class_arm_id")
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .eq("status", "active"),
    ctx.supabase
      .from("timetable_entries")
      .select("id,session_id,period_id,teaching_assignment_id")
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .eq("status", "active"),
    ctx.supabase
      .from("timetable_periods")
      .select("id,session_id,weekday,name,starts_at,ends_at")
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .eq("status", "active"),
    ctx.supabase
      .from("lesson_plans")
      .select(
        "id,session_id,academic_period_id,teaching_assignment_id,lesson_date,topic,objectives,content_outline,teaching_resources,status",
      )
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .eq("created_by", ctx.user.id),
    ctx.supabase
      .from("lesson_deliveries")
      .select(
        "id,teaching_assignment_id,lesson_plan_id,delivered_on,topic,status",
      )
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .eq("recorded_by", ctx.user.id),
  ]);
  for (const result of results)
    if (result.error) throw new LessonOperationError(result.error.code);
  const assignments = results[0].data ?? [];
  const sessionIds = [...new Set(assignments.map((a) => a.session_id))];
  const metadata = await Promise.all([
    ctx.supabase
      .from("academic_sessions")
      .select("id,name,status")
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .in("id", sessionIds),
    ctx.supabase
      .from("academic_periods")
      .select("id,session_id,name,status")
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .in("session_id", sessionIds),
    ctx.supabase
      .from("class_levels")
      .select("id,name")
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .in(
        "id",
        assignments.map((a) => a.class_level_id),
      ),
    ctx.supabase
      .from("class_arms")
      .select("id,name")
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .in(
        "id",
        assignments.flatMap((a) => (a.class_arm_id ? [a.class_arm_id] : [])),
      ),
    ctx.supabase
      .from("subjects")
      .select("id,name")
      .eq("organization_id", ctx.active.organizationId)
      .eq("school_id", ctx.active.schoolId!)
      .in(
        "id",
        assignments.flatMap((a) => (a.subject_id ? [a.subject_id] : [])),
      ),
  ]);
  for (const result of metadata)
    if (result.error) throw new LessonOperationError(result.error.code);
  const profile = await ctx.supabase
    .from("profiles")
    .select("person_id")
    .eq("id", ctx.user.id)
    .maybeSingle();
  if (profile.error) throw new LessonOperationError(profile.error.code);
  const person = profile.data?.person_id
    ? await ctx.supabase
        .from("people")
        .select("first_name,last_name")
        .eq("id", profile.data.person_id)
        .maybeSingle()
    : null;
  if (person?.error) throw new LessonOperationError(person.error.code);
  return {
    canRecordAttendance:
      evaluateAccess(ctx.authorization, {
        permission: "attendance.student.record",
        module: "attendance",
        feature: "attendance.student_registers",
      }).allowed &&
      evaluateAccess(ctx.authorization, {
        permission: "attendance.view",
        module: "attendance",
        feature: "attendance.student_registers",
      }).allowed,
    teacherName: person?.data
      ? `${person.data.first_name} ${person.data.last_name}`
      : null,
    schoolName: ctx.active.schoolName,
    sessions: metadata[0].data ?? [],
    periodsMetadata: metadata[1].data ?? [],
    levels: metadata[2].data ?? [],
    arms: metadata[3].data ?? [],
    subjects: metadata[4].data ?? [],
    assignments,
    entries: results[1].data ?? [],
    periods: results[2].data ?? [],
    plans: results[3].data ?? [],
    deliveries: results[4].data ?? [],
  };
}

export async function createOwnLessonPlan(input: unknown) {
  const parsed = assignedPlan.parse(input);
  const { ctx, assignment } = await resolveOwnAssignment(
    parsed.teachingAssignmentId,
    parsed.sessionId,
  );
  const result = await ctx.supabase
    .from("lesson_plans")
    .insert({
      organization_id: ctx.active.organizationId,
      school_id: ctx.active.schoolId!,
      session_id: parsed.sessionId,
      academic_period_id: parsed.academicPeriodId,
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
      status: "draft",
      created_by: ctx.user.id,
      updated_by: ctx.user.id,
    })
    .select("id")
    .single();
  if (result.error) throw new LessonOperationError(result.error.code);
  if (!result.data) throw new Error("The lesson plan was not saved");
  return result.data.id;
}

export async function submitOwnLessonPlan(input: unknown) {
  const { id } = z.object({ id: z.string().uuid() }).parse(input);
  const ctx = await context();
  const result = await ctx.supabase
    .from("lesson_plans")
    .update({ status: "submitted", updated_by: ctx.user.id })
    .eq("id", id)
    .eq("organization_id", ctx.active.organizationId)
    .eq("school_id", ctx.active.schoolId!)
    .eq("created_by", ctx.user.id)
    .eq("status", "draft")
    .select("id")
    .single();
  if (result.error) throw new LessonOperationError(result.error.code);
  if (!result.data) throw new Error("The lesson plan was not submitted");
  return result.data.id;
}

export async function recordOwnLessonDelivery(input: unknown) {
  const parsed = assignedDelivery.parse(input);
  const { ctx, assignment } = await resolveOwnAssignment(
    parsed.teachingAssignmentId,
    parsed.sessionId,
  );
  const result = await ctx.supabase
    .from("lesson_deliveries")
    .insert({
      organization_id: ctx.active.organizationId,
      school_id: ctx.active.schoolId!,
      session_id: parsed.sessionId,
      academic_period_id: parsed.academicPeriodId,
      teaching_assignment_id: parsed.teachingAssignmentId,
      lesson_plan_id: parsed.lessonPlanId ?? null,
      curriculum_item_id: parsed.curriculumItemId ?? null,
      subject_id: assignment.subject_id!,
      class_level_id: assignment.class_level_id,
      class_arm_id: assignment.class_arm_id,
      delivered_on: parsed.deliveredOn,
      topic: parsed.topic,
      coverage_notes: parsed.coverageNotes,
      classwork: parsed.classwork ?? null,
      homework: parsed.homework ?? null,
      reflection: parsed.reflection ?? null,
      status: parsed.status,
      recorded_by: ctx.user.id,
      updated_by: ctx.user.id,
    })
    .select("id")
    .single();
  if (result.error) throw new LessonOperationError(result.error.code);
  if (!result.data) throw new Error("The lesson delivery was not saved");
  return result.data.id;
}

export async function updateOwnLessonPlan(input: unknown) {
  const parsed = assignedPlan.extend({ id: z.string().uuid() }).parse(input);
  const { ctx } = await resolveOwnAssignment(
    parsed.teachingAssignmentId,
    parsed.sessionId,
  );
  const result = await ctx.supabase
    .from("lesson_plans")
    .update({
      lesson_date: parsed.lessonDate,
      topic: parsed.topic,
      objectives: parsed.objectives,
      content_outline: parsed.contentOutline,
      teaching_resources: parsed.teachingResources ?? null,
      updated_by: ctx.user.id,
    })
    .eq("id", parsed.id)
    .eq("organization_id", ctx.active.organizationId)
    .eq("school_id", ctx.active.schoolId!)
    .eq("created_by", ctx.user.id)
    .eq("status", "draft")
    .eq("teaching_assignment_id", parsed.teachingAssignmentId)
    .eq("session_id", parsed.sessionId)
    .eq("academic_period_id", parsed.academicPeriodId)
    .select("id")
    .single();
  if (result.error) throw new LessonOperationError(result.error.code);
  if (!result.data) throw new Error("The lesson plan was not saved");
  return result.data.id;
}
