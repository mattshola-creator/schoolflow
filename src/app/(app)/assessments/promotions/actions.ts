"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { promotionSchema } from "@/features/assessments/schemas";
import { promoteStudent, PromotionError } from "@/features/assessments/service";
import { AuthorizationError } from "@/lib/authorization";

export async function recordStudentPromotion(formData: FormData) {
  const input = promotionSchema.safeParse(Object.fromEntries(formData));
  if (!input.success)
    redirect("/assessments/promotions?error=Check+the+promotion+details");
  try {
    await promoteStudent(input.data);
  } catch (error) {
    if (error instanceof AuthorizationError)
      redirect(
        "/assessments/promotions?error=Promotion+is+unavailable+in+this+workspace",
      );
    if (error instanceof PromotionError)
      redirect(
        "/assessments/promotions?error=Promotion+could+not+be+recorded.+Check+published+results,+academic+locks+and+target+placement.",
      );
    throw error;
  }
  revalidatePath("/assessments/promotions");
  revalidatePath("/students");
  revalidatePath("/management");
  redirect("/assessments/promotions?message=Promotion+recorded");
}
