import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

export async function requireStudentContext(
  permission = "students.view",
  feature = "students.student_records",
) {
  const authorization = await requireCapability({
    permission,
    module: "students",
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

export type StudentDirectoryQuery = {
  classLevelId: string | null;
  page: number;
  query: string;
  sort: "newest" | "oldest";
  status:
    "all" | "pending" | "active" | "completed" | "transferred" | "withdrawn";
};

async function findStudentProfileIds(
  context: Awaited<ReturnType<typeof requireStudentContext>>,
  query: string,
) {
  if (!query) return null;
  const pattern = `%${query}%`;
  const [numberMatches, firstNameMatches, lastNameMatches] = await Promise.all([
    context.supabase
      .from("student_profiles")
      .select("id")
      .eq("organization_id", context.active.organizationId)
      .ilike("student_number", pattern),
    context.supabase.from("people").select("id").ilike("first_name", pattern),
    context.supabase.from("people").select("id").ilike("last_name", pattern),
  ]);
  if (numberMatches.error || firstNameMatches.error || lastNameMatches.error)
    throw new Error("Students could not be loaded");
  const personIds = Array.from(
    new Set(
      [...(firstNameMatches.data ?? []), ...(lastNameMatches.data ?? [])].map(
        (person) => person.id,
      ),
    ),
  );
  const namedProfiles = personIds.length
    ? await context.supabase
        .from("student_profiles")
        .select("id")
        .eq("organization_id", context.active.organizationId)
        .in("person_id", personIds)
    : { data: [], error: null };
  if (namedProfiles.error) throw new Error("Students could not be loaded");
  return Array.from(
    new Set([
      ...(numberMatches.data ?? []).map((profile) => profile.id),
      ...(namedProfiles.data ?? []).map((profile) => profile.id),
    ]),
  );
}

export async function loadStudents(filters: StudentDirectoryQuery) {
  const context = await requireStudentContext();
  const pageSize = 20;
  const from = (filters.page - 1) * pageSize;
  const profileIds = await findStudentProfileIds(context, filters.query);
  if (profileIds && !profileIds.length)
    return {
      ...context,
      students: [],
      count: 0,
      page: filters.page,
      pageSize,
      filters,
      classLevels: [],
    };

  let enrollmentIds: string[] | null = null;
  if (filters.classLevelId) {
    const placements = await context.supabase
      .from("class_memberships")
      .select("enrollment_id")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("class_level_id", filters.classLevelId)
      .eq("status", "active");
    if (placements.error) throw new Error("Students could not be loaded");
    enrollmentIds = Array.from(
      new Set((placements.data ?? []).map((item) => item.enrollment_id)),
    );
  }

  let request = context.supabase
    .from("student_enrollments")
    .select(
      "id, status, student_id, academic_sessions(name), student_profiles!inner(id, student_number, date_of_birth, status, people!inner(first_name, last_name)), class_memberships(status, class_levels(name), class_arms(name))",
      { count: "exact" },
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .order("created_at", { ascending: filters.sort === "oldest" })
    .range(from, from + pageSize - 1);
  if (filters.status !== "all") request = request.eq("status", filters.status);
  if (profileIds) request = request.in("student_id", profileIds);
  if (enrollmentIds) {
    if (!enrollmentIds.length)
      return {
        ...context,
        students: [],
        count: 0,
        page: filters.page,
        pageSize,
        filters,
        classLevels: [],
      };
    request = request.in("id", enrollmentIds);
  }
  const [students, classLevels] = await Promise.all([
    request,
    context.supabase
      .from("class_levels")
      .select("id,name")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
  ]);
  if (students.error || classLevels.error)
    throw new Error("Students could not be loaded");
  return {
    ...context,
    students: students.data ?? [],
    count: students.count ?? 0,
    page: filters.page,
    pageSize,
    filters,
    classLevels: classLevels.data ?? [],
  };
}

export async function loadStudent(studentId: string) {
  const context = await requireStudentContext();
  const activeEnrollment = await context.supabase
    .from("student_enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (activeEnrollment.error || !activeEnrollment.data)
    throw new Error("Student record is unavailable in this school context");
  const [profile, enrollments, guardians] = await Promise.all([
    context.supabase
      .from("student_profiles")
      .select(
        "id, student_number, date_of_birth, gender, status, people(first_name, last_name, preferred_name)",
      )
      .eq("id", studentId)
      .eq("organization_id", context.active.organizationId)
      .maybeSingle(),
    context.supabase
      .from("student_enrollments")
      .select(
        "id, status, enrolled_on, ended_on, exit_reason, academic_sessions(name), class_memberships(id, status, started_on, ended_on, class_levels(name), class_arms(name))",
      )
      .eq("student_id", studentId)
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .order("enrolled_on", { ascending: false }),
    context.supabase
      .from("guardian_relationships")
      .select(
        "id, relationship_type, is_primary_contact, has_portal_access, is_financially_responsible, effective_from, effective_to, people!guardian_relationships_guardian_person_id_fkey(first_name, last_name)",
      )
      .eq("student_id", studentId)
      .eq("organization_id", context.active.organizationId)
      .order("effective_from", { ascending: false }),
  ]);
  if (profile.error || enrollments.error || guardians.error || !profile.data)
    throw new Error("Student record is unavailable");
  return {
    ...context,
    profile: profile.data,
    enrollments: enrollments.data ?? [],
    guardians: guardians.data ?? [],
  };
}

export async function loadStudentFormOptions() {
  const context = await requireStudentContext("students.manage");
  const [sessions, levels, arms] = await Promise.all([
    context.supabase
      .from("academic_sessions")
      .select("id, name, start_date, end_date, status")
      .eq("school_id", context.active.schoolId!)
      .in("status", ["current", "planned"])
      .order("start_date", { ascending: false }),
    context.supabase
      .from("class_levels")
      .select("id, name")
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
    context.supabase
      .from("class_arms")
      .select("id, name, class_level_id")
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
  ]);
  if (sessions.error || levels.error || arms.error)
    throw new Error("Student form could not be loaded");
  return {
    ...context,
    sessions: sessions.data ?? [],
    levels: levels.data ?? [],
    arms: arms.data ?? [],
  };
}
