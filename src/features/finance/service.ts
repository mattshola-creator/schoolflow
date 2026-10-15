import { evaluateAccess } from "@/features/authorization/evaluator";
import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import type {
  ExpenseInput,
  FeeCategoryInput,
  FeeStructureInput,
  PaymentInput,
} from "./schemas";
import type { z } from "zod";
import { otherIncomeSchema } from "./schemas";

async function loadAllPages<T>(
  readPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const pageSize = 500;
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await readPage(from, from + pageSize - 1);
    if (error) throw new Error("Finance summary could not be loaded");
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

function totalsByCurrency(
  rows: Array<{ currency_code: string | null; amount: number | string | null }>,
) {
  return rows.reduce<Record<string, number>>((totals, row) => {
    const currency = row.currency_code ?? "NGN";
    totals[currency] = (totals[currency] ?? 0) + Number(row.amount ?? 0);
    return totals;
  }, {});
}

export async function loadFinanceDashboard() {
  const authorization = await requireCapability({
    permission: "finance.view",
    module: "finance",
  });
  if (!authorization.schoolId) throw new Error("A school context is required");
  const [{ supabase }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !active ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active school context is invalid");

  const scope = {
    organization_id: active.organizationId,
    school_id: active.schoolId!,
  };
  const allowed = (permission: string, feature: string) =>
    evaluateAccess(authorization, { permission, module: "finance", feature })
      .allowed;
  const canViewBilling = allowed("finance.billing.view", "finance.billing");
  const canViewCollections = allowed(
    "finance.payments.view",
    "finance.collections",
  );
  const canViewExpenses = allowed("finance.expenses.view", "finance.expenses");
  const canViewReports = allowed("finance.reports.view", "finance.reporting");
  const canManageCashier = allowed(
    "finance.cashier.manage",
    "finance.cashier_control",
  );
  const canReconcile = allowed("finance.reconcile", "finance.cashier_control");
  const recentSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentDate = recentSince.toISOString().slice(0, 10);

  const [
    charges,
    balances,
    payments,
    expenses,
    otherIncome,
    pendingPayments,
    pendingExpenses,
    cashierSessions,
    reconciliations,
  ] = await Promise.all([
    canViewBilling
      ? loadAllPages((from, to) =>
          supabase
            .from("student_charges")
            .select("id, original_amount, currency_code, status")
            .match(scope)
            .neq("status", "reversed")
            .range(from, to),
        )
      : Promise.resolve([]),
    canViewBilling
      ? loadAllPages((from, to) =>
          supabase
            .from("student_charge_balances")
            .select("student_charge_id, outstanding_amount")
            .match(scope)
            .range(from, to),
        )
      : Promise.resolve([]),
    canViewCollections
      ? loadAllPages((from, to) =>
          supabase
            .from("payments")
            .select("amount, currency_code, status, paid_at")
            .match(scope)
            .gte("paid_at", recentSince.toISOString())
            .in("status", ["recorded", "verified"])
            .range(from, to),
        )
      : Promise.resolve([]),
    canViewExpenses
      ? loadAllPages((from, to) =>
          supabase
            .from("finance_expense_summary")
            .select("expense_date, currency_code, expense_count, amount")
            .match(scope)
            .gte("expense_date", recentDate)
            .range(from, to),
        )
      : Promise.resolve([]),
    canViewReports
      ? loadAllPages((from, to) =>
          supabase
            .from("other_income")
            .select("amount, currency_code, received_at")
            .match(scope)
            .gte("received_at", recentSince.toISOString())
            .range(from, to),
        )
      : Promise.resolve([]),
    canViewCollections
      ? supabase
          .from("payments")
          .select("id", { count: "exact", head: true })
          .match(scope)
          .eq("status", "recorded")
      : Promise.resolve({ count: 0, error: null }),
    canViewExpenses
      ? supabase
          .from("expenses")
          .select("id", { count: "exact", head: true })
          .match(scope)
          .eq("status", "submitted")
      : Promise.resolve({ count: 0, error: null }),
    canManageCashier
      ? supabase
          .from("cashier_sessions")
          .select("id", { count: "exact", head: true })
          .match(scope)
          .eq("status", "open")
      : Promise.resolve({ count: 0, error: null }),
    canReconcile
      ? supabase
          .from("reconciliation_records")
          .select("id", { count: "exact", head: true })
          .match(scope)
          .eq("status", "exception")
      : Promise.resolve({ count: 0, error: null }),
  ]);

  if (
    pendingPayments.error ||
    pendingExpenses.error ||
    cashierSessions.error ||
    reconciliations.error
  )
    throw new Error("Finance dashboard could not be loaded");

  const chargeCurrency = new Map(
    charges.map((charge) => [charge.id, charge.currency_code]),
  );
  const billedByCurrency = totalsByCurrency(
    charges.map((charge) => ({
      currency_code: charge.currency_code,
      amount: charge.original_amount,
    })),
  );
  const outstandingByCurrency = totalsByCurrency(
    balances.map((balance) => ({
      currency_code:
        chargeCurrency.get(balance.student_charge_id ?? "") ?? "NGN",
      amount: balance.outstanding_amount,
    })),
  );
  const verifiedCollectionsByCurrency = totalsByCurrency(
    payments
      .filter((payment) => payment.status === "verified")
      .map((payment) => ({
        currency_code: payment.currency_code,
        amount: payment.amount,
      })),
  );
  const expensesByCurrency = totalsByCurrency(
    expenses.map((expense) => ({
      currency_code: expense.currency_code,
      amount: expense.amount,
    })),
  );
  const otherIncomeByCurrency = totalsByCurrency(
    otherIncome.map((income) => ({
      currency_code: income.currency_code,
      amount: income.amount,
    })),
  );

  return {
    active,
    authorization,
    windowStart: recentDate,
    billedByCurrency,
    outstandingByCurrency,
    verifiedCollectionsByCurrency,
    expensesByCurrency,
    otherIncomeByCurrency,
    pendingPayments: pendingPayments.count ?? 0,
    pendingExpenses: pendingExpenses.count ?? 0,
    openCashierSessions: cashierSessions.count ?? 0,
    openReconciliations: reconciliations.count ?? 0,
    visibility: {
      billing: canViewBilling,
      collections: canViewCollections,
      expenses: canViewExpenses,
      reports: canViewReports,
      cashier: canManageCashier,
      reconciliation: canReconcile,
    },
  };
}

export async function requireFinanceContext(
  permission = "finance.view",
  feature = "finance.fee_management",
) {
  const authorization = await requireCapability({
    permission,
    module: "finance",
    feature,
  });
  if (!authorization.schoolId) throw new Error("A school context is required");
  const [{ supabase, user }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !active ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active school context is invalid");
  return { supabase, user, active, authorization };
}

export async function loadFeeWorkspace() {
  const context = await requireFinanceContext();
  const scope = {
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
  };
  const [
    settings,
    categories,
    structures,
    items,
    sessions,
    periods,
    levels,
    studentCategories,
  ] = await Promise.all([
    context.supabase
      .from("finance_settings")
      .select(
        "currency_code, require_payment_verification, payment_recorder_may_verify",
      )
      .match(scope)
      .maybeSingle(),
    context.supabase
      .from("fee_categories")
      .select("id, code, name, frequency, status")
      .match(scope)
      .order("name"),
    context.supabase
      .from("fee_structures")
      .select(
        "id, name, version, session_id, period_id, class_level_id, student_category_id, effective_from, effective_to, status, currency_code",
      )
      .match(scope)
      .order("created_at", { ascending: false }),
    context.supabase
      .from("fee_structure_items")
      .select(
        "id, fee_structure_id, fee_category_id, amount, due_date, installment_sequence",
      )
      .match(scope),
    context.supabase
      .from("academic_sessions")
      .select("id, name, start_date, end_date, status")
      .match(scope)
      .order("start_date", { ascending: false }),
    context.supabase
      .from("academic_periods")
      .select("id, session_id, name, start_date, end_date")
      .match(scope)
      .order("sequence"),
    context.supabase
      .from("class_levels")
      .select("id, name")
      .match(scope)
      .eq("status", "active")
      .order("sort_order"),
    context.supabase
      .from("student_categories")
      .select("id, name, status")
      .match(scope)
      .eq("status", "active")
      .order("name"),
  ]);
  if (
    [
      settings,
      categories,
      structures,
      items,
      sessions,
      periods,
      levels,
      studentCategories,
    ].some((result) => result.error)
  )
    throw new Error("Finance configuration could not be loaded");
  return {
    ...context,
    settings: settings.data,
    categories: categories.data ?? [],
    structures: structures.data ?? [],
    items: items.data ?? [],
    sessions: sessions.data ?? [],
    periods: periods.data ?? [],
    levels: levels.data ?? [],
    studentCategories: studentCategories.data ?? [],
  };
}

export async function createFeeCategory(input: FeeCategoryInput) {
  const context = await requireFinanceContext("finance.configure");
  const { error } = await context.supabase.from("fee_categories").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    ...input,
  });
  if (error) throw new Error("Fee category could not be created");
}

export async function createFeeStructure(input: FeeStructureInput) {
  const context = await requireFinanceContext("finance.configure");
  const { error } = await context.supabase.rpc("create_fee_structure", {
    target_organization_id: context.active.organizationId,
    target_school_id: context.active.schoolId!,
    target_session_id: input.sessionId,
    target_period_id: (input.periodId ?? null) as unknown as string,
    target_class_level_id: (input.classLevelId ?? null) as unknown as string,
    target_student_category_id: (input.studentCategoryId ??
      null) as unknown as string,
    target_name: input.name,
    target_effective_from: input.effectiveFrom,
    target_effective_to: (input.effectiveTo ?? null) as unknown as string,
    target_fee_category_id: input.feeCategoryId,
    target_amount: Number(input.amount),
    target_due_date: (input.dueDate ?? null) as unknown as string,
  });
  if (error) throw new Error("Fee structure could not be created");
}

export async function activateFeeStructure(structureId: string) {
  const context = await requireFinanceContext("finance.configure");
  const { error } = await context.supabase.rpc("activate_fee_structure", {
    target_structure_id: structureId,
  });
  if (error) throw new Error("Fee structure could not be activated");
}

export async function previewBillingRun(structureId: string) {
  const context = await requireFinanceContext(
    "finance.billing.manage",
    "finance.billing",
  );
  const { data, error } = await context.supabase.rpc("preview_billing_run", {
    target_structure_id: structureId,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Billing preview could not be prepared");
  return data as {
    studentCount: number;
    expectedTotal: number;
    currencyCode: string;
  };
}

export async function generateBillingRun(
  structureId: string,
  idempotencyKey: string,
) {
  const context = await requireFinanceContext(
    "finance.billing.manage",
    "finance.billing",
  );
  const { error } = await context.supabase.rpc("generate_billing_run", {
    target_structure_id: structureId,
    target_idempotency_key: idempotencyKey,
  });
  if (error) throw new Error("Billing run could not be generated");
}

export async function loadCollectionsWorkspace() {
  const context = await requireFinanceContext(
    "finance.payments.view",
    "finance.collections",
  );
  const scope = {
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
  };
  const [
    students,
    sessions,
    periods,
    payments,
    charges,
    balances,
    receipts,
    cashierSessions,
    members,
  ] = await Promise.all([
    context.supabase
      .from("student_enrollments")
      .select(
        "student_id, student_profiles!inner(student_number, people!inner(first_name, last_name))",
      )
      .match(scope)
      .eq("status", "active"),
    context.supabase
      .from("academic_sessions")
      .select("id, name")
      .match(scope)
      .in("status", ["planned", "current"]),
    context.supabase
      .from("academic_periods")
      .select("id, session_id, name")
      .match(scope)
      .in("status", ["planned", "current"]),
    context.supabase
      .from("payments")
      .select(
        "id, student_id, amount, currency_code, method, reference, paid_at, payer_name, status, recorded_by, verified_by",
      )
      .match(scope)
      .order("paid_at", { ascending: false })
      .limit(100),
    context.supabase
      .from("student_charges")
      .select(
        "id, student_id, fee_category_name_snapshot, original_amount, currency_code, due_date, status",
      )
      .match(scope)
      .order("created_at", { ascending: false })
      .limit(200),
    context.supabase
      .from("student_charge_balances")
      .select("student_charge_id, outstanding_amount")
      .match(scope),
    context.supabase
      .from("receipts")
      .select(
        "id, payment_id, receipt_number, amount, currency_code, issued_at",
      )
      .match(scope)
      .order("issued_at", { ascending: false })
      .limit(100),
    context.supabase
      .from("cashier_sessions")
      .select(
        "id, cashier_user_id, opened_at, opening_cash, expected_cash, counted_cash, variance, status",
      )
      .match(scope)
      .order("opened_at", { ascending: false })
      .limit(20),
    context.supabase
      .from("organization_memberships")
      .select("user_id")
      .eq("organization_id", context.active.organizationId)
      .eq("status", "active")
      .order("created_at"),
  ]);
  if (
    [
      students,
      sessions,
      periods,
      payments,
      charges,
      balances,
      receipts,
      cashierSessions,
      members,
    ].some((x) => x.error)
  )
    throw new Error("Collections workspace could not be loaded");
  const paymentIds = (payments.data ?? []).map((payment) => payment.id);
  const allocationResult = paymentIds.length
    ? await loadAllPages((from, to) =>
        context.supabase
          .from("payment_allocations")
          .select("payment_id, amount")
          .match(scope)
          .in("payment_id", paymentIds)
          .range(from, to),
      )
    : [];
  return {
    ...context,
    students: students.data ?? [],
    sessions: sessions.data ?? [],
    periods: periods.data ?? [],
    payments: payments.data ?? [],
    allocations: allocationResult,
    charges: charges.data ?? [],
    balances: balances.data ?? [],
    receipts: receipts.data ?? [],
    cashierSessions: cashierSessions.data ?? [],
    members: members.data ?? [],
  };
}

const billPageSize = 25;

async function loadInvoiceLines(
  context: Awaited<ReturnType<typeof requireFinanceContext>>,
  invoiceIds: string[],
) {
  if (!invoiceIds.length)
    return { lines: [], balances: [], allocations: [], payments: [] };
  const scope = {
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
  };
  const lines = await loadAllPages((from, to) =>
    context.supabase
      .from("student_charges")
      .select(
        "id, invoice_id, fee_category_name_snapshot, fee_structure_name_snapshot, original_amount, currency_code, due_date, status",
      )
      .match(scope)
      .in("invoice_id", invoiceIds)
      .order("created_at", { ascending: true })
      .range(from, to),
  );
  const lineIds = lines.map((line) => line.id);
  if (!lineIds.length)
    return { lines, balances: [], allocations: [], payments: [] };

  const canViewPayments = evaluateAccess(context.authorization, {
    permission: "finance.payments.view",
    module: "finance",
    feature: "finance.collections",
  }).allowed;
  const [balances, allocations] = await Promise.all([
    loadAllPages((from, to) =>
      context.supabase
        .from("student_charge_balances")
        .select("student_charge_id, outstanding_amount")
        .match(scope)
        .in("student_charge_id", lineIds)
        .range(from, to),
    ),
    canViewPayments
      ? loadAllPages((from, to) =>
          context.supabase
            .from("payment_allocations")
            .select("id, payment_id, student_charge_id, amount, allocated_at")
            .match(scope)
            .in("student_charge_id", lineIds)
            .order("allocated_at", { ascending: false })
            .range(from, to),
        )
      : Promise.resolve([]),
  ]);
  const paymentIds = [...new Set(allocations.map((item) => item.payment_id))];
  const payments =
    canViewPayments && paymentIds.length
      ? await loadAllPages((from, to) =>
          context.supabase
            .from("payments")
            .select("id, status, paid_at, method")
            .match(scope)
            .in("id", paymentIds)
            .range(from, to),
        )
      : [];
  return { lines, balances, allocations, payments };
}

export async function loadStudentBillRegister(filters: {
  query?: string;
  status?: string;
  sessionId?: string;
  page?: number;
}) {
  const context = await requireFinanceContext(
    "finance.billing.view",
    "finance.billing",
  );
  const scope = {
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
  };
  const query = filters.query?.trim().slice(0, 100) ?? "";
  const statuses = ["open", "partially_paid", "paid", "voided"] as const;
  const status = statuses.find((candidate) => candidate === filters.status);
  const page = Math.max(0, Math.min(10_000, Math.trunc(filters.page ?? 0)));

  const canViewStudentIdentity = evaluateAccess(context.authorization, {
    permission: "students.view",
    module: "students",
    feature: "students.student_records",
  }).allowed;
  let matchingStudentIds: string[] = [];
  if (query && canViewStudentIdentity) {
    const { data, error } = await context.supabase
      .from("student_profiles")
      .select("id")
      .eq("organization_id", context.active.organizationId)
      .ilike("student_number", `%${query}%`)
      .limit(100);
    if (error) throw new Error("Student billing search could not be loaded");
    matchingStudentIds = (data ?? []).map((student) => student.id);
  }

  let invoicesQuery = context.supabase
    .from("student_invoices")
    .select(
      "id, invoice_number, student_id, session_id, period_id, currency_code, status, issued_at",
      { count: "exact" },
    )
    .match(scope);
  if (status) invoicesQuery = invoicesQuery.eq("status", status);
  if (filters.sessionId)
    invoicesQuery = invoicesQuery.eq("session_id", filters.sessionId);
  if (query) {
    invoicesQuery = matchingStudentIds.length
      ? invoicesQuery.in("student_id", matchingStudentIds)
      : invoicesQuery.ilike("invoice_number", `%${query}%`);
  }
  const {
    data: invoices,
    count,
    error,
  } = await invoicesQuery
    .order("issued_at", { ascending: false })
    .range(page * billPageSize, page * billPageSize + billPageSize - 1);
  if (error) throw new Error("Student bill register could not be loaded");

  const invoiceRows = invoices ?? [];
  const studentIds = [
    ...new Set(invoiceRows.map((invoice) => invoice.student_id)),
  ];
  const profileResult =
    canViewStudentIdentity && studentIds.length
      ? await context.supabase
          .from("student_profiles")
          .select("id, student_number, people!inner(first_name, last_name)")
          .eq("organization_id", context.active.organizationId)
          .in("id", studentIds)
      : { data: [], error: null };
  if (profileResult.error)
    throw new Error("Student details could not be loaded");
  const studentById = new Map(
    (profileResult.data ?? []).map((profile) => [profile.id, profile]),
  );
  const detail = await loadInvoiceLines(
    context,
    invoiceRows.map((invoice) => invoice.id),
  );
  const balanceByLine = new Map(
    detail.balances.map((balance) => [
      balance.student_charge_id,
      Number(balance.outstanding_amount ?? 0),
    ]),
  );
  const rows = invoiceRows.map((invoice) => {
    const lines = detail.lines.filter((line) => line.invoice_id === invoice.id);
    const profile = studentById.get(invoice.student_id);
    return {
      ...invoice,
      studentNumber: profile?.student_number ?? null,
      studentName: profile
        ? `${profile.people.first_name} ${profile.people.last_name}`
        : null,
      chargeCount: lines.length,
      billedAmount: lines.reduce(
        (sum, line) => sum + Number(line.original_amount),
        0,
      ),
      outstandingAmount: lines.reduce(
        (sum, line) => sum + (balanceByLine.get(line.id) ?? 0),
        0,
      ),
    };
  });
  return {
    ...context,
    rows,
    page,
    pageSize: billPageSize,
    total: count ?? 0,
    sessions: await context.supabase
      .from("academic_sessions")
      .select("id, name")
      .match(scope)
      .order("start_date", { ascending: false })
      .then(({ data, error: sessionsError }) => {
        if (sessionsError)
          throw new Error("Academic sessions could not be loaded");
        return data ?? [];
      }),
    canViewStudentIdentity,
  };
}

export async function loadStudentBillDetail(invoiceId: string) {
  const context = await requireFinanceContext(
    "finance.billing.view",
    "finance.billing",
  );
  const scope = {
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
  };
  const { data: invoice, error } = await context.supabase
    .from("student_invoices")
    .select(
      "id, invoice_number, student_id, session_id, period_id, currency_code, status, issued_at",
    )
    .match(scope)
    .eq("id", invoiceId)
    .maybeSingle();
  if (error) throw new Error("Student bill could not be loaded");
  if (!invoice) return null;

  const canViewStudentIdentity = evaluateAccess(context.authorization, {
    permission: "students.view",
    module: "students",
    feature: "students.student_records",
  }).allowed;
  const profileResult = canViewStudentIdentity
    ? await context.supabase
        .from("student_profiles")
        .select("id, student_number, people!inner(first_name, last_name)")
        .eq("organization_id", context.active.organizationId)
        .eq("id", invoice.student_id)
        .maybeSingle()
    : { data: null, error: null };
  if (profileResult.error)
    throw new Error("Student details could not be loaded");
  const detail = await loadInvoiceLines(context, [invoice.id]);
  const balanceByLine = new Map(
    detail.balances.map((balance) => [
      balance.student_charge_id,
      Number(balance.outstanding_amount ?? 0),
    ]),
  );
  const paymentById = new Map(
    detail.payments.map((payment) => [payment.id, payment]),
  );
  const allocationsByLine = new Map<string, typeof detail.allocations>();
  for (const allocation of detail.allocations) {
    const existing = allocationsByLine.get(allocation.student_charge_id) ?? [];
    allocationsByLine.set(allocation.student_charge_id, [
      ...existing,
      allocation,
    ]);
  }
  const lines = detail.lines.map((line) => ({
    ...line,
    outstandingAmount: balanceByLine.get(line.id) ?? 0,
    allocations: (allocationsByLine.get(line.id) ?? []).map((allocation) => ({
      ...allocation,
      payment: paymentById.get(allocation.payment_id) ?? null,
    })),
  }));
  return {
    ...context,
    invoice: {
      ...invoice,
      studentNumber: profileResult.data?.student_number ?? null,
      studentName: profileResult.data
        ? `${profileResult.data.people.first_name} ${profileResult.data.people.last_name}`
        : null,
    },
    lines,
    canViewStudentIdentity,
  };
}

export async function recordPayment(input: PaymentInput) {
  const context = await requireFinanceContext(
    "finance.payments.record",
    "finance.collections",
  );
  const { error } = await context.supabase.rpc("record_payment", {
    target_organization_id: context.active.organizationId,
    target_school_id: context.active.schoolId!,
    target_student_id: (input.studentId ?? null) as unknown as string,
    target_session_id: (input.sessionId ?? null) as unknown as string,
    target_period_id: (input.periodId ?? null) as unknown as string,
    target_amount: Number(input.amount),
    target_method: input.method,
    target_reference: (input.reference ?? null) as unknown as string,
    target_paid_at: input.paidAt,
    target_payer_name: input.payerName,
    target_evidence_document_id: null as unknown as string,
    target_notes: (input.notes ?? null) as unknown as string,
    target_received_by: context.user.id,
    target_idempotency_key: input.idempotencyKey,
  });
  if (error) throw new Error("Payment could not be recorded");
}

export async function decidePayment(
  paymentId: string,
  approve: boolean,
  note: string,
) {
  const context = await requireFinanceContext(
    "finance.payments.verify",
    "finance.collections",
  );
  const { error } = await context.supabase.rpc("verify_payment", {
    target_payment_id: paymentId,
    approve,
    target_note: note,
  });
  if (error) throw new Error("Payment could not be verified");
}
export async function allocatePayment(
  paymentId: string,
  chargeId: string,
  amount: string,
) {
  const context = await requireFinanceContext(
    "finance.payments.allocate",
    "finance.collections",
  );
  const { error } = await context.supabase.rpc("allocate_payment", {
    target_payment_id: paymentId,
    target_allocations: [{ chargeId, amount }],
  });
  if (error) throw new Error("Payment could not be allocated");
}
export async function issueReceipt(paymentId: string) {
  const context = await requireFinanceContext(
    "finance.payments.view",
    "finance.collections",
  );
  const { error } = await context.supabase.rpc("issue_receipt", {
    target_payment_id: paymentId,
  });
  if (error) throw new Error("Receipt could not be issued");
}
export async function reversePayment(paymentId: string, reason: string) {
  const context = await requireFinanceContext(
    "finance.payments.correct",
    "finance.collections",
  );
  const { error } = await context.supabase.rpc("reverse_payment", {
    target_payment_id: paymentId,
    target_reason: reason,
  });
  if (error) throw new Error("Payment could not be reversed");
}

export async function loadExpenseWorkspace() {
  const context = await requireFinanceContext(
    "finance.expenses.view",
    "finance.expenses",
  );
  const scope = {
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
  };
  const [categories, sessions, periods, expenses, documents] =
    await Promise.all([
      context.supabase
        .from("expense_categories")
        .select("id, code, name")
        .match(scope)
        .eq("status", "active")
        .order("name"),
      context.supabase
        .from("academic_sessions")
        .select("id, name")
        .match(scope)
        .order("start_date", { ascending: false }),
      context.supabase
        .from("academic_periods")
        .select("id, session_id, name")
        .match(scope)
        .order("sequence"),
      context.supabase
        .from("expenses")
        .select(
          "id, kind, description, requested_amount, approved_amount, currency_code, expense_date, status",
        )
        .match(scope)
        .order("expense_date", { ascending: false })
        .limit(100),
      context.supabase
        .from("documents")
        .select("id, title, original_filename")
        .match(scope)
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
  if ([categories, sessions, periods, expenses, documents].some((x) => x.error))
    throw new Error("Expenses could not be loaded");
  return {
    ...context,
    categories: categories.data ?? [],
    sessions: sessions.data ?? [],
    periods: periods.data ?? [],
    expenses: expenses.data ?? [],
    documents: documents.data ?? [],
  };
}

export async function createExpense(input: ExpenseInput) {
  const context = await requireFinanceContext(
    "finance.expenses.manage",
    "finance.expenses",
  );
  const { data, error } = await context.supabase
    .from("expenses")
    .insert({
      organization_id: context.active.organizationId,
      school_id: context.active.schoolId!,
      expense_category_id: input.expenseCategoryId,
      academic_session_id: input.sessionId ?? null,
      academic_period_id: input.periodId ?? null,
      kind: input.kind,
      description: input.description,
      requested_amount: Number(input.requestedAmount),
      expense_date: input.expenseDate,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("Expense could not be created");
  const submitted = await context.supabase.rpc("submit_expense", {
    target_expense_id: data.id,
  });
  if (submitted.error) throw new Error("Expense could not be submitted");
}
export async function createExpenseCategory(code: string, name: string) {
  const context = await requireFinanceContext(
    "finance.configure",
    "finance.expenses",
  );
  const { error } = await context.supabase.from("expense_categories").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    code,
    name,
  });
  if (error) throw new Error("Expense category could not be created");
}
export async function decideExpense(
  expenseId: string,
  approve: boolean,
  approvedAmount: string,
  note: string,
) {
  const context = await requireFinanceContext(
    "finance.expenses.approve",
    "finance.expenses",
  );
  const { error } = await context.supabase.rpc("decide_expense", {
    target_expense_id: expenseId,
    approve,
    target_approved_amount: Number(approvedAmount),
    target_note: note,
  });
  if (error) throw new Error("Expense decision could not be recorded");
}
export async function markExpensePaid(
  expenseId: string,
  documentId: string,
  note?: string,
) {
  const context = await requireFinanceContext(
    "finance.expenses.manage",
    "finance.expenses",
  );
  const { error } = await context.supabase.rpc("mark_expense_paid", {
    target_expense_id: expenseId,
    target_evidence_document_id: documentId,
    target_note: (note ?? null) as unknown as string,
  });
  if (error) throw new Error("Expense payment could not be recorded");
}
export async function completeExpense(expenseId: string, note?: string) {
  const context = await requireFinanceContext(
    "finance.expenses.manage",
    "finance.expenses",
  );
  const { error } = await context.supabase.rpc("complete_expense", {
    target_expense_id: expenseId,
    target_note: (note ?? null) as unknown as string,
  });
  if (error) throw new Error("Expense could not be completed");
}
export async function openCashier(openingCash: string) {
  const context = await requireFinanceContext(
    "finance.cashier.manage",
    "finance.cashier_control",
  );
  const { error } = await context.supabase.rpc("open_cashier_session", {
    target_organization_id: context.active.organizationId,
    target_school_id: context.active.schoolId!,
    target_opening_cash: Number(openingCash),
  });
  if (error) throw new Error("Cashier session could not be opened");
}
export async function closeCashier(
  sessionId: string,
  countedCash: string,
  note?: string,
) {
  const context = await requireFinanceContext(
    "finance.cashier.manage",
    "finance.cashier_control",
  );
  const { error } = await context.supabase.rpc("close_cashier_session", {
    target_session_id: sessionId,
    target_counted_cash: Number(countedCash),
    target_note: (note ?? null) as unknown as string,
  });
  if (error) throw new Error("Cashier session could not be closed");
}
export async function recordCashHandover(
  sessionId: string,
  amount: string,
  handedTo: string,
  note?: string,
) {
  const context = await requireFinanceContext(
    "finance.cashier.manage",
    "finance.cashier_control",
  );
  const { error } = await context.supabase.rpc("record_cash_handover", {
    target_cashier_session_id: sessionId,
    target_amount: Number(amount),
    target_handed_to: handedTo,
    target_note: (note ?? null) as unknown as string,
  });
  if (error) throw new Error("Cash handover could not be recorded");
}

export async function loadFinanceReports() {
  const context = await requireFinanceContext(
    "finance.reports.view",
    "finance.reporting",
  );
  const scope = {
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
  };
  const [
    studentBalances,
    collections,
    expenses,
    billingRuns,
    reconciliations,
    payments,
    incomeCategories,
    otherIncome,
  ] = await Promise.all([
    context.supabase
      .from("student_finance_balances")
      .select("student_id, outstanding_amount")
      .match(scope)
      .order("outstanding_amount", { ascending: false }),
    context.supabase
      .from("finance_collection_summary")
      .select("activity_date, method, currency_code, payment_count, amount")
      .match(scope)
      .order("activity_date", { ascending: false })
      .limit(100),
    context.supabase
      .from("finance_expense_summary")
      .select("expense_date, kind, currency_code, expense_count, amount")
      .match(scope)
      .order("expense_date", { ascending: false })
      .limit(100),
    context.supabase
      .from("billing_runs")
      .select("id, status, affected_students, expected_total, created_at")
      .match(scope)
      .order("created_at", { ascending: false })
      .limit(50),
    context.supabase
      .from("reconciliation_records")
      .select(
        "id, statement_date, method, expected_amount, actual_amount, variance, status, reference",
      )
      .match(scope)
      .order("statement_date", { ascending: false })
      .limit(50),
    context.supabase
      .from("payments")
      .select("id, amount, method, reference, paid_at")
      .match(scope)
      .eq("status", "verified")
      .order("paid_at", { ascending: false })
      .limit(100),
    context.supabase
      .from("income_categories")
      .select("id, code, name")
      .match(scope)
      .eq("status", "active")
      .order("name"),
    context.supabase
      .from("other_income")
      .select("id, amount, currency_code, received_at, payer_name, reference")
      .match(scope)
      .order("received_at", { ascending: false })
      .limit(100),
  ]);
  if (
    [
      studentBalances,
      collections,
      expenses,
      billingRuns,
      reconciliations,
      payments,
      incomeCategories,
      otherIncome,
    ].some((x) => x.error)
  )
    throw new Error("Finance reports could not be loaded");
  return {
    ...context,
    studentBalances: studentBalances.data ?? [],
    collections: collections.data ?? [],
    expenses: expenses.data ?? [],
    billingRuns: billingRuns.data ?? [],
    reconciliations: reconciliations.data ?? [],
    payments: payments.data ?? [],
    incomeCategories: incomeCategories.data ?? [],
    otherIncome: otherIncome.data ?? [],
  };
}

export async function createIncomeCategory(code: string, name: string) {
  const context = await requireFinanceContext(
    "finance.configure",
    "finance.expenses",
  );
  const { error } = await context.supabase.from("income_categories").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    code,
    name,
  });
  if (error) throw new Error("Income category could not be created");
}

export async function recordOtherIncome(
  input: z.infer<typeof otherIncomeSchema>,
) {
  const context = await requireFinanceContext(
    "finance.payments.record",
    "finance.expenses",
  );
  const { error } = await context.supabase.from("other_income").insert({
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
    income_category_id: input.incomeCategoryId,
    amount: Number(input.amount),
    received_at: input.receivedAt,
    payer_name: input.payerName,
    reference: input.reference ?? null,
    notes: input.notes ?? null,
    idempotency_key: input.idempotencyKey,
  });
  if (error) throw new Error("Other income could not be recorded");
}

export async function createReconciliation(input: {
  paymentId: string;
  statementDate: string;
  method: "cash" | "bank_transfer" | "pos" | "other";
  expectedAmount: string;
  actualAmount: string;
  reference?: string;
  note?: string;
}) {
  const context = await requireFinanceContext(
    "finance.reconcile",
    "finance.cashier_control",
  );
  const { data, error } = await context.supabase
    .from("reconciliation_records")
    .insert({
      organization_id: context.active.organizationId,
      school_id: context.active.schoolId!,
      statement_date: input.statementDate,
      method: input.method,
      expected_amount: Number(input.expectedAmount),
      actual_amount: Number(input.actualAmount),
      reference: input.reference ?? null,
      note: input.note ?? null,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("Reconciliation could not be created");
  const result = await context.supabase.rpc("reconcile_payments", {
    target_reconciliation_id: data.id,
    target_payment_ids: [input.paymentId],
  });
  if (result.error) throw new Error("Reconciliation could not be completed");
}
