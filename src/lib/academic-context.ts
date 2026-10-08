import { resolveAcademicContext } from "@/features/academics/context";
import { requireUser } from "@/lib/auth";

export async function loadAcademicContext(
  organizationId: string,
  schoolId: string | null,
) {
  if (!schoolId) return resolveAcademicContext([], []);

  const { supabase } = await requireUser();
  const [{ data: sessions }, { data: periods }] = await Promise.all([
    supabase
      .from("academic_sessions")
      .select("id,name,status")
      .eq("organization_id", organizationId)
      .eq("school_id", schoolId)
      .in("status", ["current", "planned"])
      .order("start_date", { ascending: false }),
    supabase
      .from("academic_periods")
      .select("id,name,status,session_id")
      .eq("organization_id", organizationId)
      .eq("school_id", schoolId)
      .in("status", ["current", "planned"])
      .order("start_date", { ascending: false }),
  ]);

  return resolveAcademicContext(sessions ?? [], periods ?? []);
}
