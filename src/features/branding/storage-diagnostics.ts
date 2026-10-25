// Fixed categories only: never return upstream messages, headers, URLs or payloads.
export function storageFailureCategory(error: {
  code?: string;
  status?: number;
}) {
  if (
    error.status === 401 ||
    error.code === "PGRST301" ||
    error.code === "PGRST303"
  )
    return "storage_authentication";
  if (error.code === "42501" || error.status === 403)
    return "storage_privilege";
  if (["42P01", "PGRST205", "PGRST106"].includes(error.code ?? ""))
    return "storage_schema";
  return "storage_data_api";
}
