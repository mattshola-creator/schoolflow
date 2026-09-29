"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordStaffClockEvent } from "@/features/attendance/service";

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
