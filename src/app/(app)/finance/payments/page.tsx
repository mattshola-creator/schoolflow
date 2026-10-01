import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { loadCollectionsWorkspace } from "@/features/finance/service";
import {
  allocate,
  endCashier,
  handoverCash,
  makeReceipt,
  savePayment,
  reverseRecordedPayment,
  startCashier,
  verifyPayment,
} from "./actions";
const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const w = await loadCollectionsWorkspace().catch(() => null);
  if (!w)
    return (
      <main className="py-16">
        <h1 className="text-3xl font-semibold">Collections unavailable</h1>
        <p className="mt-3 text-slate-600">
          Enable Finance collections in an authorized school.
        </p>
      </main>
    );
  const studentName = (s: (typeof w.students)[number]) =>
    `${s.student_profiles.student_number} · ${s.student_profiles.people.first_name} ${s.student_profiles.people.last_name}`;
  const balances = new Map(
    w.balances.map((x) => [x.student_charge_id, x.outstanding_amount]),
  );
  const receiptPayments = new Set(w.receipts.map((x) => x.payment_id));
  const canRecord = w.authorization.permissions.includes(
      "finance.payments.record",
    ),
    canVerify = w.authorization.permissions.includes("finance.payments.verify"),
    canAllocate = w.authorization.permissions.includes(
      "finance.payments.allocate",
    ),
    canCorrect = w.authorization.permissions.includes(
      "finance.payments.correct",
    ),
    canCashier = w.authorization.permissions.includes("finance.cashier.manage");
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Finance · Collections"
        title={`Payments at ${w.active.schoolName}`}
        description="Record manual payments, independently verify them, allocate exact amounts, and issue immutable receipts."
        actions={
          <>
            <ButtonLink href="/finance" variant="secondary">
              Fee setup
            </ButtonLink>
            <ButtonLink href="/finance/expenses" variant="secondary">
              Expenses
            </ButtonLink>
            <ButtonLink href="/finance/reports" variant="secondary">
              Reports
            </ButtonLink>
          </>
        }
      />
      {notice.error || notice.message ? (
        <p
          role={notice.error ? "alert" : "status"}
          className={`mt-5 rounded-lg p-3 text-sm font-medium ${notice.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
        >
          {notice.error ?? notice.message}
        </p>
      ) : null}
      {canCashier ? (
        <section className={`${panel} mt-7`}>
          <h2 className="text-xl font-semibold">Cashier control</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <form
              action={startCashier}
              className="flex flex-wrap items-end gap-3"
            >
              <label className="text-sm font-medium">
                Opening cash
                <input
                  className={fieldClass}
                  name="openingCash"
                  inputMode="decimal"
                  required
                />
              </label>
              <Button type="submit">Open session</Button>
            </form>
            {w.cashierSessions
              .filter(
                (x) => x.status === "open" && x.cashier_user_id === w.user.id,
              )
              .map((x) => (
                <form
                  action={endCashier}
                  key={x.id}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="sessionId" value={x.id} />
                  <label className="text-sm font-medium">
                    Counted cash
                    <input
                      className={fieldClass}
                      name="countedCash"
                      inputMode="decimal"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Close note
                    <input className={fieldClass} name="note" />
                  </label>
                  <Button type="submit" className="sm:col-span-2 sm:w-fit">
                    Close session
                  </Button>
                </form>
              ))}
            {w.cashierSessions
              .filter(
                (x) => x.status === "closed" && Number(x.counted_cash ?? 0) > 0,
              )
              .map((x) => (
                <form
                  action={handoverCash}
                  key={`handover-${x.id}`}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="sessionId" value={x.id} />
                  <label className="text-sm font-medium">
                    Handover amount
                    <input
                      className={fieldClass}
                      name="amount"
                      inputMode="decimal"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Handed to
                    <select className={fieldClass} name="handedTo" required>
                      <option value="">Select organization member</option>
                      {w.members
                        .filter((m) => m.user_id !== w.user.id)
                        .map((m) => (
                          <option key={m.user_id} value={m.user_id}>
                            {m.user_id}
                          </option>
                        ))}
                    </select>
                  </label>
                  <input
                    className={fieldClass}
                    name="note"
                    placeholder="Handover note"
                  />
                  <Button type="submit" className="sm:w-fit">
                    Record handover
                  </Button>
                </form>
              ))}
          </div>
        </section>
      ) : null}
      {canRecord ? (
        <section className={`${panel} mt-7`}>
          <h2 className="text-xl font-semibold">Record payment</h2>
          <form
            action={savePayment}
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="text-sm font-medium">
              Student
              <select className={fieldClass} name="studentId">
                <option value="">Unmatched payment</option>
                {w.students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {studentName(s)}
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
              Method
              <select className={fieldClass} name="method">
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="pos">POS</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Payer name
              <input className={fieldClass} name="payerName" required />
            </label>
            <label className="text-sm font-medium">
              Paid at
              <input
                className={fieldClass}
                name="paidAt"
                type="datetime-local"
                required
              />
            </label>
            <label className="text-sm font-medium">
              Reference
              <input className={fieldClass} name="reference" />
            </label>
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
            <input className={fieldClass} name="notes" placeholder="Notes" />
            <input
              type="hidden"
              name="idempotencyKey"
              value={crypto.randomUUID()}
            />
            <Button type="submit" className="sm:w-fit">
              Record payment
            </Button>
          </form>
        </section>
      ) : null}
      <section className="mt-7">
        <h2 className="text-xl font-semibold">Payment register</h2>
        <div className="mt-4 grid gap-4">
          {w.payments.map((p) => (
            <article className={panel} key={p.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    ₦
                    {Number(p.amount).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    · {p.method.replace("_", " ")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {p.payer_name ?? "Unidentified payer"} · {p.status}
                  </p>
                </div>
                <time className="text-sm text-slate-500">
                  {new Date(p.paid_at).toLocaleString("en-NG")}
                </time>
              </div>
              {canVerify && p.status === "recorded" ? (
                <form
                  action={verifyPayment}
                  className="mt-4 flex flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="paymentId" value={p.id} />
                  <input
                    className={fieldClass}
                    name="note"
                    placeholder="Verification note"
                    required
                  />
                  <Button name="approve" value="true" type="submit">
                    Verify
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
              {canAllocate && p.status === "verified" ? (
                <form
                  action={allocate}
                  className="mt-4 grid gap-3 sm:grid-cols-3"
                >
                  <input type="hidden" name="paymentId" value={p.id} />
                  <select className={fieldClass} name="chargeId" required>
                    <option value="">Select outstanding charge</option>
                    {w.charges
                      .filter((c) => Number(balances.get(c.id) ?? 0) > 0)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fee_category_name_snapshot} · ₦
                          {Number(balances.get(c.id)).toLocaleString("en-NG")}
                        </option>
                      ))}
                  </select>
                  <input
                    className={fieldClass}
                    name="amount"
                    inputMode="decimal"
                    placeholder="Amount"
                    required
                  />
                  <Button type="submit">Allocate</Button>
                </form>
              ) : null}
              {p.status === "verified" && !receiptPayments.has(p.id) ? (
                <form action={makeReceipt} className="mt-3">
                  <input type="hidden" name="paymentId" value={p.id} />
                  <Button type="submit" variant="secondary">
                    Issue receipt
                  </Button>
                </form>
              ) : null}
              {canCorrect && p.status === "verified" ? (
                <form
                  action={reverseRecordedPayment}
                  className="mt-3 flex flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="paymentId" value={p.id} />
                  <label className="text-sm font-medium">
                    Correction reason
                    <input
                      className={fieldClass}
                      name="reason"
                      minLength={3}
                      required
                    />
                  </label>
                  <Button type="submit" variant="secondary">
                    Reverse payment
                  </Button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
