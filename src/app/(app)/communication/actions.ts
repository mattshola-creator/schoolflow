"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAndPublishNotice } from "@/features/communication/service";
import { noticeSchema } from "@/features/communication/schemas";
import { AuthorizationError } from "@/lib/authorization";

export async function publishNotice(formData: FormData) {
  const input = noticeSchema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    priority: formData.get("priority"),
    audienceKind: formData.get("audienceKind"),
  });
  try {
    await createAndPublishNotice(input);
  } catch (error) {
    if (error instanceof AuthorizationError)
      redirect("/communication?message=unavailable");
    throw error;
  }
  revalidatePath("/communication");
  redirect("/communication?message=published");
}
