"use server";

import { redirect } from "next/navigation";
import {
  attendanceRegisterQuerySchema,
  correctStudentAttendanceEntrySchema,
  parseAttendanceScopeKey,
  submitStudentAttendanceRegisterSchema,
} from "@/features/attendance/schemas";
import {
  correctStudentAttendanceEntry,
  submitStudentAttendanceRegister,
} from "@/features/attendance/service";

function destination(
  query: { date: string; type: "morning" | "closing"; scope: string },
  kind: "error" | "message",
  notice: string,
) {
  const params = new URLSearchParams({ ...query, [kind]: notice });
  return `/attendance?${params.toString()}`;
}

export async function submitAttendanceRegister(formData: FormData) {
  const query = attendanceRegisterQuerySchema.safeParse({
    date: formData.get("attendanceDate"),
    type: formData.get("registerType"),
    scope: formData.get("scope"),
  });
  if (!query.success || !query.data.scope)
    redirect(
      "/attendance?error=The+attendance+register+could+not+be+submitted",
    );
  const scope = parseAttendanceScopeKey(query.data.scope);
  if (!scope)
    redirect(
      "/attendance?error=The+attendance+register+could+not+be+submitted",
    );

  const entries = formData.getAll("studentId").map((value) => {
    const studentId = String(value);
    return {
      studentId,
      status: formData.get(`status:${studentId}`),
      note: formData.get(`note:${studentId}`) || undefined,
    };
  });
  const parsed = submitStudentAttendanceRegisterSchema.safeParse({
    ...scope,
    attendanceDate: query.data.date,
    registerType: query.data.type,
    idempotencyKey: formData.get("idempotencyKey"),
    entries,
  });
  if (!parsed.success)
    redirect(
      destination(
        { ...query.data, scope: query.data.scope },
        "error",
        "Check every attendance entry and try again",
      ),
    );
  try {
    await submitStudentAttendanceRegister(parsed.data);
  } catch {
    redirect(
      destination(
        { ...query.data, scope: query.data.scope },
        "error",
        "The attendance register could not be submitted",
      ),
    );
  }
  redirect(
    destination(
      { ...query.data, scope: query.data.scope },
      "message",
      "Attendance register submitted",
    ),
  );
}

export async function correctAttendanceEntry(formData: FormData) {
  const query = attendanceRegisterQuerySchema.safeParse({
    date: formData.get("attendanceDate"),
    type: formData.get("registerType"),
    scope: formData.get("scope"),
  });
  const correction = correctStudentAttendanceEntrySchema.safeParse({
    entryId: formData.get("entryId"),
    status: formData.get("status"),
    reason: formData.get("reason"),
  });
  if (!query.success || !query.data.scope || !correction.success)
    redirect("/attendance?error=The+attendance+correction+could+not+be+saved");

  try {
    await correctStudentAttendanceEntry(correction.data);
  } catch {
    redirect(
      destination(
        { ...query.data, scope: query.data.scope },
        "error",
        "The attendance correction could not be saved",
      ),
    );
  }
  redirect(
    destination(
      { ...query.data, scope: query.data.scope },
      "message",
      "Attendance correction saved",
    ),
  );
}
