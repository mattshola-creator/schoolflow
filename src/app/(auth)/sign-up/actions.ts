"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/features/identity/schemas";
import { getSiteUrl } from "@/lib/site-url";
export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect("/sign-up?error=Check+the+details+and+try+again");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/onboarding`,
    },
  });
  if (error)
    redirect("/sign-up?error=Account+could+not+be+created.+Please+try+again");
  redirect(
    data.session
      ? "/onboarding"
      : "/login?message=Check+your+email+to+confirm+your+account",
  );
}
