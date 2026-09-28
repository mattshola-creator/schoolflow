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
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/authorization", () => ({ requireCapability }));
vi.mock("@/lib/auth", () => ({ requireUser }));
vi.mock("@/lib/tenant-context", () => ({ loadTenantContext }));

import {
  correctStudentAttendanceEntry,
  requireAttendanceContext,
  saveAttendanceSettings,
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
    eq.mockReturnValue({ eq, maybeSingle });
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
