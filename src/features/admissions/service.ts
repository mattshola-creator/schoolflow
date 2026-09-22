import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

export async function requireAdmissionsContext(
  permission = "admissions.view",
  feature = "admissions.application_workflow",
) {
  const authorization = await requireCapability({
    permission,
    module: "admissions",
    feature,
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

export async function loadAdmissions(query = "", status?: string, page = 1) {
  const context = await requireAdmissionsContext();
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  let request = context.supabase
    .from("admission_applications")
    .select(
      "id, application_number, status, source, created_at, applicant:people!admission_applications_applicant_person_id_fkey(first_name,last_name), academic_sessions(name), class_levels(name)",
      { count: "exact" },
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (query) request = request.ilike("application_number", `%${query}%`);
  if (status) request = request.eq("status", status as never);
  const { data, error, count } = await request;
  if (error) throw new Error("Admissions could not be loaded");
  return {
    ...context,
    applications: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
    query,
    status,
  };
}

export async function loadAdmissionOptions(permission = "admissions.manage") {
  const context = await requireAdmissionsContext(permission);
  const [sessions, levels, arms] = await Promise.all([
    context.supabase
      .from("academic_sessions")
      .select("id,name,start_date,end_date,status")
      .eq("school_id", context.active.schoolId!)
      .in("status", ["current", "planned"])
      .order("start_date", { ascending: false }),
    context.supabase
      .from("class_levels")
      .select("id,name")
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
    context.supabase
      .from("class_arms")
      .select("id,name,class_level_id")
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
  ]);
  if (sessions.error || levels.error || arms.error)
    throw new Error("Admissions configuration could not be loaded");
  return {
    ...context,
    sessions: sessions.data ?? [],
    levels: levels.data ?? [],
    arms: arms.data ?? [],
  };
}

export async function loadAdmission(applicationId: string) {
  const context = await requireAdmissionsContext();
  const application = await context.supabase
    .from("admission_applications")
    .select(
      "*, applicant:people!admission_applications_applicant_person_id_fkey(first_name,last_name,preferred_name), academic_sessions(name), class_levels(name)",
    )
    .eq("id", applicationId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (application.error || !application.data)
    throw new Error("Admission record is unavailable");

  const [
    guardians,
    assessments,
    decisions,
    offer,
    checklist,
    options,
    enrolledStudent,
  ] = await Promise.all([
    context.supabase
      .from("admission_guardians")
      .select(
        "*, guardian:people!admission_guardians_guardian_person_id_fkey(first_name,last_name)",
      )
      .eq("application_id", applicationId)
      .order("created_at"),
    context.supabase
      .from("entrance_assessment_attempts")
      .select("*")
      .eq("application_id", applicationId)
      .order("attempt_number", { ascending: false }),
    context.supabase
      .from("admission_decisions")
      .select("*, class_levels(name)")
      .eq("application_id", applicationId)
      .order("decided_at", { ascending: false }),
    context.supabase
      .from("admission_offers")
      .select(
        "*, academic_sessions(name), class_levels(name), class_arms(name)",
      )
      .eq("application_id", applicationId)
      .maybeSingle(),
    context.supabase
      .from("admission_checklist_items")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at"),
    loadAdmissionOptions("admissions.view"),
    application.data.enrolled_student_id
      ? context.supabase
          .from("student_profiles")
          .select("id,student_number")
          .eq("id", application.data.enrolled_student_id)
          .eq("organization_id", context.active.organizationId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (
    guardians.error ||
    assessments.error ||
    decisions.error ||
    offer.error ||
    checklist.error ||
    enrolledStudent.error
  )
    throw new Error("Admission record is unavailable");
  return {
    ...context,
    application: {
      ...application.data,
      student_profiles: enrolledStudent.data,
    },
    guardians: guardians.data ?? [],
    assessments: assessments.data ?? [],
    decisions: decisions.data ?? [],
    offer: offer.data,
    checklist: checklist.data ?? [],
    sessions: options.sessions,
    levels: options.levels,
    arms: options.arms,
  };
}
