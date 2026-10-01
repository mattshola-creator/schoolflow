"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  financeCategorySchema,
  otherIncomeSchema,
  reconciliationSchema,
} from "@/features/finance/schemas";
import {
  createIncomeCategory,
  createReconciliation,
  recordOtherIncome,
} from "@/features/finance/service";
export async function reconcile(formData: FormData) {
  const p = reconciliationSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect("/finance/reports?error=Check+the+reconciliation");
  try {
    await createReconciliation(p.data);
  } catch {
    redirect("/finance/reports?error=Reconciliation+was+rejected");
  }
  revalidatePath("/finance/reports");
  redirect("/finance/reports?message=Reconciliation+recorded");
}
export async function saveIncomeCategory(formData: FormData) {
  const p = financeCategorySchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect("/finance/reports?error=Check+the+income+category");
  try {
    await createIncomeCategory(p.data.code, p.data.name);
  } catch {
    redirect("/finance/reports?error=Income+category+could+not+be+created");
  }
  revalidatePath("/finance/reports");
  redirect("/finance/reports?message=Income+category+created");
}
export async function saveOtherIncome(formData: FormData) {
  const p = otherIncomeSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect("/finance/reports?error=Check+the+income+details");
  try {
    await recordOtherIncome(p.data);
  } catch {
    redirect("/finance/reports?error=Other+income+could+not+be+recorded");
  }
  revalidatePath("/finance/reports");
  redirect("/finance/reports?message=Other+income+recorded");
}
