"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createLessonDelivery,
  createHomeworkAssignment,
  createLessonPlan,
  updateLessonPlanStatus,
  updateHomeworkStatus,
} from "@/features/academics/lesson-service";
import {
  lessonDeliverySchema,
  homeworkAssignmentSchema,
  homeworkStatusSchema,
  lessonPlanReviewSchema,
  lessonPlanSchema,
} from "@/features/academics/lesson-schemas";

const target = "/teaching/lessons";

export async function saveLessonPlan(formData: FormData) {
  const parsed = lessonPlanSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect(`${target}?error=Check+the+lesson+plan+details`);
  try {
    await createLessonPlan(parsed.data);
  } catch {
    redirect(`${target}?error=The+lesson+plan+could+not+be+created`);
  }
  revalidatePath(target);
  redirect(`${target}?message=Lesson+plan+created`);
}

export async function changeLessonPlanStatus(formData: FormData) {
  const parsed = lessonPlanReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${target}?error=Check+the+lesson+plan+update`);
  try {
    await updateLessonPlanStatus(parsed.data);
  } catch {
    redirect(`${target}?error=The+lesson+plan+could+not+be+updated`);
  }
  revalidatePath(target);
  redirect(`${target}?message=Lesson+plan+updated`);
}

export async function saveLessonDelivery(formData: FormData) {
  const parsed = lessonDeliverySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect(`${target}?error=Check+the+lesson+delivery+details`);
  try {
    await createLessonDelivery(parsed.data);
  } catch {
    redirect(`${target}?error=The+lesson+delivery+could+not+be+recorded`);
  }
  revalidatePath(target);
  redirect(`${target}?message=Lesson+delivery+recorded`);
}

export async function saveHomeworkAssignment(formData: FormData) {
  const parsed = homeworkAssignmentSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) redirect(`${target}?error=Check+the+homework+details`);
  try {
    await createHomeworkAssignment(parsed.data);
  } catch {
    redirect(`${target}?error=The+homework+could+not+be+created`);
  }
  revalidatePath(target);
  redirect(`${target}?message=Homework+created`);
}

export async function changeHomeworkStatus(formData: FormData) {
  const parsed = homeworkStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${target}?error=Check+the+homework+update`);
  try {
    await updateHomeworkStatus(parsed.data);
  } catch {
    redirect(`${target}?error=The+homework+could+not+be+updated`);
  }
  revalidatePath(target);
  redirect(`${target}?message=Homework+updated`);
}
