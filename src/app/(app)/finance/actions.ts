"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  feeCategorySchema,
  feeStructureSchema,
} from "@/features/finance/schemas";
import {
  createFeeCategory,
  createFeeStructure,
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
