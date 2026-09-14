import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";

export async function requireStaffContext(
  permission = "staff.view",
  feature = "staff.staff_records",
) {
  const authorization = await requireCapability({
    permission,
    module: "staff",
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

export async function loadStaff(query = "", page = 1) {
  const context = await requireStaffContext();
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  let matchingProfileIds: string[] | null = null;
  if (query) {
    const matches = await context.supabase
      .from("staff_profiles")
      .select("id")
      .eq("organization_id", context.active.organizationId)
      .ilike("staff_number", `%${query}%`);
    if (matches.error) throw new Error("Staff records could not be loaded");
    matchingProfileIds = (matches.data ?? []).map((profile) => profile.id);
    if (!matchingProfileIds.length)
      return { ...context, staff: [], count: 0, page, pageSize };
  }
  let assignmentRequest = context.supabase
    .from("staff_assignments")
    .select(
      "id, status, is_primary, started_on, staff_profile_id, positions!inner(name), departments(name), employments!inner(id, employment_type, status)",
      {
        count: "exact",
      },
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .in("status", ["planned", "active"])
    .order("started_on", { ascending: false })
    .range(from, from + pageSize - 1);
  if (matchingProfileIds)
    assignmentRequest = assignmentRequest.in(
      "staff_profile_id",
      matchingProfileIds,
    );
  const assignments = await assignmentRequest;
  if (assignments.error) throw new Error("Staff records could not be loaded");
  const pageProfileIds = (assignments.data ?? []).map(
    (assignment) => assignment.staff_profile_id,
  );
  const profiles = pageProfileIds.length
    ? await context.supabase
        .from("staff_profiles")
        .select("id, staff_number, status, people!inner(first_name, last_name)")
        .in("id", pageProfileIds)
    : { data: [], error: null };
  if (profiles.error) throw new Error("Staff records could not be loaded");
  const profileMap = new Map(
    (profiles.data ?? []).map((profile) => [profile.id, profile]),
  );
  return {
    ...context,
    staff: (assignments.data ?? []).flatMap((assignment) => {
      const profile = profileMap.get(assignment.staff_profile_id);
      return profile ? [{ ...assignment, staff_profiles: profile }] : [];
    }),
    count: assignments.count ?? 0,
    page,
    pageSize,
  };
}

export async function loadStaffSetup() {
  const context = await requireStaffContext();
  const [departments, positions] = await Promise.all([
    context.supabase
      .from("departments")
      .select("id, name, code, status")
      .eq("school_id", context.active.schoolId!)
      .order("name"),
    context.supabase
      .from("positions")
      .select("id, name, code, status, is_teaching, departments(name)")
      .eq("school_id", context.active.schoolId!)
      .order("name"),
  ]);
  if (departments.error || positions.error)
    throw new Error("Staff setup could not be loaded");
  return {
    ...context,
    departments: departments.data ?? [],
    positions: positions.data ?? [],
  };
}

export async function loadStaffFormOptions() {
  const context = await requireStaffContext("staff.manage");
  const [departments, positions, candidates, roles] = await Promise.all([
    context.supabase
      .from("departments")
      .select("id, name")
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("name"),
    context.supabase
      .from("positions")
      .select("id, name, department_id")
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("name"),
    context.supabase.rpc("list_staff_access_candidates", {
      target_organization_id: context.active.organizationId,
      target_school_id: context.active.schoolId!,
    }),
    context.supabase
      .from("roles")
      .select("id, name")
      .eq("organization_id", context.active.organizationId)
      .order("name"),
  ]);
  if ([departments, positions, candidates, roles].some((item) => item.error))
    throw new Error("Staff form could not be loaded");
  return {
    ...context,
    departments: departments.data ?? [],
    positions: positions.data ?? [],
    memberships: candidates.data ?? [],
    roles: roles.data ?? [],
  };
}

export async function loadStaffMember(staffId: string) {
  const context = await requireStaffContext();
  const [profile, employments, assignments, schools, positions, departments] =
    await Promise.all([
      context.supabase
        .from("staff_profiles")
        .select(
          "id, staff_number, work_email, phone, emergency_contact_name, emergency_contact_phone, qualifications, status, people(first_name, last_name)",
        )
        .eq("id", staffId)
        .eq("organization_id", context.active.organizationId)
        .maybeSingle(),
      context.supabase
        .from("employments")
        .select(
          "id, employment_type, status, started_on, ended_on, exit_reason, user_id",
        )
        .eq("staff_profile_id", staffId)
        .eq("organization_id", context.active.organizationId)
        .order("started_on", { ascending: false }),
      context.supabase
        .from("staff_assignments")
        .select(
          "id, status, is_primary, started_on, ended_on, employment_id, schools(name), departments(name), positions(name)",
        )
        .eq("staff_profile_id", staffId)
        .eq("organization_id", context.active.organizationId)
        .order("started_on", { ascending: false }),
      context.supabase
        .from("schools")
        .select("id, name")
        .eq("organization_id", context.active.organizationId)
        .eq("status", "active")
        .order("name"),
      context.supabase
        .from("positions")
        .select("id, school_id, name")
        .eq("organization_id", context.active.organizationId)
        .eq("status", "active")
        .order("name"),
      context.supabase
        .from("departments")
        .select("id, school_id, name")
        .eq("organization_id", context.active.organizationId)
        .eq("status", "active")
        .order("name"),
    ]);
  if (
    profile.error ||
    employments.error ||
    assignments.error ||
    schools.error ||
    positions.error ||
    departments.error ||
    !profile.data
  )
    throw new Error("Staff record is unavailable");
  return {
    ...context,
    profile: profile.data,
    employments: employments.data ?? [],
    assignments: assignments.data ?? [],
    schools: schools.data ?? [],
    positions: positions.data ?? [],
    departments: departments.data ?? [],
  };
}
