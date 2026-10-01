"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  academicCloseSchema,
  sessionRolloverSchema,
} from "@/features/reporting/schemas";
import {
  closeAcademicTarget,
  prepareSessionRollover,
} from "@/features/reporting/service";

export async function closeAcademic(formData: FormData) {
  const parsed = academicCloseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/management?error=Check+the+close+request");
  try {
    await closeAcademicTarget(
      parsed.data.targetKind,
      parsed.data.targetId,
      parsed.data.reason,
    );
  } catch {
    redirect("/management?error=Academic+close+was+rejected");
  }
  revalidatePath("/management");
  redirect("/management?message=Academic+period+closed");
}

export async function rolloverSession(formData: FormData) {
  const parsed = sessionRolloverSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/management?error=Check+the+rollover+request");
  try {
    await prepareSessionRollover(parsed.data);
  } catch {
    redirect("/management?error=Session+rollover+was+rejected");
  }
  revalidatePath("/management");
  redirect("/management?message=Draft+session+rollover+prepared");
}
