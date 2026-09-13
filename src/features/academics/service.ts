import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import {
  deriveAcademicSetupState,
  nextAcademicSetupStep,
} from "./setup-status";

export const academicSetupCapability = {
  permission: "academics.setup.view",
  module: "academics",
  feature: "academics.academic_setup",
} as const;

export async function requireAcademicContext(permission: string) {
  const authorization = await requireCapability({
    permission,
    module: "academics",
    feature: "academics.academic_setup",
  });
  if (!authorization.schoolId) throw new Error("A school context is required");
  const [{ supabase }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !active ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active school context is invalid");
  return { supabase, active, authorization };
}

export async function loadAcademicSetup() {
  const { supabase, active, authorization } = await requireAcademicContext(
    "academics.setup.view",
  );
  const [
    settings,
    sessions,
    periods,
    sections,
    levels,
    arms,
    subjects,
    applicability,
    locks,
  ] = await Promise.all([
    supabase
      .from("school_academic_settings")
      .select("period_label, week_starts_on")
      .eq("school_id", active.schoolId!)
      .maybeSingle(),
    supabase
      .from("academic_sessions")
      .select("id, name, start_date, end_date, status")
      .eq("school_id", active.schoolId!)
      .order("start_date", { ascending: false }),
    supabase
      .from("academic_periods")
      .select("id, session_id, name, sequence, start_date, end_date, status")
      .eq("school_id", active.schoolId!)
      .order("sequence"),
    supabase
      .from("academic_sections")
      .select("id, name, code, sort_order, status")
      .eq("school_id", active.schoolId!)
      .neq("status", "archived")
      .order("sort_order"),
    supabase
      .from("class_levels")
      .select("id, section_id, name, code, sort_order, status")
      .eq("school_id", active.schoolId!)
      .neq("status", "archived")
      .order("sort_order"),
    supabase
      .from("class_arms")
      .select("id, class_level_id, name, code, sort_order, status")
      .eq("school_id", active.schoolId!)
      .neq("status", "archived")
      .order("sort_order"),
    supabase
      .from("subjects")
      .select("id, name, code, sort_order, status")
      .eq("school_id", active.schoolId!)
      .neq("status", "archived")
      .order("sort_order"),
    supabase
      .from("subject_level_applicability")
      .select("subject_id, class_level_id, classification, sort_order")
      .eq("school_id", active.schoolId!)
      .order("sort_order"),
    supabase
      .from("academic_locks")
      .select(
        "id, scope, session_id, period_id, reason, locked_at, unlocked_at",
      )
      .eq("school_id", active.schoolId!)
      .is("unlocked_at", null)
      .order("locked_at", { ascending: false }),
  ]);
  const firstError = [
    settings,
    sessions,
    periods,
    sections,
    levels,
    arms,
    subjects,
    applicability,
    locks,
  ].find((result) => result.error)?.error;
  if (firstError) throw new Error("Academic setup could not be loaded");
  const counts = {
    settings: settings.data ? 1 : 0,
    currentSessions:
      sessions.data?.filter((item) => item.status === "current").length ?? 0,
    periods: periods.data?.length ?? 0,
    levels: levels.data?.filter((item) => item.status === "active").length ?? 0,
    arms: arms.data?.filter((item) => item.status === "active").length ?? 0,
    subjects:
      subjects.data?.filter((item) => item.status === "active").length ?? 0,
    activeSchoolLocks:
      locks.data?.filter((item) => item.scope === "school_setup").length ?? 0,
  };
  return {
    active,
    authorization,
    settings: settings.data,
    sessions: sessions.data ?? [],
    periods: periods.data ?? [],
    sections: sections.data ?? [],
    levels: levels.data ?? [],
    arms: arms.data ?? [],
    subjects: subjects.data ?? [],
    applicability: applicability.data ?? [],
    locks: locks.data ?? [],
    state: deriveAcademicSetupState(counts),
    nextStep: nextAcademicSetupStep(counts),
  };
}
