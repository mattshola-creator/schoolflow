"use server";
import { revalidatePath } from "next/cache";
import { createAndPublishNotice } from "@/features/communication/service";
import { noticeSchema } from "@/features/communication/schemas";

export async function publishNotice(formData: FormData) {
  const input = noticeSchema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    priority: formData.get("priority"),
    audienceKind: formData.get("audienceKind"),
  });
  await createAndPublishNotice(input);
  revalidatePath("/communication");
}
