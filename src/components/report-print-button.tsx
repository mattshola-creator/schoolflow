"use client";
import { Printer } from "lucide-react";

export function ReportPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
    >
      <Printer className="size-4" aria-hidden="true" />
      Print
    </button>
  );
}
