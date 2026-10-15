import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatePanel } from "@/components/ui/state-panel";
import { FinanceWorkspaceNav } from "@/components/finance-workspace-nav";
import { FinanceUnavailableState } from "@/components/finance-unavailable-state";
import { loadFinanceReports } from "@/features/finance/service";
import { reconcile, saveIncomeCategory, saveOtherIncome } from "./actions";
const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";
const money = (v: string | number) =>
  `₦${Number(v).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const n = await searchParams;
  const result = await loadFinanceReports()
    .then((workspace) => ({ workspace, error: null }))
    .catch((error: unknown) => ({ workspace: null, error }));
  const w = result.workspace;
  if (!w)
    return <FinanceUnavailableState area="Reports" error={result.error} />;
  const canReconcile =
    w.authorization.permissions.includes("finance.reconcile");
  const canConfigure =
    w.authorization.permissions.includes("finance.configure");
  const canRecordIncome = w.authorization.permissions.includes(
    "finance.payments.record",
  );
  const outstanding = w.studentBalances.reduce(
      (sum, x) => sum + Number(x.outstanding_amount),
      0,
    ),
    collections = w.collections.reduce((sum, x) => sum + Number(x.amount), 0),
    expenses = w.expenses.reduce((sum, x) => sum + Number(x.amount), 0);
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Finance · Reports"
        title={`Financial control at ${w.active.schoolName}`}
        description="School-scoped operational balances, collections, expenses, cashier and manual reconciliation evidence."
        actions={
          <FinanceWorkspaceNav
            authorization={w.authorization}
            currentPath="/finance/reports"
          />
        }
      />
      {n.error || n.message ? (
        <p
          role={n.error ? "alert" : "status"}
          className={`mt-5 rounded-lg p-3 text-sm ${n.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
        >
          {n.error ?? n.message}
        </p>
      ) : null}
      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className={panel}>
          <p className="text-sm text-slate-500">Outstanding fees</p>
          <p className="mt-2 text-2xl font-semibold">{money(outstanding)}</p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Verified collections</p>
          <p className="mt-2 text-2xl font-semibold">{money(collections)}</p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Approved expenses</p>
          <p className="mt-2 text-2xl font-semibold">{money(expenses)}</p>
        </div>
      </section>
      {canConfigure || canRecordIncome ? (
        <section className={`${panel} mt-7`}>
          <h2 className="text-xl font-semibold">Other income</h2>
          {canConfigure ? (
            <form
              action={saveIncomeCategory}
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <label className="text-sm font-medium">
                Category code
                <input className={fieldClass} name="code" required />
              </label>
              <label className="text-sm font-medium">
                Category name
                <input className={fieldClass} name="name" required />
              </label>
              <Button type="submit" variant="secondary">
                Create category
              </Button>
            </form>
          ) : null}
          {canRecordIncome ? (
            <form
              action={saveOtherIncome}
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              <label className="text-sm font-medium">
                Income category
                <select className={fieldClass} name="incomeCategoryId" required>
                  <option value="">Select income category</option>
                  {w.incomeCategories.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Amount
                <input
                  className={fieldClass}
                  name="amount"
                  inputMode="decimal"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Received at
                <input
                  className={fieldClass}
                  name="receivedAt"
                  type="datetime-local"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Payer or source
                <input className={fieldClass} name="payerName" required />
              </label>
              <label className="text-sm font-medium">
                Reference
                <input className={fieldClass} name="reference" />
              </label>
              <label className="text-sm font-medium">
                Notes
                <input className={fieldClass} name="notes" />
              </label>
              <input
                type="hidden"
                name="idempotencyKey"
                value={crypto.randomUUID()}
              />
              <Button type="submit" className="sm:w-fit">
                Record income
              </Button>
            </form>
          ) : null}
          <div className="mt-5 grid gap-2">
            {w.otherIncome.length ? (
              w.otherIncome.map((x) => (
                <div
                  key={x.id}
                  className="flex flex-wrap justify-between gap-3 border-t pt-3 text-sm"
                >
                  <span>
                    {x.payer_name ?? "Unidentified source"} ·{" "}
                    {x.reference ?? "no reference"}
                  </span>
                  <strong>{money(x.amount)}</strong>
                </div>
              ))
            ) : (
              <StatePanel
                kind="empty"
                title="No other income recorded"
                description="Authorized income entries will appear here for this school."
              />
            )}
          </div>
        </section>
      ) : null}
      {canReconcile ? (
        <section className={`${panel} mt-7`}>
          <h2 className="text-xl font-semibold">Manual reconciliation</h2>
          <form
            action={reconcile}
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="text-sm font-medium">
              Verified payment
              <select className={fieldClass} name="paymentId" required>
                <option value="">Select verified payment</option>
                {w.payments.map((x) => (
                  <option key={x.id} value={x.id}>
                    {money(x.amount)} · {x.method} ·{" "}
                    {x.reference ?? "no reference"}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Statement date
              <input
                className={fieldClass}
                name="statementDate"
                type="date"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Payment method
              <select className={fieldClass} name="method">
                <option value="bank_transfer">Bank transfer</option>
                <option value="pos">POS</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Expected amount
              <input className={fieldClass} name="expectedAmount" required />
            </label>
            <label className="text-sm font-medium">
              Actual amount
              <input className={fieldClass} name="actualAmount" required />
            </label>
            <label className="text-sm font-medium">
              Statement or deposit reference
              <input className={fieldClass} name="reference" />
            </label>
            <label className="text-sm font-medium">
              Reconciliation note
              <input className={fieldClass} name="note" />
            </label>
            <Button type="submit">Reconcile</Button>
          </form>
        </section>
      ) : null}
      <section className="mt-7 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">
            Collections by day and method
          </h2>
          <div className="mt-4 grid gap-3">
            {w.collections.length ? (
              w.collections.map((x, i) => (
                <div
                  className={panel}
                  key={`${x.activity_date}-${x.method}-${i}`}
                >
                  <div className="flex justify-between gap-4">
                    <span>
                      {x.activity_date} ·{" "}
                      {(x.method ?? "other").replace("_", " ")}
                    </span>
                    <strong>{money(x.amount ?? 0)}</strong>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {x.payment_count} payments
                  </p>
                </div>
              ))
            ) : (
              <StatePanel
                kind="empty"
                title="No collections in this period"
                description="School-scoped collection summaries will appear here when payments are recorded."
              />
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Expense summary</h2>
          <div className="mt-4 grid gap-3">
            {w.expenses.length ? (
              w.expenses.map((x, i) => (
                <div className={panel} key={`${x.expense_date}-${x.kind}-${i}`}>
                  <div className="flex justify-between gap-4">
                    <span>
                      {x.expense_date} ·{" "}
                      {(x.kind ?? "expense").replace("_", " ")}
                    </span>
                    <strong>{money(x.amount ?? 0)}</strong>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {x.expense_count} records
                  </p>
                </div>
              ))
            ) : (
              <StatePanel
                kind="empty"
                title="No expense activity in this period"
                description="Approved school expense summaries will appear here when available."
              />
            )}
          </div>
        </div>
      </section>
      <section className="mt-7">
        <h2 className="text-xl font-semibold">Reconciliation history</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {w.reconciliations.length ? (
            w.reconciliations.map((x) => (
              <div className={panel} key={x.id}>
                <div className="flex justify-between gap-4">
                  <span>
                    {x.statement_date} · {x.method}
                  </span>
                  <strong>{x.status}</strong>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Expected {money(x.expected_amount)} · Actual{" "}
                  {money(x.actual_amount)} · Variance {money(x.variance ?? 0)}
                </p>
              </div>
            ))
          ) : (
            <StatePanel
              kind="empty"
              title="No reconciliation history"
              description="Manual reconciliation records will appear here for this school."
            />
          )}
        </div>
      </section>
    </main>
  );
}
