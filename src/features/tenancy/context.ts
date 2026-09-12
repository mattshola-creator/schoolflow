export type TenantOption = {
  organizationId: string;
  organizationName: string;
  schoolId: string | null;
  schoolName: string | null;
};
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
