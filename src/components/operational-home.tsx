import Link from "next/link";
import { ArrowRight, Bell, CheckSquare2, CircleAlert } from "lucide-react";
import type { HomeTask } from "@/features/home/model";
import { StatusBadge } from "@/components/ui/status-badge";

export function OperationalSummary({
  counts,
  moduleCount,
  scopeLabel,
}: {
  counts: {
    tasks: number;
    approvals: number;
    notifications: number;
    urgent: number;
  };
  moduleCount: number;
  scopeLabel: string;
}) {
  const cards = [
    { label: "Open tasks", value: counts.tasks, icon: CheckSquare2 },
    { label: "Pending approvals", value: counts.approvals, icon: CircleAlert },
    { label: "Unread notices", value: counts.notifications, icon: Bell },
    { label: "Available workspaces", value: moduleCount, icon: ArrowRight },
  ];
  return (
    <section
      aria-label={`Operational summary for ${scopeLabel}`}
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map(({ label, value, icon: Icon }) => (
        <article
          key={label}
          className="border-border bg-surface rounded-2xl border p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-600">{label}</p>
            <Icon aria-hidden="true" className="text-brand size-5" />
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Current authorized context
          </p>
        </article>
      ))}
    </section>
  );
}

export function PriorityWork({
  tasks,
  limit,
}: {
  tasks: HomeTask[];
  limit?: number;
}) {
  const visible = typeof limit === "number" ? tasks.slice(0, limit) : tasks;
  return (
    <section
      className="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
      aria-labelledby="priority-work-title"
    >
      <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div>
          <h2 id="priority-work-title" className="font-semibold text-slate-950">
            Priority work
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Tasks, approvals and notices you are authorized to see.
          </p>
        </div>
        {limit ? (
          <Link
            href="/my-day"
            className="text-brand shrink-0 text-sm font-semibold"
          >
            View My Day
          </Link>
        ) : null}
      </div>
      {visible.length ? (
        <ol className="divide-border divide-y">
          {visible.map((item) => (
            <li key={`${item.kind}:${item.id}`}>
              <Link
                href={item.href}
                className="hover:bg-surface-subtle focus-visible:ring-focus flex min-h-16 items-center gap-3 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-inset sm:px-5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-950">
                    {item.title}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-sm">
                    {item.status}
                    {item.dueAt
                      ? ` · ${new Date(item.dueAt).toLocaleDateString()}`
                      : ""}
                  </span>
                </span>
                <StatusBadge
                  tone={
                    item.priority === "urgent" || item.priority === "high"
                      ? "warning"
                      : "neutral"
                  }
                >
                  {item.priority}
                </StatusBadge>
                <ArrowRight
                  aria-hidden="true"
                  className="text-muted-foreground size-4 shrink-0"
                />
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="font-semibold text-slate-950">
            Nothing needs attention
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            New authorized tasks and approvals will appear here.
          </p>
        </div>
      )}
    </section>
  );
}
