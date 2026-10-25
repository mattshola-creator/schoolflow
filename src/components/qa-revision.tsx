/** Public build metadata only; this label never establishes identity or authority. */
export function QaRevision() {
  if (
    process.env.SCHOOLFLOW_SHELL_REVIEW !== "true" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL !==
      "https://afqykqlxecpzspjoyegc.supabase.co"
  )
    return null;
  const revision = process.env.SCHOOLFLOW_QA_REVISION;
  return (
    <aside
      aria-label="QA environment"
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950"
    >
      <span>
        <strong>Protected QA</strong> · Integration workspace · Synthetic school
        records
      </span>
      <span>
        Revision{" "}
        {revision && /^[a-f0-9]{40}$/.test(revision)
          ? revision.slice(0, 8)
          : "unavailable"}
      </span>
    </aside>
  );
}
