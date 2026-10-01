"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  allocationSchema,
  cashierCloseSchema,
  cashHandoverSchema,
  cashierOpenSchema,
  paymentDecisionSchema,
  paymentSchema,
  paymentReversalSchema,
  receiptSchema,
} from "@/features/finance/schemas";
import {
  allocatePayment,
  closeCashier,
  decidePayment,
  issueReceipt,
  openCashier,
  recordPayment,
  recordCashHandover,
  reversePayment,
} from "@/features/finance/service";
const path = "/finance/payments";
export async function savePayment(formData: FormData) {
  const p = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+payment+details`);
  try {
    await recordPayment(p.data);
  } catch {
    redirect(`${path}?error=Payment+could+not+be+recorded`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Payment+recorded`);
}
export async function handoverCash(formData: FormData) {
  const p = cashHandoverSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+cash+handover`);
  try {
    await recordCashHandover(
      p.data.sessionId,
      p.data.amount,
      p.data.handedTo,
      p.data.note,
    );
  } catch {
    redirect(`${path}?error=Cash+handover+could+not+be+recorded`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Cash+handover+recorded`);
}
export async function reverseRecordedPayment(formData: FormData) {
  const p = paymentReversalSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+reversal+reason`);
  try {
    await reversePayment(p.data.paymentId, p.data.reason);
  } catch {
    redirect(`${path}?error=Payment+could+not+be+reversed`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Payment+reversed+with+an+audit+trail`);
}
export async function verifyPayment(formData: FormData) {
  const p = paymentDecisionSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+verification+details`);
  try {
    await decidePayment(p.data.paymentId, p.data.approve, p.data.note);
  } catch {
    redirect(`${path}?error=Payment+could+not+be+verified`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Payment+decision+recorded`);
}
export async function allocate(formData: FormData) {
  const p = allocationSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+allocation`);
  try {
    await allocatePayment(p.data.paymentId, p.data.chargeId, p.data.amount);
  } catch {
    redirect(`${path}?error=Allocation+was+rejected`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Payment+allocated`);
}
export async function makeReceipt(formData: FormData) {
  const p = receiptSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Invalid+payment`);
  try {
    await issueReceipt(p.data.paymentId);
  } catch {
    redirect(`${path}?error=Receipt+could+not+be+issued`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Receipt+issued`);
}
export async function startCashier(formData: FormData) {
  const p = cashierOpenSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+opening+cash`);
  try {
    await openCashier(p.data.openingCash);
  } catch {
    redirect(`${path}?error=Cashier+session+could+not+be+opened`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Cashier+session+opened`);
}
export async function endCashier(formData: FormData) {
  const p = cashierCloseSchema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect(`${path}?error=Check+the+cashier+close`);
  try {
    await closeCashier(p.data.sessionId, p.data.countedCash, p.data.note);
  } catch {
    redirect(`${path}?error=Cashier+session+could+not+be+closed`);
  }
  revalidatePath(path);
  redirect(`${path}?message=Cashier+session+closed`);
}
