import { ExecutiveMetric } from "@/components/operational/premium";
import Link from "next/link";
import {
  WorkspaceHeader,
  workspaceSurface,
} from "@/components/workspace-presentation";
import { StatePanel } from "@/components/ui/state-panel";
import { FinanceWorkspaceNav } from "@/components/finance-workspace-nav";
import { FinanceUnavailableState } from "@/components/finance-unavailable-state";
import { loadFinanceDashboard } from "@/features/finance/service";

const panel = "min-w-0 rounded-2xl border p-5 shadow-sm sm:p-6";
const money = (totals: Record<string, number>) => {
  const values = Object.entries(totals);
  if (!values.length) return "—";
  return values
    .map(
      ([currency, amount]) =>
        `${new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount)}`,
    )
    .join(" · ");
};

export default async function FinanceOverviewPage() {
  const result = await loadFinanceDashboard()
    .then((workspace) => ({ workspace, error: null }))
    .catch((error: unknown) => ({ workspace: null, error }));
  const w = result.workspace;
  if (!w)
    return <FinanceUnavailableState area="Overview" error={result.error} />;

  const cards = [
    w.visibility.billing
      ? {
          label: "Original charges billed",
          value: money(w.billedByCurrency),
          href: "/finance/billing",
        }
      : null,
    w.visibility.billing
      ? {
          label: "Outstanding balances",
          value: money(w.outstandingByCurrency),
          href: "/finance/billing?status=open",
        }
      : null,
    w.visibility.collections
      ? {
          label: "Verified collections · last 30 days",
          value: money(w.verifiedCollectionsByCurrency),
          href: "/finance/payments",
        }
      : null,
    w.visibility.expenses
      ? {
          label: "Approved expenses · last 30 days",
          value: money(w.expensesByCurrency),
          href: "/finance/expenses",
        }
      : null,
    w.visibility.reports
      ? {
          label: "Other income · last 30 days",
          value: money(w.otherIncomeByCurrency),
          href: "/finance/reports",
        }
      : null,
  ].filter((card): card is NonNullable<typeof card> => card !== null);

  const tasks = [
    w.visibility.collections
      ? {
          label: "Payments awaiting independent verification",
          count: w.pendingPayments,
          href: "/finance/payments?status=recorded#payment-register",
        }
      : null,
    w.visibility.expenses
      ? {
          label: "Expenses awaiting review",
          count: w.pendingExpenses,
          href: "/finance/expenses",
        }
      : null,
    w.visibility.cashier
      ? {
          label: "Open cashier sessions",
          count: w.openCashierSessions,
          href: "/finance/payments",
        }
      : null,
    w.visibility.reconciliation
      ? {
          label: "Reconciliation exceptions",
          count: w.openReconciliations,
          href: "/finance/reports",
        }
      : null,
  ].filter((task): task is NonNullable<typeof task> => task !== null);

  return (
    <main className="space-y-6 py-4" style={workspaceSurface}>
      <WorkspaceHeader
        eyebrow="Finance · School overview"
        title={`Finance at ${w.active.schoolName}`}
        description={`School-scoped billing and operational summaries. Collections, expenses and other income cover activity since ${w.windowStart}; pending tasks show current open records.`}
      >
        <FinanceWorkspaceNav
          authorization={w.authorization}
          currentPath="/finance/overview"
        />
      </WorkspaceHeader>

      {cards.length ? (
        <section
          className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label="Finance summary"
        >
          {cards.map((card) => (
            <ExecutiveMetric
              key={card.label}
              title={card.label}
              value={card.value}
              href={card.href}
              linkLabel="Open workspace"
            >
              <p>
                {card.label.includes("last 30 days")
                  ? `Activity since ${w.windowStart}.`
                  : "Current school-scoped records."}{" "}
                Currency totals are displayed separately.
              </p>
            </ExecutiveMetric>
          ))}
        </section>
      ) : (
        <div className="mt-7">
          <StatePanel
            kind="disabled"
            title="No Finance summaries are available for this role"
            description="Your current permissions do not include any of the Finance summary sections."
          />
        </div>
      )}

      {tasks.length ? (
        <section
          style={workspaceSurface}
          className={`${panel} mt-7`}
          aria-labelledby="finance-tasks"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold" id="finance-tasks">
                Operational tasks
              </h2>
              <p className="mt-1 text-sm opacity-80">
                Counts reflect records visible to your current role and school.
              </p>
            </div>
          </div>
          <ul className="mt-4 divide-y">
            {tasks.map((task) => (
              <li key={task.label}>
                <Link
                  href={task.href}
                  className="focus-visible:outline-tenant-accent flex min-h-14 items-center justify-between gap-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="font-medium">{task.label}</span>
                  <span className="rounded-full border px-3 py-1 text-sm font-semibold tabular-nums">
                    {task.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
