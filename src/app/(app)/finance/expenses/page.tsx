import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadExpenseWorkspace } from "@/features/finance/service";
import {
  finishExpense,
  payExpense,
  reviewExpense,
  saveExpense,
  saveExpenseCategory,
} from "./actions";
const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";
export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const n = await searchParams;
  const w = await loadExpenseWorkspace().catch(() => null);
  if (!w)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Expenses unavailable</h1>
      </main>
    );
  const canManage = w.authorization.permissions.includes(
      "finance.expenses.manage",
    ),
    canApprove = w.authorization.permissions.includes(
      "finance.expenses.approve",
    ),
    canConfigure = w.authorization.permissions.includes("finance.configure");
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Finance · Expenses"
        title={`Expense control at ${w.active.schoolName}`}
        description="Preserve requested and approved amounts through a controlled review workflow."
        actions={
          <>
            <ButtonLink href="/finance" variant="secondary">
              Fee setup
            </ButtonLink>
            <ButtonLink href="/finance/payments" variant="secondary">
              Payments
            </ButtonLink>
            <ButtonLink href="/finance/reports" variant="secondary">
              Reports
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
      {canConfigure ? (
        <section className={`${panel} mt-7`}>
          <h2 className="text-xl font-semibold">Expense category</h2>
          <form
            action={saveExpenseCategory}
            className="mt-4 flex flex-wrap items-end gap-3"
          >
            <label className="text-sm font-medium">
              Code
              <input className={fieldClass} name="code" required />
            </label>
            <label className="text-sm font-medium">
              Name
              <input className={fieldClass} name="name" required />
            </label>
            <Button type="submit">Create category</Button>
          </form>
        </section>
      ) : null}
      {canManage ? (
        <section className={`${panel} mt-7`}>
          <h2 className="text-xl font-semibold">Submit expense</h2>
          <form
            action={saveExpense}
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <select className={fieldClass} name="expenseCategoryId" required>
              <option value="">Select category</option>
              {w.categories.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
            <select className={fieldClass} name="kind">
              <option value="expense">Expense</option>
              <option value="cash_advance">Cash advance</option>
              <option value="petty_cash">Petty cash</option>
            </select>
            <input
              className={fieldClass}
              name="requestedAmount"
              inputMode="decimal"
              placeholder="Requested amount"
              required
            />
            <input
              className={fieldClass}
              name="expenseDate"
              type="date"
              required
            />
            <select className={fieldClass} name="sessionId">
              <option value="">No session</option>
              {w.sessions.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
            <select className={fieldClass} name="periodId">
              <option value="">No period</option>
              {w.periods.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
            <textarea
              className={`${fieldClass} min-h-24 sm:col-span-2 lg:col-span-3`}
              name="description"
              placeholder="Description"
              required
            />
            <Button type="submit" className="sm:w-fit">
              Submit expense
            </Button>
          </form>
        </section>
      ) : null}
      <section className="mt-7">
        <h2 className="text-xl font-semibold">Expense register</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {w.expenses.map((x) => (
            <article className={panel} key={x.id}>
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{x.description}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {x.kind.replace("_", " ")} · {x.status}
                  </p>
                </div>
                <p className="font-semibold">
                  ₦
                  {Number(
                    x.approved_amount ?? x.requested_amount,
                  ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </p>
              </div>
              {canApprove && x.status === "submitted" ? (
                <form
                  action={reviewExpense}
                  className="mt-4 grid gap-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="expenseId" value={x.id} />
                  <input
                    className={fieldClass}
                    name="approvedAmount"
                    defaultValue={x.requested_amount}
                    required
                  />
                  <input
                    className={fieldClass}
                    name="note"
                    placeholder="Decision note"
                    required
                  />
                  <Button name="approve" value="true" type="submit">
                    Approve
                  </Button>
                  <Button
                    name="approve"
                    value="false"
                    type="submit"
                    variant="secondary"
                  >
                    Reject
                  </Button>
                </form>
              ) : null}
              {canManage && x.status === "approved" ? (
                <form
                  action={payExpense}
                  className="mt-4 grid gap-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="expenseId" value={x.id} />
                  <select className={fieldClass} name="documentId" required>
                    <option value="">Select payment evidence</option>
                    {w.documents.map((document) => (
                      <option key={document.id} value={document.id}>
                        {document.title} · {document.original_filename}
                      </option>
                    ))}
                  </select>
                  <input
                    className={fieldClass}
                    name="note"
                    placeholder="Payment note"
                  />
                  <Button type="submit" className="sm:w-fit">
                    Mark paid
                  </Button>
                </form>
              ) : null}
              {canManage && x.status === "paid" ? (
                <form
                  action={finishExpense}
                  className="mt-4 flex flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="expenseId" value={x.id} />
                  <input
                    className={fieldClass}
                    name="note"
                    placeholder="Completion note"
                  />
                  <Button type="submit">Complete expense</Button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
