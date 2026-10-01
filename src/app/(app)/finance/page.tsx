import { fieldClass } from "@/components/auth-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  loadFeeWorkspace,
  previewBillingRun,
} from "@/features/finance/service";
import {
  activateStructure,
  runBilling,
  saveFeeCategory,
  saveFeeStructure,
} from "./actions";

const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const notice = await searchParams;
  const workspace = await loadFeeWorkspace().catch(() => null);
  if (!workspace)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Finance is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school and enable the Finance fee-management
          feature.
        </p>
      </main>
    );
  const canConfigure =
    workspace.authorization.permissions.includes("finance.configure");
  const canBill = workspace.authorization.permissions.includes(
    "finance.billing.manage",
  );
  const previews = new Map<
    string,
    { studentCount: number; expectedTotal: number; currencyCode: string }
  >();
  if (canBill)
    await Promise.all(
      workspace.structures
        .filter((item) => item.status === "active")
        .map(async (item) => {
          const preview = await previewBillingRun(item.id).catch(() => null);
          if (preview) previews.set(item.id, preview);
        }),
    );
  const categoryNames = new Map(
    workspace.categories.map((item) => [item.id, item.name]),
  );
  return (
    <main className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Finance"
        title={`Fee setup at ${workspace.active.schoolName}`}
        description="Configure effective-dated fee policy. Published billing will snapshot these values so later changes cannot rewrite history."
        actions={
          <>
            <ButtonLink href="/finance/payments" variant="secondary">
              Payments
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
      <section
        className="mt-7 grid gap-4 sm:grid-cols-3"
        aria-label="Finance setup summary"
      >
        <div className={panel}>
          <p className="text-sm text-slate-500">Currency</p>
          <p className="mt-2 text-2xl font-semibold">
            {workspace.settings?.currency_code ?? "NGN"}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Fee categories</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.categories.length}
          </p>
        </div>
        <div className={panel}>
          <p className="text-sm text-slate-500">Structures</p>
          <p className="mt-2 text-3xl font-semibold">
            {workspace.structures.length}
          </p>
        </div>
      </section>
      {canConfigure ? (
        <div className="mt-7 grid min-w-0 gap-6 xl:grid-cols-2">
          <section className={panel}>
            <h2 className="text-xl font-semibold">Add fee category</h2>
            <form
              action={saveFeeCategory}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <label className="text-sm font-medium">
                Code
                <input
                  className={fieldClass}
                  name="code"
                  placeholder="TUITION"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Name
                <input className={fieldClass} name="name" required />
              </label>
              <label className="text-sm font-medium">
                Frequency
                <select className={fieldClass} name="frequency">
                  <option value="term">Term</option>
                  <option value="session">Session</option>
                  <option value="one_time">One time</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Description
                <input className={fieldClass} name="description" />
              </label>
              <Button type="submit" className="sm:col-span-2 sm:w-fit">
                Create category
              </Button>
            </form>
          </section>
          <section className={panel}>
            <h2 className="text-xl font-semibold">Create draft structure</h2>
            <form
              action={saveFeeStructure}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <label className="text-sm font-medium sm:col-span-2">
                Name
                <input className={fieldClass} name="name" required />
              </label>
              <label className="text-sm font-medium">
                Session
                <select className={fieldClass} name="sessionId" required>
                  <option value="">Select session</option>
                  {workspace.sessions.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Period
                <select className={fieldClass} name="periodId">
                  <option value="">Whole session</option>
                  {workspace.periods.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Class level
                <select className={fieldClass} name="classLevelId">
                  <option value="">All classes</option>
                  {workspace.levels.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Student category
                <select className={fieldClass} name="studentCategoryId">
                  <option value="">All students</option>
                  {workspace.studentCategories.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Effective from
                <input
                  className={fieldClass}
                  name="effectiveFrom"
                  type="date"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Effective to
                <input className={fieldClass} name="effectiveTo" type="date" />
              </label>
              <label className="text-sm font-medium">
                Fee category
                <select className={fieldClass} name="feeCategoryId" required>
                  <option value="">Select category</option>
                  {workspace.categories.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Amount (NGN)
                <input
                  className={fieldClass}
                  name="amount"
                  inputMode="decimal"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Due date
                <input className={fieldClass} name="dueDate" type="date" />
              </label>
              <Button type="submit" className="sm:col-span-2 sm:w-fit">
                Create draft
              </Button>
            </form>
          </section>
        </div>
      ) : null}
      <section className="mt-7" aria-labelledby="structures-heading">
        <h2 id="structures-heading" className="text-xl font-semibold">
          Fee structures
        </h2>
        {workspace.structures.length ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {workspace.structures.map((structure) => (
              <article className={panel} key={structure.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{structure.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Version {structure.version} · {structure.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {structure.currency_code}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {workspace.items
                    .filter((x) => x.fee_structure_id === structure.id)
                    .map((item) => (
                      <li className="flex justify-between gap-4" key={item.id}>
                        <span>
                          {categoryNames.get(item.fee_category_id) ?? "Fee"}
                        </span>
                        <span className="font-semibold">
                          ₦
                          {Number(item.amount).toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    ))}
                </ul>
                {canConfigure && structure.status === "draft" ? (
                  <form action={activateStructure} className="mt-4">
                    <input
                      type="hidden"
                      name="structureId"
                      value={structure.id}
                    />
                    <Button type="submit" variant="secondary">
                      Activate structure
                    </Button>
                  </form>
                ) : null}
                {canBill &&
                structure.status === "active" &&
                previews.get(structure.id) ? (
                  <div className="mt-4 rounded-lg bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-950">
                      Billing preview
                    </p>
                    <p className="mt-1 text-sm text-emerald-900">
                      {previews.get(structure.id)!.studentCount} students · ₦
                      {Number(
                        previews.get(structure.id)!.expectedTotal,
                      ).toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <form action={runBilling} className="mt-3">
                      <input
                        type="hidden"
                        name="structureId"
                        value={structure.id}
                      />
                      <input
                        type="hidden"
                        name="idempotencyKey"
                        value={crypto.randomUUID()}
                      />
                      <Button type="submit">Generate charges</Button>
                    </form>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className={`${panel} mt-4`}>
            <p className="font-medium">No fee structures yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Create a category and the first draft structure to begin.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
