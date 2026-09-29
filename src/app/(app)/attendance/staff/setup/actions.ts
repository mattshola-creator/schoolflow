"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { staffAttendancePolicySchema } from "@/features/attendance/schemas";
import { saveStaffAttendancePolicy } from "@/features/attendance/service";

export async function saveWorkingHoursPolicy(formData: FormData) {
  const parsed = staffAttendancePolicySchema.safeParse({
    positionId: formData.get("positionId") || undefined,
    name: formData.get("name"),
    workingDays: formData.getAll("workingDays"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    graceMinutes: formData.get("graceMinutes"),
    effectiveFrom: formData.get("effectiveFrom"),
    effectiveTo: formData.get("effectiveTo") || undefined,
  });
  if (!parsed.success)
    redirect(
      "/attendance/staff/setup?error=The+working-hours+policy+is+invalid",
    );
  try {
    await saveStaffAttendancePolicy(parsed.data);
  } catch {
    redirect(
      "/attendance/staff/setup?error=The+working-hours+policy+could+not+be+saved",
    );
  }
  revalidatePath("/attendance/staff/setup");
  revalidatePath("/attendance/staff");
  redirect("/attendance/staff/setup?message=Staff+working-hours+policy+saved");
}
