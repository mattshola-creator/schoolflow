"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createTeachingAssignment,
  updateTeachingAssignmentLifecycle,
} from "@/features/academics/teaching-service";
import {
  teachingAssignmentLifecycleSchema,
  teachingAssignmentSchema,
} from "@/features/academics/teaching-schemas";

export async function saveTeachingAssignment(formData: FormData) {
  const parsed = teachingAssignmentSchema.safeParse({
    sessionId: formData.get("sessionId"),
    staffAssignmentId: formData.get("staffAssignmentId"),
    assignmentType: formData.get("assignmentType"),
    subjectId: formData.get("subjectId"),
    classLevelId: formData.get("classLevelId"),
    classArmId: formData.get("classArmId"),
    startedOn: formData.get("startedOn"),
    endedOn: formData.get("endedOn"),
  });
  if (!parsed.success)
    redirect("/teaching?error=Check+the+teaching+assignment+details");
  try {
    await createTeachingAssignment(parsed.data);
  } catch {
    redirect("/teaching?error=The+teaching+assignment+could+not+be+created");
  }
  revalidatePath("/teaching");
  redirect("/teaching?message=Teaching+assignment+created");
}

export async function changeTeachingAssignment(formData: FormData) {
  const parsed = teachingAssignmentLifecycleSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
    status: formData.get("status"),
    endedOn: formData.get("endedOn"),
  });
  if (!parsed.success)
    redirect("/teaching?error=The+assignment+change+is+invalid");
  try {
    await updateTeachingAssignmentLifecycle(parsed.data);
  } catch {
    redirect("/teaching?error=The+teaching+assignment+could+not+be+updated");
  }
  revalidatePath("/teaching");
  redirect("/teaching?message=Teaching+assignment+updated");
}
