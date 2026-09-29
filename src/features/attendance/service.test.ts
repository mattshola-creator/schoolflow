import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireCapability,
  requireUser,
  loadTenantContext,
  rpc,
  from,
  insert,
  update,
  select,
  eq,
  is,
  maybeSingle,
} = vi.hoisted(() => ({
  requireCapability: vi.fn(),
  requireUser: vi.fn(),
  loadTenantContext: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/authorization", () => ({ requireCapability }));
vi.mock("@/lib/auth", () => ({ requireUser }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext }));

import {
  correctStaffClockEvent,
  correctStudentAttendanceEntry,
  loadStaffClockWorkspace,
  recordStaffClockEvent,
  requireAttendanceContext,
  saveAttendanceSettings,
  saveStaffAttendancePolicy,
  submitStudentAttendanceRegister,
} from "./service";

const authorization = {
  organizationId: crypto.randomUUID(),
  schoolId: crypto.randomUUID(),
};

describe("attendance context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCapability.mockResolvedValue(authorization);
    rpc.mockResolvedValue({ data: crypto.randomUUID(), error: null });
    insert.mockResolvedValue({ error: null });
    update.mockReturnValue({ eq });
    select.mockReturnValue({ eq });
    eq.mockReturnValue({ eq, is, maybeSingle });
    is.mockReturnValue({ maybeSingle });
    maybeSingle.mockResolvedValue({ data: null, error: null });
    from.mockReturnValue({ insert, update, select });
    requireUser.mockResolvedValue({
      supabase: {
        rpc,
        from,
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: crypto.randomUUID() } },
            error: null,
          }),
        },
      },
    });
    loadTenantContext.mockResolvedValue({
      active: {
        organizationId: authorization.organizationId,
        schoolId: authorization.schoolId,
      },
    });
  });

  it("requires the exact student-attendance capability", async () => {
    await expect(requireAttendanceContext()).resolves.toMatchObject({
      authorization,
    });
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.view",
      module: "attendance",
      feature: "attendance.student_registers",
    });
  });

  it("does not reuse student-register access for staff attendance", async () => {
    await requireAttendanceContext(
      "attendance.staff.record",
      "attendance.staff_clock",
    );
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.staff.record",
      module: "attendance",
      feature: "attendance.staff_clock",
    });
  });

  it("fails closed when active context differs from authorization", async () => {
    loadTenantContext.mockResolvedValue({
      active: {
        organizationId: authorization.organizationId,
        schoolId: crypto.randomUUID(),
      },
    });
    await expect(requireAttendanceContext()).rejects.toThrow(
      "The active school context is invalid",
    );
  });

  it("submits one validated payload through the caller-bound RPC", async () => {
    const input = {
      sessionId: crypto.randomUUID(),
      classLevelId: crypto.randomUUID(),
      attendanceDate: "2026-09-28",
      registerType: "morning" as const,
      idempotencyKey: crypto.randomUUID(),
      entries: [{ studentId: crypto.randomUUID(), status: "present" as const }],
    };
    await submitStudentAttendanceRegister(input);
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.student.record",
      module: "attendance",
      feature: "attendance.student_registers",
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "submit_student_attendance_register",
      expect.objectContaining({
        target_organization_id: authorization.organizationId,
        target_school_id: authorization.schoolId,
        target_idempotency_key: input.idempotencyKey,
        target_entries: input.entries,
      }),
    );
  });

  it("uses the correction RPC once and returns a safe error", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "sensitive database detail" },
    });
    await expect(
      correctStudentAttendanceEntry({
        entryId: crypto.randomUUID(),
        status: "excused",
        reason: "Medical note received",
      }),
    ).rejects.toThrow("Attendance correction could not be saved");
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.student.correct",
      module: "attendance",
      feature: "attendance.student_registers",
    });
  });

  it("records one caller-bound staff clock event", async () => {
    const input = {
      staffAssignmentId: crypto.randomUUID(),
      eventType: "clock_in" as const,
      occurredAt: "2026-09-28T07:30:00+01:00",
      idempotencyKey: crypto.randomUUID(),
      note: "Office clock",
    };
    await recordStaffClockEvent(input);
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.staff.record",
      module: "attendance",
      feature: "attendance.staff_clock",
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("record_staff_clock_event", {
      target_organization_id: authorization.organizationId,
      target_school_id: authorization.schoolId,
      target_staff_assignment_id: input.staffAssignmentId,
      target_event_type: input.eventType,
      target_occurred_at: input.occurredAt,
      target_idempotency_key: input.idempotencyKey,
      target_note: input.note,
    });
  });

  it("does not retry or expose a staff correction RPC failure", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "protected database detail" },
    });
    await expect(
      correctStaffClockEvent({
        clockEventId: crypto.randomUUID(),
        correctedOccurredAt: "2026-09-28T08:00:00+01:00",
        reason: "Approved time correction",
      }),
    ).rejects.toThrow("Staff clock correction could not be saved");
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.staff.correct",
      module: "attendance",
      feature: "attendance.staff_clock",
    });
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("loads only the caller-bound staff clock workspace", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    await loadStaffClockWorkspace("2026-09-28");
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.staff.record",
      module: "attendance",
      feature: "attendance.staff_clock",
    });
    expect(rpc).toHaveBeenCalledWith("list_staff_clock_assignments", {
      target_organization_id: authorization.organizationId,
      target_school_id: authorization.schoolId,
      target_attendance_date: "2026-09-28",
    });
  });

  it("saves one school-scoped staff working-hours policy", async () => {
    await saveStaffAttendancePolicy({
      name: "Teaching staff",
      workingDays: [1, 2, 3, 4, 5],
      startsAt: "07:30:00",
      endsAt: "16:00:00",
      graceMinutes: 15,
      effectiveFrom: "2026-09-01",
    });
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.configure",
      module: "attendance",
      feature: "attendance.staff_clock",
    });
    expect(from).toHaveBeenCalledWith("staff_attendance_policies");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: authorization.organizationId,
        school_id: authorization.schoolId,
        position_id: null,
        working_days: [1, 2, 3, 4, 5],
      }),
    );
  });

  it("saves one validated caller-bound attendance policy", async () => {
    await saveAttendanceSettings({
      closingRegisterEnabled: false,
      lockAfterDays: 1,
      enabledStudentStatuses: [
        "present",
        "late",
        "absent",
        "excused",
        "left_early",
      ],
      studentAttendanceDays: [1, 2, 3, 4, 5],
      lessonPlanRequired: false,
      lessonPlanApprovalRequired: false,
    });
    expect(requireCapability).toHaveBeenCalledWith({
      permission: "attendance.configure",
      module: "attendance",
      feature: "attendance.student_registers",
    });
    expect(from).toHaveBeenCalledWith("attendance_settings");
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: authorization.organizationId,
        school_id: authorization.schoolId,
        morning_register_enabled: true,
        closing_register_enabled: false,
        lock_after_days: 1,
        student_attendance_days: [1, 2, 3, 4, 5],
      }),
    );
  });
});
