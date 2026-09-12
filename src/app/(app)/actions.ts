"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loadTenantContext } from "@/lib/tenant-context";
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?message=You+have+signed+out");
}
export async function switchContext(formData: FormData) {
  const selected = String(formData.get("context") ?? "");
  const [organizationId, schoolId = ""] = selected.split(":");
  const { options } = await loadTenantContext();
  const allowed = options.find(
    (option) =>
      option.organizationId === organizationId &&
      (option.schoolId ?? "") === schoolId,
  );
  if (!allowed) redirect("/dashboard?error=That+workspace+is+not+available");
  const store = await cookies();
  const settings = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
  store.set("sf-org", allowed.organizationId, settings);
  store.set("sf-school", allowed.schoolId ?? "", settings);
  redirect("/dashboard");
}
