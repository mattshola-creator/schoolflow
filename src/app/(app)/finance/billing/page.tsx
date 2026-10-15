import Link from "next/link";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatePanel } from "@/components/ui/state-panel";
import { FinanceWorkspaceNav } from "@/components/finance-workspace-nav";
import { FinanceUnavailableState } from "@/components/finance-unavailable-state";
import { loadStudentBillRegister } from "@/features/finance/service";

const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";
const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
const invoiceStatuses = ["open", "partially_paid", "paid", "voided"] as const;

export default async function StudentBillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    session?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(0, Number.parseInt(params.page ?? "0", 10) || 0);
  const result = await loadStudentBillRegister({
    query: params.q,
    status: params.status,
    sessionId: params.session,
    page,
  })
    .then((workspace) => ({ workspace, error: null }))
    .catch((error: unknown) => ({ workspace: null, error }));
  const w = result.workspace;
  if (!w)
    return (
      <FinanceUnavailableState area="Student bills" error={result.error} />
    );
  const lastPage = Math.max(0, Math.ceil(w.total / w.pageSize) - 1);
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.status) query.set("status", params.status);
    if (params.session) query.set("session", params.session);
    query.set("page", String(nextPage));
    return `/finance/billing?${query.toString()}`;
  };

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Finance · Student billing"
        title={`Student bill register at ${w.active.schoolName}`}
        description="Review issued student invoices and their remaining balances. Financial values come from the existing school-scoped bill and allocation records."
        actions={
          <FinanceWorkspaceNav
            authorization={w.authorization}
            currentPath="/finance/billing"
          />
        }
      />

      <section className={`${panel} mt-7`} aria-labelledby="bill-filters">
        <h2 id="bill-filters" className="text-lg font-semibold">
          Find bills
        </h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-medium">
            Invoice number or student number
            <input
              className={fieldClass}
              name="q"
              defaultValue={params.q}
              placeholder={
                w.canViewStudentIdentity
                  ? "Invoice or student number"
                  : "Invoice number"
              }
              maxLength={100}
            />
          </label>
          <label className="text-sm font-medium">
            Billing status
            <select
              className={fieldClass}
              name="status"
              defaultValue={
                invoiceStatuses.includes(
                  params.status as (typeof invoiceStatuses)[number],
                )
                  ? params.status
                  : ""
              }
            >
              <option value="">All statuses</option>
              {invoiceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Academic session
            <select
              className={fieldClass}
              name="session"
              defaultValue={params.session ?? ""}
            >
              <option value="">All sessions</option>
              {w.sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <Button type="submit">Apply filters</Button>
            <Link
              href="/finance/billing"
              className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-semibold"
            >
              Clear
            </Link>
          </div>
        </form>
      </section>

      <section className="mt-7" aria-labelledby="bill-results">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="bill-results" className="text-xl font-semibold">
              Issued bills
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {w.total === 0
                ? "No matching bills"
                : `Showing ${w.page * w.pageSize + 1}–${Math.min((w.page + 1) * w.pageSize, w.total)} of ${w.total}`}
            </p>
          </div>
          {w.total > w.pageSize ? (
            <nav aria-label="Bill register pages" className="flex gap-2">
              <Link
                aria-disabled={w.page === 0}
                className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50"
                href={pageHref(Math.max(0, w.page - 1))}
              >
                Previous
              </Link>
              <Link
                aria-disabled={w.page >= lastPage}
                className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50"
                href={pageHref(Math.min(lastPage, w.page + 1))}
              >
                Next
              </Link>
            </nav>
          ) : null}
        </div>

        {w.rows.length ? (
          <>
            <div className="mt-4 hidden overflow-x-auto rounded-xl border bg-white md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Invoice</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Session</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Billed</th>
                    <th className="p-4 text-right">Outstanding</th>
                    <th className="p-4">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {w.rows.map((bill) => (
                    <tr key={bill.id}>
                      <td className="p-4 font-semibold">
                        {bill.invoice_number}
                      </td>
                      <td className="p-4">
                        {bill.studentName ? (
                          <>
                            <span className="block font-medium">
                              {bill.studentName}
                            </span>
                            <span className="text-slate-500">
                              {bill.studentNumber}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-600">
                            Student identity is restricted for this role
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {w.sessions.find(
                          (session) => session.id === bill.session_id,
                        )?.name ?? "—"}
                      </td>
                      <td className="p-4 capitalize">
                        {bill.status.replace("_", " ")}
                      </td>
                      <td className="p-4 text-right tabular-nums">
                        {money(bill.billedAmount, bill.currency_code)}
                      </td>
                      <td className="p-4 text-right tabular-nums">
                        {money(bill.outstandingAmount, bill.currency_code)}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          className="text-tenant-accent font-semibold underline-offset-2 hover:underline"
                          href={`/finance/billing/${bill.id}`}
                        >
                          View bill
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-3 md:hidden">
              {w.rows.map((bill) => (
                <article className={panel} key={bill.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{bill.invoice_number}</h3>
                      {bill.studentName ? (
                        <>
                          <p className="mt-1 text-sm">{bill.studentName}</p>
                          <p className="text-sm text-slate-600">
                            {bill.studentNumber}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-slate-600">
                          Student identity is restricted for this role
                        </p>
                      )}
                    </div>
                    <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">
                      {bill.status.replace("_", " ")}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-600">Billed</dt>
                      <dd className="mt-1 font-semibold tabular-nums">
                        {money(bill.billedAmount, bill.currency_code)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Outstanding</dt>
                      <dd className="mt-1 font-semibold tabular-nums">
                        {money(bill.outstandingAmount, bill.currency_code)}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    className="text-tenant-accent mt-4 inline-flex min-h-11 items-center font-semibold"
                    href={`/finance/billing/${bill.id}`}
                  >
                    View bill details →
                  </Link>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4">
            <StatePanel
              kind="empty"
              title="No bills match these filters"
              description="Try another invoice or student number, status, or academic session."
            />
          </div>
        )}
      </section>
    </main>
  );
}
