export type TenantOption = {
  organizationId: string;
  organizationName: string;
  schoolId: string | null;
  schoolName: string | null;
};

export type TenantMembership = {
  organization_id: string;
  organizations: { name: string } | null;
  all_schools: boolean;
};

export type TenantSchool = {
  id: string;
  name: string;
  organization_id: string;
};

export function buildTenantOptions(
  memberships: TenantMembership[],
  schools: TenantSchool[],
): TenantOption[] {
  return memberships.flatMap((membership) => {
    const organizationName = membership.organizations?.name ?? "Organization";
    const permittedSchools = schools.filter(
      (school) => school.organization_id === membership.organization_id,
    );
    const organizationOption: TenantOption = {
      organizationId: membership.organization_id,
      organizationName,
      schoolId: null,
      schoolName: null,
    };
    const schoolOptions = permittedSchools.map((school) => ({
      organizationId: membership.organization_id,
      organizationName,
      schoolId: school.id,
      schoolName: school.name,
    }));

    if (!permittedSchools.length) return [organizationOption];
    return membership.all_schools
      ? [...schoolOptions, organizationOption]
      : schoolOptions;
  });
}
export function resolveActiveContext(
  options: TenantOption[],
  requestedOrganizationId?: string,
  requestedSchoolId?: string,
) {
  if (options.length === 0) return null;
  return (
    options.find(
      (option) =>
        option.organizationId === requestedOrganizationId &&
        (!requestedSchoolId || option.schoolId === requestedSchoolId),
    ) ?? options[0]
  );
}
