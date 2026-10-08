import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AcademicContext } from "@/features/academics/context";
import type { TenantOption } from "@/features/tenancy/context";

type ContextRibbonProps = {
  active: TenantOption | null;
  academic: AcademicContext;
  options: TenantOption[];
  switchAction?: (formData: FormData) => void | Promise<void>;
};

export function ContextRibbon({
  active,
  academic,
  options,
  switchAction,
}: ContextRibbonProps) {
  if (!active) {
    return (
      <div className="border-status-warning/20 bg-status-warning-soft text-status-warning rounded-xl border px-4 py-3 text-sm font-medium">
        Select or create an organization to establish a workspace context.
      </div>
    );
  }

  const activeValue = `${active.organizationId}:${active.schoolId ?? ""}`;
  const schoolLabel = active.schoolName ?? "Organization-wide";
  const sessionLabel = academic.sessionName ?? "Session not configured";
  const periodLabel = academic.periodName ?? "Term not configured";

  return (
    <section
      aria-label="Current SchoolFlow context"
      className="border-tenant-accent/15 bg-tenant-accent-soft/70 rounded-xl border px-3 py-2.5 shadow-sm sm:px-4"
    >
      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <div className="bg-tenant-accent grid size-9 shrink-0 place-items-center rounded-lg text-white">
          <Building2 aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-tenant-accent-strong text-[0.65rem] font-bold tracking-[0.16em] uppercase">
            Active context
          </p>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-800">
            <span className="truncate">{active.organizationName}</span>
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 shrink-0 text-slate-400"
            />
            <School
              aria-hidden="true"
              className="size-3.5 shrink-0 text-slate-500"
            />
            <span className="truncate">{schoolLabel}</span>
            <span className="hidden items-center gap-1.5 lg:flex">
              <ChevronRight
                aria-hidden="true"
                className="size-3.5 text-slate-400"
              />
              <CalendarDays
                aria-hidden="true"
                className="size-3.5 text-slate-500"
              />
              <span>{sessionLabel}</span>
              <span className="text-slate-400">·</span>
              <span>{periodLabel}</span>
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-600 lg:hidden">
            {sessionLabel}
            <span aria-hidden="true"> · </span>
            {periodLabel}
          </p>
        </div>
        {options.length > 1 && switchAction ? (
          <form
            action={switchAction}
            className="hidden items-center gap-2 sm:flex"
          >
            <label className="sr-only" htmlFor="shell-context">
              Switch organization or school
            </label>
            <select
              id="shell-context"
              name="context"
              defaultValue={activeValue}
              className="border-tenant-accent/25 min-h-10 max-w-52 rounded-lg border bg-white px-3 text-sm font-medium text-slate-700"
            >
              {options.map((option) => (
                <option
                  key={`${option.organizationId}:${option.schoolId}`}
                  value={`${option.organizationId}:${option.schoolId ?? ""}`}
                >
                  {option.schoolName
                    ? `${option.organizationName} — ${option.schoolName}`
                    : `${option.organizationName} — All schools`}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary" className="min-h-10 py-2">
              Switch
            </Button>
          </form>
        ) : null}
      </div>
      <details className="group md:hidden">
        <summary className="focus-visible:outline-focus-ring flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2">
          <div className="bg-tenant-accent grid size-9 shrink-0 place-items-center rounded-lg text-white">
            <School aria-hidden="true" className="size-4" />
          </div>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-900">
              {schoolLabel}
            </span>
            <span className="block truncate text-xs text-slate-600">
              {sessionLabel} · {periodLabel}
            </span>
          </span>
          <span className="sr-only">Show complete SchoolFlow context</span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <dl className="border-tenant-accent/15 mt-2 grid gap-2 rounded-lg border bg-white/80 p-3 text-sm">
          <div>
            <dt className="text-xs font-semibold text-slate-500">
              Organization
            </dt>
            <dd className="mt-0.5 font-semibold break-words text-slate-900">
              {active.organizationName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500">School</dt>
            <dd className="mt-0.5 font-semibold break-words text-slate-900">
              {schoolLabel}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs font-semibold text-slate-500">Session</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {sessionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">Term</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {periodLabel}
              </dd>
            </div>
          </div>
        </dl>
      </details>
      {options.length > 1 && switchAction ? (
        <form action={switchAction} className="mt-2 flex gap-2 md:hidden">
          <label className="sr-only" htmlFor="mobile-shell-context">
            Switch organization or school
          </label>
          <select
            id="mobile-shell-context"
            name="context"
            defaultValue={activeValue}
            className="border-tenant-accent/25 min-h-11 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm font-medium"
          >
            {options.map((option) => (
              <option
                key={`${option.organizationId}:${option.schoolId}`}
                value={`${option.organizationId}:${option.schoolId ?? ""}`}
              >
                {option.schoolName ??
                  `${option.organizationName} — All schools`}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Switch
          </Button>
        </form>
      ) : null}
    </section>
  );
}
