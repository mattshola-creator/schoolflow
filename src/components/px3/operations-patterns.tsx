import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export function PrototypeBanner() {
  return (
    <div
      className="border-brand-border bg-brand-soft text-brand-strong mb-5 rounded-xl border px-4 py-3 text-sm"
      role="note"
    >
      <strong>Synthetic operations prototype.</strong> Nothing on this page
      reads or changes production school records.
    </div>
  );
}

export function KpiCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <article className="border-border bg-surface min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <StatusBadge tone={tone}>
          {tone === "warning" ? "Attention" : "Current"}
        </StatusBadge>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">{detail}</p>
    </article>
  );
}

export function ExceptionCard({
  title,
  detail,
  action,
  urgent = false,
}: {
  title: string;
  detail: string;
  action: string;
  urgent?: boolean;
}) {
  return (
    <article className="border-border bg-surface flex gap-3 rounded-xl border p-4">
      <span className={urgent ? "text-status-danger" : "text-status-warning"}>
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-6">{detail}</p>
        <button
          type="button"
          className="text-brand mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          {action} <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </article>
  );
}

export function WorkflowRail({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol
      aria-label="Workflow progress"
      className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6"
    >
      {steps.map((step, index) => (
        <li
          key={step}
          className={`rounded-xl border p-3 text-sm font-semibold ${index < current ? "border-brand-border bg-brand-soft text-brand-strong" : index === current ? "border-tenant-accent bg-surface text-slate-950" : "border-border bg-surface-subtle text-slate-500"}`}
        >
          <span className="mb-2 flex size-7 items-center justify-center rounded-full bg-white text-xs shadow-sm">
            {index < current ? (
              <CheckCircle2 aria-label="Complete" className="size-4" />
            ) : (
              index + 1
            )}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

export function MobileRecordCards({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:hidden">{children}</div>;
}

export function RecordCard({
  title,
  meta,
  status,
  children,
}: {
  title: string;
  meta: string;
  status: string;
  children?: ReactNode;
}) {
  return (
    <article className="border-border bg-surface rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{meta}</p>
        </div>
        <StatusBadge>{status}</StatusBadge>
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </article>
  );
}

export function StickyPrototypeActions({ children }: { children: ReactNode }) {
  return (
    <div className="border-border bg-surface/95 sticky bottom-3 z-10 mt-6 flex flex-wrap justify-end gap-2 rounded-2xl border p-3 shadow-lg backdrop-blur">
      {children}
    </div>
  );
}
