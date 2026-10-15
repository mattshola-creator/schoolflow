import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatePanel } from "@/components/ui/state-panel";
import { FinanceWorkspaceNav } from "@/components/finance-workspace-nav";
import { FinanceUnavailableState } from "@/components/finance-unavailable-state";
import { evaluateAccess } from "@/features/authorization/evaluator";
import { loadStudentBillDetail } from "@/features/finance/service";

const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";
const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);

export default async function StudentBillDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const result = await loadStudentBillDetail(invoiceId)
    .then((workspace) => ({ workspace, error: null }))
    .catch((error: unknown) => ({ workspace: null, error }));
  const w = result.workspace;
  if (!w) {
    if (!result.error) notFound();
    return <FinanceUnavailableState area="Bill detail" error={result.error} />;
  }
  const canViewAllocations = evaluateAccess(w.authorization, {
    permission: "finance.payments.view",
    module: "finance",
    feature: "finance.collections",
  }).allowed;
  const billed = w.lines.reduce(
    (sum, line) => sum + Number(line.original_amount),
    0,
  );
  const outstanding = w.lines.reduce(
    (sum, line) => sum + line.outstandingAmount,
    0,
  );

  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Finance · Student billing"
        title={`Bill ${w.invoice.invoice_number}`}
        description={`${w.invoice.studentName ? `${w.invoice.studentName} · ${w.invoice.studentNumber}` : "Student identity is restricted for this role"} · ${w.active.schoolName}`}
        actions={
          <FinanceWorkspaceNav
            authorization={w.authorization}
            currentPath="/finance/billing"
          />
        }
      />
      <div className="mt-5">
        <Link
          className="text-tenant-accent text-sm font-semibold hover:underline"
          href="/finance/billing"
        >
          ← Back to student bills
        </Link>
      </div>

      <section
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Bill summary"
      >
        <div className={panel}>
          <p className="text-sm text-slate-600">Student</p>
          {w.invoice.studentName ? (
            <>
              <p className="mt-2 font-semibold">{w.invoice.studentName}</p>
              <p className="text-sm text-slate-600">
                {w.invoice.studentNumber}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              Student identity is restricted for this role
            </p>
          )}
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-600">Status</p>
          <p className="mt-2 font-semibold capitalize">
            {w.invoice.status.replace("_", " ")}
          </p>
          <p className="text-sm text-slate-600">
            Issued {new Date(w.invoice.issued_at).toLocaleDateString("en-NG")}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-600">Original billed</p>
          <p className="mt-2 text-xl font-semibold break-words tabular-nums">
            {money(billed, w.invoice.currency_code)}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-600">Outstanding</p>
          <p className="mt-2 text-xl font-semibold break-words tabular-nums">
            {money(outstanding, w.invoice.currency_code)}
          </p>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="bill-lines-title">
        <h2 id="bill-lines-title" className="text-xl font-semibold">
          Bill items
        </h2>
        {w.lines.length ? (
          <div className="mt-4 grid gap-3">
            {w.lines.map((line) => (
              <article className={panel} key={line.id}>
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {line.fee_category_name_snapshot}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {line.fee_structure_name_snapshot} ·{" "}
                      <span className="capitalize">
                        {line.status.replace("_", " ")}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Due{" "}
                      {line.due_date
                        ? new Date(
                            `${line.due_date}T00:00:00`,
                          ).toLocaleDateString("en-NG")
                        : "No due date"}
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-4 text-sm sm:min-w-56">
                    <div>
                      <dt className="text-slate-600">Billed</dt>
                      <dd className="mt-1 font-semibold tabular-nums">
                        {money(
                          Number(line.original_amount),
                          line.currency_code,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Balance</dt>
                      <dd className="mt-1 font-semibold tabular-nums">
                        {money(line.outstandingAmount, line.currency_code)}
                      </dd>
                    </div>
                  </dl>
                </div>
                {canViewAllocations ? (
                  <div className="mt-4 border-t pt-3">
                    <h4 className="text-sm font-semibold">
                      Payment allocations
                    </h4>
                    {line.allocations.length ? (
                      <ul className="mt-2 divide-y text-sm">
                        {line.allocations.map((allocation) => (
                          <li
                            className="flex flex-wrap justify-between gap-3 py-2"
                            key={allocation.id}
                          >
                            <span>
                              {new Date(
                                allocation.allocated_at,
                              ).toLocaleDateString("en-NG")}{" "}
                              ·{" "}
                              {allocation.payment?.method.replace("_", " ") ??
                                "payment"}{" "}
                              ·{" "}
                              {allocation.payment?.status ??
                                "status unavailable"}
                            </span>
                            <strong className="tabular-nums">
                              {money(
                                Number(allocation.amount),
                                line.currency_code,
                              )}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">
                        No payment has been allocated to this bill item.
                      </p>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <StatePanel
              kind="empty"
              title="No bill items are available"
              description="This invoice has no visible charge lines in the current school context."
            />
          </div>
        )}
      </section>
      {canViewAllocations ? (
        <div className="mt-6">
          <Link
            className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-semibold"
            href="/finance/payments"
          >
            Open payment register
          </Link>
        </div>
      ) : null}
    </main>
  );
}
