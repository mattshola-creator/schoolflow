"use server";
import { redirect } from "next/navigation";
import { passwordSchema } from "@/features/identity/schemas";
import { createClient } from "@/lib/supabase/server";
export async function updatePassword(formData: FormData) {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect(
      "/update-password?error=Passwords+must+match+and+contain+at+least+10+characters",
    );
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error)
    redirect(
      "/update-password?error=Password+could+not+be+updated.+Request+a+new+recovery+link",
    );
  redirect("/dashboard?message=Password+updated");
}
