"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  assessmentComponentSchema,
  assessmentSchemeSchema,
  gradeBandSchema,
  resultBatchSchema,
  resultTransitionSchema,
  scoreSchema,
} from "@/features/assessments/schemas";
import {
  activateScheme,
  createAssessmentComponent,
  createAssessmentScheme,
  createGradeBand,
  createResultBatch,
  transitionBatch,
  saveScore,
} from "@/features/assessments/service";

async function finish(task: () => Promise<void>, success: string) {
  try {
    await task();
  } catch {
    redirect(
      "/assessments?error=The+assessment+operation+could+not+be+completed",
    );
  }
  revalidatePath("/assessments");
  redirect(`/assessments?message=${encodeURIComponent(success)}`);
}

export async function saveScheme(formData: FormData) {
  const parsed = assessmentSchemeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect("/assessments?error=Check+the+assessment+scheme+details");
  await finish(
    () => createAssessmentScheme(parsed.data),
    "Assessment scheme created",
  );
}

export async function saveComponent(formData: FormData) {
  const parsed = assessmentComponentSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success)
    redirect("/assessments?error=Check+the+component+details");
  await finish(
    () => createAssessmentComponent(parsed.data),
    "Assessment component created",
  );
}

export async function saveGradeBand(formData: FormData) {
  const parsed = gradeBandSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect("/assessments?error=Check+the+grade+band+details");
  await finish(() => createGradeBand(parsed.data), "Grade band created");
}

export async function activateAssessmentScheme(formData: FormData) {
  const id = String(formData.get("schemeId") ?? "");
  await finish(() => activateScheme(id), "Assessment scheme activated");
}

export async function saveResultBatch(formData: FormData) {
  const parsed = resultBatchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    redirect("/assessments?error=Check+the+score+sheet+details");
  await finish(() => createResultBatch(parsed.data), "Score sheet created");
}

export async function advanceResultBatch(formData: FormData) {
  const parsed = resultTransitionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/assessments?error=Invalid+result+transition");
  await finish(
    () => transitionBatch(parsed.data.batchId, parsed.data.status),
    `Result ${parsed.data.status}`,
  );
}

export async function saveAssessmentScore(formData: FormData) {
  const parsed = scoreSchema.safeParse(Object.fromEntries(formData));
  const back = `/assessments/${String(formData.get("batchId") ?? "")}`;
  if (!parsed.success) redirect(`${back}?error=Check+the+score`);
  try {
    await saveScore(parsed.data);
  } catch {
    redirect(`${back}?error=Score+could+not+be+saved`);
  }
  revalidatePath(back);
  redirect(`${back}?message=Score+saved`);
}
