"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { lessonActionFailure } from "@/features/academics/lesson-operation-error";
import {
  createOwnLessonPlan,
  updateOwnLessonPlan,
  submitOwnLessonPlan,
  recordOwnLessonDelivery,
} from "@/features/academics/own-teaching-service";

export async function saveOwnTeaching(form: FormData) {
  const operation = z
    .enum(["create", "edit", "submit", "deliver"])
    .safeParse(form.get("operation"));
  if (!operation.success)
    redirect("/teaching/own?error=Invalid+lesson+operation");
  const input = Object.fromEntries(form);
  try {
    switch (operation.data) {
      case "create":
        await createOwnLessonPlan(input);
        break;
      case "edit":
        await updateOwnLessonPlan(input);
        break;
      case "submit":
        await submitOwnLessonPlan(input);
        break;
      case "deliver":
        await recordOwnLessonDelivery(input);
        break;
    }
  } catch (error) {
    redirect(
      `/teaching/own?error=${encodeURIComponent(lessonActionFailure(error, "The lesson operation could not be completed"))}`,
    );
  }
  revalidatePath("/teaching/own");
  revalidatePath("/workspace/teacher");
  redirect("/teaching/own?message=Lesson+operation+saved");
}
