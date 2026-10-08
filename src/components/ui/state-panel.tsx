import {
  AlertTriangle,
  Ban,
  CircleOff,
  Info,
  LockKeyhole,
  PackageOpen,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";

export type StatePanelKind =
  | "empty"
  | "error"
  | "unauthorized"
  | "unentitled"
  | "disabled"
  | "setup"
  | "invalid-context";

const stateStyles: Record<
  StatePanelKind,
  { icon: typeof Info; style: string }
> = {
  empty: {
    icon: PackageOpen,
    style: "border-slate-200 bg-white text-slate-700",
  },
  error: {
    icon: AlertTriangle,
    style: "border-red-200 bg-red-50 text-red-900",
  },
  unauthorized: {
    icon: LockKeyhole,
    style: "border-amber-200 bg-amber-50 text-amber-950",
  },
  unentitled: {
    icon: CircleOff,
    style: "border-violet-200 bg-violet-50 text-violet-950",
  },
  disabled: {
    icon: Ban,
    style: "border-slate-200 bg-slate-100 text-slate-700",
  },
  setup: { icon: Settings, style: "border-blue-200 bg-blue-50 text-blue-950" },
  "invalid-context": {
    icon: Info,
    style: "border-orange-200 bg-orange-50 text-orange-950",
  },
};

export function StatePanel({
  action,
  description,
  kind,
  title,
}: {
  action?: ReactNode;
  description: ReactNode;
  kind: StatePanelKind;
  title: ReactNode;
}) {
  const config = stateStyles[kind];
  const Icon = config.icon;
  return (
    <section
      className={`rounded-xl border p-4 ${config.style}`}
      aria-live={kind === "error" ? "assertive" : "polite"}
    >
      <div className="flex gap-3">
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 opacity-90">{description}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
