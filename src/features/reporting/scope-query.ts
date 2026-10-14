export function parseSchoolScopeQuery(
  value: string | string[] | undefined,
): string[] | undefined {
  const parts = Array.isArray(value) ? value : value ? [value] : [];
  const ids = [
    ...new Set(
      parts
        .flatMap((part) => part.split(","))
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
  return ids.length ? ids : undefined;
}
