import type { ReactNode } from "react";

export function Tabs({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="border-border flex gap-1 overflow-x-auto border-b"
    >
      {children}
    </div>
  );
}

export function Tab({
  children,
  selected = false,
}: {
  children: ReactNode;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-semibold ${selected ? "border-tenant-accent text-tenant-accent-strong" : "border-transparent text-slate-500 hover:text-slate-900"}`}
    >
      {children}
    </button>
  );
}
