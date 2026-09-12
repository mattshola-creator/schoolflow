"use server";
import { redirect } from "next/navigation";
import { onboardingSchema } from "@/features/identity/schemas";
import { requireUser } from "@/lib/auth";
export async function createOrganization(formData: FormData) {
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect("/onboarding?error=Check+the+organization+and+school+details");
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("create_organization_with_school", {
    p_organization_name: parsed.data.organizationName,
    p_organization_slug: parsed.data.organizationSlug,
    p_location_name: parsed.data.locationName,
    p_school_name: parsed.data.schoolName,
    p_school_code: parsed.data.schoolCode,
  });
  if (error)
    redirect(
      "/onboarding?error=Organization+could+not+be+created.+Check+the+details+and+try+again",
    );
  redirect("/dashboard?message=Organization+created");
}
