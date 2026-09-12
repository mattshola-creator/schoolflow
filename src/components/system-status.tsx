import { CircleAlert, CircleCheck, Database, ServerCog } from "lucide-react";
import { getPublicEnvironment } from "@/lib/env";

export function SystemStatus() {
  const configured = getPublicEnvironment().success;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-semibold text-slate-950">Platform status</p>
        <p className="mt-1 text-sm text-slate-500">
          Live configuration readiness
        </p>
      </div>
      <dl className="divide-y divide-slate-100 px-6">
        <StatusRow
          icon={ServerCog}
          label="Web application"
          state="Ready"
          ready
        />
        <StatusRow
          icon={Database}
          label="Supabase environment"
          state={configured ? "Configured" : "Awaiting credentials"}
          ready={configured}
        />
      </dl>
      <div className="bg-slate-50 px-6 py-4 text-xs leading-5 text-slate-600">
        Identity and tenant foundations are connected. Operational school
        modules are introduced in later milestones.
      </div>
    </div>
  );
}

type StatusRowProps = {
  icon: typeof Database;
  label: string;
  state: string;
  ready: boolean;
};
function StatusRow({ icon: Icon, label, state, ready }: StatusRowProps) {
  const StateIcon = ready ? CircleCheck : CircleAlert;
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <dt className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <Icon aria-hidden="true" className="size-5 text-slate-500" />
        {label}
      </dt>
      <dd
        className={`flex items-center gap-1.5 text-xs font-semibold ${ready ? "text-emerald-700" : "text-amber-700"}`}
      >
        <StateIcon aria-hidden="true" className="size-4" />
        {state}
      </dd>
    </div>
  );
}
