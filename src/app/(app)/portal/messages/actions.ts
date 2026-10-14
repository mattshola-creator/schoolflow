"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendPortalMessage } from "@/features/communication/service";
import { messageSchema } from "@/features/communication/schemas";

export async function replyToPortalMessage(formData: FormData) {
  const input = messageSchema.parse({
    threadId: formData.get("threadId"),
    body: formData.get("body"),
    requestId: formData.get("requestId"),
  });
  try {
    await sendPortalMessage(input.threadId, input.body, input.requestId);
  } catch {
    redirect("/portal/messages?error=send");
  }
  revalidatePath("/portal/messages");
  redirect("/portal/messages?sent=1");
}
