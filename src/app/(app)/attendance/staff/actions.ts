"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  correctStaffClockEvent,
  recordStaffClockEvent,
} from "@/features/attendance/service";

function staffAttendanceUrl(
  date: string,
  kind: "error" | "message",
  message: string,
) {
  const params = new URLSearchParams({ date, [kind]: message });
  return `/attendance/staff?${params.toString()}`;
}

export async function recordStaffClock(formData: FormData) {
  const assignmentId = formData.get("staffAssignmentId");
  const eventType = formData.get("eventType");
  const idempotencyKey = formData.get("idempotencyKey");
  const note = formData.get("note");
  if (
    typeof assignmentId !== "string" ||
    (eventType !== "clock_in" && eventType !== "clock_out") ||
    typeof idempotencyKey !== "string" ||
    (typeof note !== "string" && note !== null)
  )
    redirect("/attendance/staff?error=The+clock+request+is+invalid");

  try {
    await recordStaffClockEvent({
      staffAssignmentId: assignmentId,
      eventType,
      idempotencyKey,
      occurredAt: new Date().toISOString(),
      note: note?.trim() || undefined,
    });
  } catch {
    redirect("/attendance/staff?error=The+clock+event+could+not+be+recorded");
  }
  revalidatePath("/attendance/staff");
  redirect("/attendance/staff?message=Staff+clock+event+recorded");
}

export async function correctStaffClock(formData: FormData) {
  const clockEventId = formData.get("clockEventId");
  const attendanceDate = formData.get("attendanceDate");
  const correctedTime = formData.get("correctedTime");
  const reason = formData.get("reason");
  if (
    typeof clockEventId !== "string" ||
    typeof attendanceDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate) ||
    typeof correctedTime !== "string" ||
    !/^\d{2}:\d{2}$/.test(correctedTime) ||
    typeof reason !== "string"
  )
    redirect(
      staffAttendanceUrl(
        typeof attendanceDate === "string" ? attendanceDate : "",
        "error",
        "The correction request is invalid",
      ),
    );

  try {
    await correctStaffClockEvent({
      clockEventId,
      correctedOccurredAt: `${attendanceDate}T${correctedTime}:00+01:00`,
      reason,
    });
  } catch {
    redirect(
      staffAttendanceUrl(
        attendanceDate,
        "error",
        "The clock correction could not be saved",
      ),
    );
  }
  revalidatePath("/attendance/staff");
  redirect(
    staffAttendanceUrl(
      attendanceDate,
      "message",
      "Staff clock correction saved",
    ),
  );
}
