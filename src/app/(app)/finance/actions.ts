"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  billingRunSchema,
  feeCategorySchema,
  feeStructureSchema,
  structureActionSchema,
} from "@/features/finance/schemas";
import {
  activateFeeStructure,
  createFeeCategory,
  createFeeStructure,
  generateBillingRun,
} from "@/features/finance/service";

export async function saveFeeCategory(formData: FormData) {
  const parsed = feeCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect("/finance?error=Check+the+fee+category+details");
  try {
    await createFeeCategory(parsed.data);
  } catch {
    redirect("/finance?error=The+fee+category+could+not+be+created");
  }
  revalidatePath("/finance");
  redirect("/finance?message=Fee+category+created");
}

export async function saveFeeStructure(formData: FormData) {
  const parsed = feeStructureSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect("/finance?error=Check+the+fee+structure+details");
  try {
    await createFeeStructure(parsed.data);
  } catch {
    redirect("/finance?error=The+fee+structure+could+not+be+created");
  }
  revalidatePath("/finance");
  redirect("/finance?message=Fee+structure+created");
}

export async function activateStructure(formData: FormData) {
  const parsed = structureActionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/finance?error=Invalid+fee+structure");
  try {
    await activateFeeStructure(parsed.data.structureId);
  } catch {
    redirect("/finance?error=Fee+structure+could+not+be+activated");
  }
  revalidatePath("/finance");
  redirect("/finance?message=Fee+structure+activated");
}

export async function runBilling(formData: FormData) {
  const parsed = billingRunSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/finance?error=Invalid+billing+request");
  try {
    await generateBillingRun(
      parsed.data.structureId,
      parsed.data.idempotencyKey,
    );
  } catch {
    redirect("/finance?error=Billing+run+could+not+be+generated");
  }
  revalidatePath("/finance");
  redirect("/finance?message=Student+charges+generated");
}
