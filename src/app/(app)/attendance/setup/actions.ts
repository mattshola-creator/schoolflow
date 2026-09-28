"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { attendanceSettingsSchema } from "@/features/attendance/schemas";
import { saveAttendanceSettings } from "@/features/attendance/service";

function failed(): never {
  redirect("/attendance/setup?error=The+attendance+policy+could+not+be+saved");
}

export async function saveAttendancePolicy(formData: FormData) {
  const parsed = attendanceSettingsSchema.safeParse({
    closingRegisterEnabled: formData.get("closingRegisterEnabled") === "on",
    lockAfterDays: formData.get("lockAfterDays"),
    enabledStudentStatuses: formData.getAll("enabledStudentStatuses"),
    studentAttendanceDays: formData.getAll("studentAttendanceDays"),
    lessonPlanRequired: false,
    lessonPlanApprovalRequired: false,
  });
  if (!parsed.success) failed();
  try {
    await saveAttendanceSettings(parsed.data);
  } catch {
    failed();
  }
  revalidatePath("/attendance/setup");
  revalidatePath("/attendance");
  redirect("/attendance/setup?message=Attendance+policy+saved");
}
