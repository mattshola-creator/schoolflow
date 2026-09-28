import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

import {
  correctStudentAttendanceEntrySchema,
  submitStudentAttendanceRegisterSchema,
} from "./schemas";

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
        "morning_register_enabled, closing_register_enabled, lock_after_days, enabled_student_statuses, student_attendance_days, lesson_plan_required, lesson_plan_approval_required",
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

export async function submitStudentAttendanceRegister(input: unknown) {
  const parsed = submitStudentAttendanceRegisterSchema.parse(input);
  const context = await requireAttendanceContext("attendance.student.record");
  const { data, error } = await context.supabase.rpc(
    "submit_student_attendance_register",
    {
      target_organization_id: context.active.organizationId,
      target_school_id: context.active.schoolId!,
      target_session_id: parsed.sessionId,
      target_class_level_id: parsed.classLevelId,
      // Generated RPC arguments do not express nullable PostgreSQL parameters.
      target_class_arm_id: (parsed.classArmId ?? null) as string,
      target_attendance_date: parsed.attendanceDate,
      target_register_type: parsed.registerType,
      target_idempotency_key: parsed.idempotencyKey,
      target_entries: parsed.entries,
    },
  );
  if (error) throw new Error("Attendance register could not be submitted");
  return data;
}

export async function correctStudentAttendanceEntry(input: unknown) {
  const parsed = correctStudentAttendanceEntrySchema.parse(input);
  const context = await requireAttendanceContext("attendance.student.correct");
  const { data, error } = await context.supabase.rpc(
    "correct_student_attendance_entry",
    {
      target_entry_id: parsed.entryId,
      target_new_status: parsed.status,
      target_reason: parsed.reason,
    },
  );
  if (error) throw new Error("Attendance correction could not be saved");
  return data;
}

export async function loadStudentAttendanceWorkspace(attendanceDate: string) {
  const context = await requireAttendanceContext();
  const [settings, scopes] = await Promise.all([
    context.supabase
      .from("attendance_settings")
      .select(
        "morning_register_enabled, closing_register_enabled, lock_after_days, enabled_student_statuses, student_attendance_days",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .maybeSingle(),
    context.supabase.rpc("list_student_attendance_scopes", {
      target_organization_id: context.active.organizationId,
      target_school_id: context.active.schoolId!,
      target_attendance_date: attendanceDate,
    }),
  ]);
  if (settings.error || scopes.error)
    throw new Error("Student attendance could not be loaded");
  return {
    ...context,
    settings: settings.data,
    scopes: scopes.data ?? [],
  };
}

export async function loadStudentAttendanceRoster(input: {
  sessionId: string;
  classLevelId: string;
  classArmId?: string;
  attendanceDate: string;
  registerType: "morning" | "closing";
}) {
  const context = await requireAttendanceContext("attendance.student.record");
  const { data, error } = await context.supabase.rpc(
    "get_student_attendance_roster",
    {
      target_organization_id: context.active.organizationId,
      target_school_id: context.active.schoolId!,
      target_session_id: input.sessionId,
      target_class_level_id: input.classLevelId,
      // Generated RPC arguments do not express nullable PostgreSQL parameters.
      target_class_arm_id: (input.classArmId ?? null) as string,
      target_attendance_date: input.attendanceDate,
      target_register_type: input.registerType,
    },
  );
  if (error) throw new Error("Student attendance roster could not be loaded");
  return { ...context, roster: data ?? [] };
}
