"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  expenseDecisionSchema,
  expenseSchema,
  expensePaymentSchema,
  expenseCompletionSchema,
  financeCategorySchema,
} from "@/features/finance/schemas";
import {
  createExpense,
  createExpenseCategory,
  decideExpense,
  markExpensePaid,
  completeExpense,
} from "@/features/finance/service";
const path = "/finance/expenses";
export async function saveExpenseCategory(formData: FormData) {
  const p = financeCategorySchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+category`);
  try {
    await createExpenseCategory(p.data.code, p.data.name);
  } catch {
    redirect(`${path}?error=Category+could+not+be+created`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Expense+category+created`);
}
export async function payExpense(formData: FormData) {
  const p = expensePaymentSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Select+valid+payment+evidence`);
  try {
    await markExpensePaid(p.data.expenseId, p.data.documentId, p.data.note);
  } catch {
    redirect(`${path}?error=Expense+payment+could+not+be+recorded`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Expense+marked+paid`);
}
export async function finishExpense(formData: FormData) {
  const p = expenseCompletionSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Invalid+expense`);
  try {
    await completeExpense(p.data.expenseId, p.data.note);
  } catch {
    redirect(`${path}?error=Expense+could+not+be+completed`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Expense+completed`);
}
export async function saveExpense(formData: FormData) {
  const p = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+expense+details`);
  try {
    await createExpense(p.data);
  } catch {
    redirect(`${path}?error=Expense+could+not+be+submitted`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Expense+submitted`);
}
export async function reviewExpense(formData: FormData) {
  const p = expenseDecisionSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+decision`);
  try {
    await decideExpense(
      p.data.expenseId,
      p.data.approve,
      p.data.approvedAmount,
      p.data.note,
    );
  } catch {
    redirect(`${path}?error=Expense+decision+could+not+be+recorded`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Expense+decision+recorded`);
}
