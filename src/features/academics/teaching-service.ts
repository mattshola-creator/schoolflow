import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import {
  teachingAssignmentLifecycleSchema,
  teachingAssignmentSchema,
  type TeachingAssignmentInput,
} from "./teaching-schemas";

export const teachingManagementCapability = {
  permission: "academics.teaching_assignments.view",
  module: "academics",
  feature: "academics.teaching_management",
} as const;

export async function requireTeachingContext(
  permission = "academics.teaching_assignments.view",
) {
  const authorization = await requireCapability({
    permission,
    module: "academics",
    feature: "academics.teaching_management",
  });
  if (!authorization.schoolId) throw new Error("A school context is required");
  const [{ supabase, user }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !active ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active school context is invalid");
  return { supabase, user, active, authorization };
}

export async function loadTeachingAssignments(sessionId: string) {
  const context = await requireTeachingContext();
  const assignments = await context.supabase
    .from("teaching_assignments")
    .select(
      "id, assignment_type, status, started_on, ended_on, staff_assignment_id, subject_id, class_level_id, class_arm_id",
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .eq("session_id", sessionId)
    .order("started_on");
  if (assignments.error)
    throw new Error("Teaching assignments could not be loaded");
  return { ...context, assignments: assignments.data ?? [] };
}

export async function loadTeachingAssignmentWorkspace() {
  const context = await requireTeachingContext();
  const [
    sessions,
    levels,
    arms,
    subjects,
    staffAssignments,
    profiles,
    assignments,
  ] = await Promise.all([
    context.supabase
      .from("academic_sessions")
      .select("id, name, start_date, end_date, status")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .in("status", ["planned", "current"])
      .order("start_date", { ascending: false }),
    context.supabase
      .from("class_levels")
      .select("id, name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
    context.supabase
      .from("class_arms")
      .select("id, class_level_id, name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
    context.supabase
      .from("subjects")
      .select("id, name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
    context.supabase
      .from("staff_assignments")
      .select(
        "id, staff_profile_id, started_on, ended_on, positions!inner(name, is_teaching)",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .eq("positions.is_teaching", true)
      .order("started_on"),
    context.supabase
      .from("staff_profiles")
      .select("id, staff_number, people!inner(first_name, last_name)")
      .eq("organization_id", context.active.organizationId)
      .eq("status", "active"),
    context.supabase
      .from("teaching_assignments")
      .select(
        "id, session_id, assignment_type, status, started_on, ended_on, staff_assignment_id, subject_id, class_level_id, class_arm_id",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .in("status", ["planned", "active"])
      .order("started_on", { ascending: false }),
  ]);
  if (
    [
      sessions,
      levels,
      arms,
      subjects,
      staffAssignments,
      profiles,
      assignments,
    ].some((x) => x.error)
  )
    throw new Error("Teaching assignments could not be loaded");
  const profileMap = new Map(
    (profiles.data ?? []).map((profile) => [profile.id, profile]),
  );
  return {
    ...context,
    sessions: sessions.data ?? [],
    levels: levels.data ?? [],
    arms: arms.data ?? [],
    subjects: subjects.data ?? [],
    staff: (staffAssignments.data ?? []).flatMap((assignment) => {
      const profile = profileMap.get(assignment.staff_profile_id);
      return profile ? [{ ...assignment, staff_profiles: profile }] : [];
    }),
    assignments: assignments.data ?? [],
  };
}

export async function createTeachingAssignment(input: TeachingAssignmentInput) {
  const parsed = teachingAssignmentSchema.parse(input);
  const context = await requireTeachingContext(
    "academics.teaching_assignments.manage",
  );
  const { error } = await context.supabase.from("teaching_assignments").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    session_id: parsed.sessionId,
    staff_assignment_id: parsed.staffAssignmentId,
    subject_id: parsed.subjectId ?? null,
    class_level_id: parsed.classLevelId,
    class_arm_id: parsed.classArmId ?? null,
    assignment_type: parsed.assignmentType,
    status: "active",
    started_on: parsed.startedOn,
    ended_on: parsed.endedOn ?? null,
  });
  if (error) throw new Error("Teaching assignment could not be created");
}

export async function updateTeachingAssignmentLifecycle(input: unknown) {
  const parsed = teachingAssignmentLifecycleSchema.parse(input);
  const context = await requireTeachingContext(
    "academics.teaching_assignments.manage",
  );
  if (parsed.status === "ended" && !parsed.endedOn)
    throw new Error("An end date is required");
  const { error } = await context.supabase
    .from("teaching_assignments")
    .update({
      status: parsed.status,
      ended_on: parsed.status === "ended" ? parsed.endedOn : null,
      updated_by: context.user.id,
    })
    .eq("id", parsed.assignmentId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!);
  if (error) throw new Error("Teaching assignment could not be updated");
}
