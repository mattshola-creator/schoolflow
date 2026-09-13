"use server";
import { redirect } from "next/navigation";
import { emailSchema } from "@/features/identity/schemas";
import { createClient } from "@/lib/supabase/server";
import { getPasswordRecoveryRedirectUrl } from "@/lib/site-url";
export async function requestReset(formData: FormData) {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/forgot-password?error=Enter+a+valid+email");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getPasswordRecoveryRedirectUrl(),
  });
  redirect("/login?message=If+that+account+exists,+a+reset+link+has+been+sent");
}
