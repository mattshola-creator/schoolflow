"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCurriculumItem,
  updateCurriculumCoverage,
} from "@/features/academics/curriculum-service";
import {
  curriculumCoverageSchema,
  curriculumItemSchema,
} from "@/features/academics/curriculum-schemas";

export async function saveCurriculumItem(formData: FormData) {
  const parsed = curriculumItemSchema.safeParse({
    sessionId: formData.get("sessionId"),
    academicPeriodId: formData.get("academicPeriodId"),
    teachingAssignmentId: formData.get("teachingAssignmentId"),
    sequence: formData.get("sequence"),
    title: formData.get("title"),
    learningObjectives: formData.get("learningObjectives"),
    plannedStart: formData.get("plannedStart"),
    plannedEnd: formData.get("plannedEnd"),
  });
  if (!parsed.success)
    redirect("/teaching/curriculum?error=Check+the+curriculum+details");
  try {
    await createCurriculumItem(parsed.data);
  } catch {
    redirect(
      "/teaching/curriculum?error=The+curriculum+item+could+not+be+created",
    );
  }
  revalidatePath("/teaching/curriculum");
  redirect("/teaching/curriculum?message=Curriculum+item+created");
}

export async function changeCurriculumCoverage(formData: FormData) {
  const parsed = curriculumCoverageSchema.safeParse({
    curriculumItemId: formData.get("curriculumItemId"),
    status: formData.get("status"),
    completedOn: formData.get("completedOn"),
  });
  if (!parsed.success)
    redirect("/teaching/curriculum?error=Check+the+coverage+update");
  try {
    await updateCurriculumCoverage(parsed.data);
  } catch {
    redirect("/teaching/curriculum?error=Coverage+could+not+be+updated");
  }
  revalidatePath("/teaching/curriculum");
  redirect("/teaching/curriculum?message=Curriculum+coverage+updated");
}
