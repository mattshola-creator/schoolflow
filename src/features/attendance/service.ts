import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

import {
  attendanceRegisterQuerySchema,
  attendanceSettingsSchema,
  correctStaffClockEventSchema,
  correctStudentAttendanceEntrySchema,
  recordStaffClockEventSchema,
  staffAttendancePolicySchema,
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

export async function saveAttendanceSettings(input: unknown) {
  const parsed = attendanceSettingsSchema.parse(input);
  const context = await requireAttendanceContext("attendance.configure");
  const { data: userData, error: userError } =
    await context.supabase.auth.getUser();
  if (userError || !userData.user)
    throw new Error("Attendance configuration could not be saved");
  const table = context.supabase.from("attendance_settings");
  const existing = await table
    .select("school_id")
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (existing.error)
    throw new Error("Attendance configuration could not be saved");
  const values = {
    closing_register_enabled: parsed.closingRegisterEnabled,
    lock_after_days: parsed.lockAfterDays,
    enabled_student_statuses: parsed.enabledStudentStatuses,
    student_attendance_days: parsed.studentAttendanceDays,
    lesson_plan_required: parsed.lessonPlanRequired,
    lesson_plan_approval_required: parsed.lessonPlanApprovalRequired,
    updated_by: userData.user.id,
  };
  const result = existing.data
    ? await table
        .update(values)
        .eq("organization_id", context.active.organizationId)
        .eq("school_id", context.active.schoolId!)
    : await table.insert({
        organization_id: context.active.organizationId,
        school_id: context.active.schoolId!,
        morning_register_enabled: true,
        ...values,
        created_by: userData.user.id,
      });
  if (result.error)
    throw new Error("Attendance configuration could not be saved");
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

export async function recordStaffClockEvent(input: unknown) {
  const parsed = recordStaffClockEventSchema.parse(input);
  const context = await requireAttendanceContext(
    "attendance.staff.record",
    "attendance.staff_clock",
  );
  const { data, error } = await context.supabase.rpc(
    "record_staff_clock_event",
    {
      target_organization_id: context.active.organizationId,
      target_school_id: context.active.schoolId!,
      target_staff_assignment_id: parsed.staffAssignmentId,
      target_event_type: parsed.eventType,
      target_occurred_at: parsed.occurredAt,
      target_idempotency_key: parsed.idempotencyKey,
      target_note: (parsed.note ?? null) as string,
    },
  );
  if (error) throw new Error("Staff clock event could not be recorded");
  return data;
}

export async function correctStaffClockEvent(input: unknown) {
  const parsed = correctStaffClockEventSchema.parse(input);
  const context = await requireAttendanceContext(
    "attendance.staff.correct",
    "attendance.staff_clock",
  );
  const { data, error } = await context.supabase.rpc(
    "correct_staff_clock_event",
    {
      target_clock_event_id: parsed.clockEventId,
      target_corrected_occurred_at: parsed.correctedOccurredAt,
      target_reason: parsed.reason,
    },
  );
  if (error) throw new Error("Staff clock correction could not be saved");
  return data;
}

export async function loadStaffClockWorkspace(attendanceDate: string) {
  const date = attendanceRegisterQuerySchema.shape.date.parse(attendanceDate);
  const context = await requireAttendanceContext(
    "attendance.staff.record",
    "attendance.staff_clock",
  );
  const { data, error } = await context.supabase.rpc(
    "list_staff_clock_assignments",
    {
      target_organization_id: context.active.organizationId,
      target_school_id: context.active.schoolId!,
      target_attendance_date: date,
    },
  );
  if (error) throw new Error("Staff attendance could not be loaded");
  return { ...context, assignments: data ?? [] };
}

export async function loadStaffClockCorrections(attendanceDate: string) {
  const date = attendanceRegisterQuerySchema.shape.date.parse(attendanceDate);
  const context = await requireAttendanceContext(
    "attendance.staff.correct",
    "attendance.staff_clock",
  );
  const { data, error } = await context.supabase.rpc(
    "list_staff_clock_correction_events",
    {
      target_organization_id: context.active.organizationId,
      target_school_id: context.active.schoolId!,
      target_attendance_date: date,
    },
  );
  if (error) throw new Error("Staff clock corrections could not be loaded");
  return data ?? [];
}

export async function loadStaffAttendanceSetup() {
  const context = await requireAttendanceContext(
    "attendance.configure",
    "attendance.staff_clock",
  );
  const [positions, policies] = await Promise.all([
    context.supabase.rpc("list_staff_attendance_positions", {
      target_organization_id: context.active.organizationId,
      target_school_id: context.active.schoolId!,
    }),
    context.supabase
      .from("staff_attendance_policies")
      .select(
        "id, position_id, name, working_days, starts_at, ends_at, grace_minutes, effective_from, effective_to, status",
      )
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("name"),
  ]);
  if (positions.error || policies.error)
    throw new Error("Staff attendance setup could not be loaded");
  return {
    ...context,
    positions: positions.data ?? [],
    policies: policies.data ?? [],
  };
}

export async function saveStaffAttendancePolicy(input: unknown) {
  const parsed = staffAttendancePolicySchema.parse(input);
  const context = await requireAttendanceContext(
    "attendance.configure",
    "attendance.staff_clock",
  );
  const { data: userData, error: userError } =
    await context.supabase.auth.getUser();
  if (userError || !userData.user)
    throw new Error("Staff attendance policy could not be saved");

  const table = context.supabase.from("staff_attendance_policies");
  let existingQuery = table
    .select("id")
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .eq("status", "active");
  existingQuery = parsed.positionId
    ? existingQuery.eq("position_id", parsed.positionId)
    : existingQuery.is("position_id", null);
  const existing = await existingQuery.maybeSingle();
  if (existing.error)
    throw new Error("Staff attendance policy could not be saved");

  const values = {
    position_id: parsed.positionId ?? null,
    name: parsed.name,
    working_days: parsed.workingDays,
    starts_at: parsed.startsAt,
    ends_at: parsed.endsAt,
    grace_minutes: parsed.graceMinutes,
    effective_from: parsed.effectiveFrom,
    effective_to: parsed.effectiveTo ?? null,
    updated_by: userData.user.id,
  };
  const result = existing.data
    ? await table.update(values).eq("id", existing.data.id)
    : await table.insert({
        organization_id: context.active.organizationId,
        school_id: context.active.schoolId!,
        status: "active",
        ...values,
        created_by: userData.user.id,
      });
  if (result.error)
    throw new Error("Staff attendance policy could not be saved");
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
