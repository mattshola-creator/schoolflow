"use server";
import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { invitationSchema } from "@/features/identity/schemas";
import { requireUser } from "@/lib/auth";
export async function acceptInvitation(formData: FormData) {
  const parsed = invitationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect("/accept-invitation?error=Invitation+link+is+invalid");
  const { supabase } = await requireUser();
  const tokenHash = createHash("sha256")
    .update(parsed.data.token)
    .digest("hex");
  const { error } = await supabase.rpc("accept_invitation", {
    p_token_hash: tokenHash,
  });
  if (error)
    redirect(
      "/accept-invitation?error=Invitation+is+invalid,+expired,+or+belongs+to+another+account",
    );
  redirect("/dashboard?message=Invitation+accepted");
}
