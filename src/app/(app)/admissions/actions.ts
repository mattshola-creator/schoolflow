"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  admissionApplicationSchema,
  assessmentSchema,
  decisionSchema,
  offerSchema,
  statusTransitionSchema,
} from "@/features/admissions/schemas";
import { requireAdmissionsContext } from "@/features/admissions/service";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createAdmissionApplication(formData: FormData) {
  const parsed = admissionApplicationSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success)
    fail("/admissions/new", "Check the application details and try again");
  const { supabase, active } =
    await requireAdmissionsContext("admissions.manage");
  const { data, error } = await supabase.rpc("create_admission_application", {
    target_organization_id: active.organizationId,
    target_school_id: active.schoolId!,
    target_session_id: parsed.data.sessionId,
    target_level_id: parsed.data.levelId,
    target_application_number: parsed.data.applicationNumber,
    applicant_first_name: parsed.data.firstName,
    applicant_last_name: parsed.data.lastName,
    applicant_date_of_birth: parsed.data.dateOfBirth,
    applicant_gender: parsed.data.gender,
    application_source: parsed.data.source,
    previous_class_name: parsed.data.previousClass,
    guardian_first_name: parsed.data.guardianFirstName,
    guardian_last_name: parsed.data.guardianLastName,
    guardian_relationship: parsed.data.guardianRelationship,
    guardian_email: parsed.data.guardianEmail,
    guardian_phone: parsed.data.guardianPhone,
  });
  if (error || !data)
    fail("/admissions/new", "The application could not be created");
  redirect(`/admissions/${data}?message=Application+created`);
}

export async function transitionAdmission(formData: FormData) {
  const parsed = statusTransitionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail("/admissions", "Invalid status change");
  const { supabase } = await requireAdmissionsContext("admissions.manage");
  const { error } = await supabase.rpc("transition_admission_application", {
    target_application_id: parsed.data.applicationId,
    target_status: parsed.data.status,
  });
  if (error)
    fail(
      `/admissions/${parsed.data.applicationId}`,
      "That status change is not allowed",
    );
  revalidatePath(`/admissions/${parsed.data.applicationId}`);
}

export async function recordAssessment(formData: FormData) {
  const parsed = assessmentSchema.safeParse(Object.fromEntries(formData));
  const id = String(formData.get("applicationId") ?? "");
  if (!parsed.success)
    fail(`/admissions/${id}`, "Check the assessment details");
  const { supabase } = await requireAdmissionsContext("admissions.assess");
  const { error } = await supabase.rpc("record_entrance_assessment", {
    target_application_id: parsed.data.applicationId,
    target_scheduled_at: parsed.data.scheduledAt,
    target_score: parsed.data.score,
    target_maximum_score: parsed.data.maximumScore,
    target_notes: parsed.data.notes,
  });
  if (error)
    fail(
      `/admissions/${parsed.data.applicationId}`,
      "The assessment could not be recorded",
    );
  revalidatePath(`/admissions/${parsed.data.applicationId}`);
}

export async function recordDecision(formData: FormData) {
  const parsed = decisionSchema.safeParse(Object.fromEntries(formData));
  const id = String(formData.get("applicationId") ?? "");
  if (!parsed.success) fail(`/admissions/${id}`, "Check the decision details");
  const { supabase } = await requireAdmissionsContext("admissions.decide");
  const { error } = await supabase.rpc("record_admission_decision", {
    target_application_id: parsed.data.applicationId,
    target_decision: parsed.data.decision,
    target_level_id: parsed.data.levelId ?? (null as never),
    target_rationale: parsed.data.rationale,
  });
  if (error)
    fail(
      `/admissions/${parsed.data.applicationId}`,
      "The decision could not be recorded",
    );
  revalidatePath(`/admissions/${parsed.data.applicationId}`);
}

export async function issueOffer(formData: FormData) {
  const parsed = offerSchema.safeParse(Object.fromEntries(formData));
  const id = String(formData.get("applicationId") ?? "");
  if (!parsed.success) fail(`/admissions/${id}`, "Check the offer details");
  const { supabase } = await requireAdmissionsContext("admissions.decide");
  const { error } = await supabase.rpc("issue_admission_offer", {
    target_application_id: parsed.data.applicationId,
    target_session_id: parsed.data.sessionId,
    target_level_id: parsed.data.levelId,
    target_arm_id: parsed.data.armId ?? (null as never),
    target_expires_at: parsed.data.expiresAt,
  });
  if (error)
    fail(
      `/admissions/${parsed.data.applicationId}`,
      "The offer could not be issued",
    );
  revalidatePath(`/admissions/${parsed.data.applicationId}`);
}
