import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

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
  const [{ supabase }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !active ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active school context is invalid");
  return { supabase, active, authorization };
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
