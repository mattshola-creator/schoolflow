"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createTimetableEntry,
  createTimetablePeriod,
} from "@/features/academics/teaching-service";
import {
  timetableEntrySchema,
  timetablePeriodSchema,
} from "@/features/academics/teaching-schemas";

export async function saveTimetablePeriod(formData: FormData) {
  const parsed = timetablePeriodSchema.safeParse({
    sessionId: formData.get("sessionId"),
    weekday: formData.get("weekday"),
    name: formData.get("name"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
  if (!parsed.success)
    redirect("/teaching/timetable?error=Check+the+period+details");
  try {
    await createTimetablePeriod(parsed.data);
  } catch {
    redirect("/teaching/timetable?error=The+period+could+not+be+created");
  }
  revalidatePath("/teaching/timetable");
  redirect("/teaching/timetable?message=Timetable+period+created");
}

export async function saveTimetableEntry(formData: FormData) {
  const parsed = timetableEntrySchema.safeParse({
    sessionId: formData.get("sessionId"),
    periodId: formData.get("periodId"),
    teachingAssignmentId: formData.get("teachingAssignmentId"),
    acknowledgeConflict: formData.get("acknowledgeConflict"),
    notes: formData.get("notes"),
  });
  if (!parsed.success)
    redirect("/teaching/timetable?error=Check+the+allocation+details");
  let result: Awaited<ReturnType<typeof createTimetableEntry>>;
  try {
    result = await createTimetableEntry(parsed.data);
  } catch {
    redirect("/teaching/timetable?error=The+allocation+could+not+be+created");
  }
  if (!result.created) {
    const kinds = result.conflictKinds.join("+and+");
    redirect(
      `/teaching/timetable?warning=${kinds}+conflict+detected.+Review+and+acknowledge+before+saving`,
    );
  }
  revalidatePath("/teaching/timetable");
  redirect("/teaching/timetable?message=Timetable+allocation+created");
}
