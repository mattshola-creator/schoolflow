import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

export const studentAttendanceCapability = {
  permission: "attendance.view",
  module: "attendance",
  feature: "attendance.student_registers",
} as const;

export async function requireAttendanceContext(
  permission = "attendance.view",
  feature:
    | "attendance.student_registers"
    | "attendance.staff_clock" = "attendance.student_registers",
) {
  const authorization = await requireCapability({
    permission,
    module: "attendance",
    feature,
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

export async function loadAttendanceFoundation() {
  const context = await requireAttendanceContext();
  const [settings, calendar] = await Promise.all([
    context.supabase
      .from("attendance_settings")
      .select(
        "morning_register_enabled, closing_register_enabled, lock_after_days, enabled_student_statuses, lesson_plan_required, lesson_plan_approval_required",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .maybeSingle(),
    context.supabase
      .from("school_calendar_exceptions")
      .select("id, session_id, calendar_date, is_teaching_day, label")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("calendar_date"),
  ]);
  if (settings.error || calendar.error)
    throw new Error("Attendance configuration could not be loaded");
  return {
    ...context,
    settings: settings.data,
    calendarExceptions: calendar.data ?? [],
  };
}
