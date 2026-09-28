"use server";

import { redirect } from "next/navigation";
import {
  attendanceRegisterQuerySchema,
  parseAttendanceScopeKey,
  submitStudentAttendanceRegisterSchema,
} from "@/features/attendance/schemas";
import { submitStudentAttendanceRegister } from "@/features/attendance/service";

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
