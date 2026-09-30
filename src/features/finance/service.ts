import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import type { FeeCategoryInput, FeeStructureInput } from "./schemas";

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
