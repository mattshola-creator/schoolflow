import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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
  const w = await loadFinanceReports().catch(() => null);
  if (!w)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Finance reports unavailable</h1>
      </main>
    );
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
          <>
            <ButtonLink href="/finance" variant="secondary">
              Fee setup
            </ButtonLink>
            <ButtonLink href="/finance/payments" variant="secondary">
              Payments
            </ButtonLink>
            <ButtonLink href="/finance/expenses" variant="secondary">
              Expenses
            </ButtonLink>
          </>
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
              <input
                className={fieldClass}
                name="code"
                placeholder="Category code"
                required
              />
              <input
                className={fieldClass}
                name="name"
                placeholder="Category name"
                required
              />
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
              <select className={fieldClass} name="incomeCategoryId" required>
                <option value="">Select income category</option>
                {w.incomeCategories.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
              <input
                className={fieldClass}
                name="amount"
                placeholder="Amount"
                inputMode="decimal"
                required
              />
              <input
                className={fieldClass}
                name="receivedAt"
                type="datetime-local"
                required
              />
              <input
                className={fieldClass}
                name="payerName"
                placeholder="Payer/source"
                required
              />
              <input
                className={fieldClass}
                name="reference"
                placeholder="Reference"
              />
              <input className={fieldClass} name="notes" placeholder="Notes" />
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
            {w.otherIncome.map((x) => (
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
            ))}
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
            <select className={fieldClass} name="paymentId" required>
              <option value="">Select verified payment</option>
              {w.payments.map((x) => (
                <option key={x.id} value={x.id}>
                  {money(x.amount)} · {x.method} ·{" "}
                  {x.reference ?? "no reference"}
                </option>
              ))}
            </select>
            <input
              className={fieldClass}
              name="statementDate"
              type="date"
              required
            />
            <select className={fieldClass} name="method">
              <option value="bank_transfer">Bank transfer</option>
              <option value="pos">POS</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
            <input
              className={fieldClass}
              name="expectedAmount"
              placeholder="Expected amount"
              required
            />
            <input
              className={fieldClass}
              name="actualAmount"
              placeholder="Actual amount"
              required
            />
            <input
              className={fieldClass}
              name="reference"
              placeholder="Statement/deposit reference"
            />
            <input className={fieldClass} name="note" placeholder="Note" />
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
            {w.collections.map((x, i) => (
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
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Expense summary</h2>
          <div className="mt-4 grid gap-3">
            {w.expenses.map((x, i) => (
              <div className={panel} key={`${x.expense_date}-${x.kind}-${i}`}>
                <div className="flex justify-between gap-4">
                  <span>
                    {x.expense_date} · {(x.kind ?? "expense").replace("_", " ")}
                  </span>
                  <strong>{money(x.amount ?? 0)}</strong>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {x.expense_count} records
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-7">
        <h2 className="text-xl font-semibold">Reconciliation history</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {w.reconciliations.map((x) => (
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
          ))}
        </div>
      </section>
    </main>
  );
}
