import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import type { z } from "zod";
import {
  admissionDocumentInitializeSchema,
  admissionDocumentPolicySchema,
  admissionDocumentReviewSchema,
  admissionDocumentSubmitSchema,
  checklistSchema,
  enrollmentConversionSchema,
  offerResponseSchema,
} from "./schemas";

export async function requireAdmissionsContext(
  permission = "admissions.view",
  feature = "admissions.application_workflow",
) {
  const authorization = await requireCapability({
    permission,
    module: "admissions",
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

export async function loadAdmissions(query = "", status?: string, page = 1) {
  const context = await requireAdmissionsContext();
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  let request = context.supabase
    .from("admission_applications")
    .select(
      "id, application_number, status, source, created_at, applicant:people!admission_applications_applicant_person_id_fkey(first_name,last_name), academic_sessions(name), class_levels(name)",
      { count: "exact" },
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (query) request = request.ilike("application_number", `%${query}%`);
  if (status) request = request.eq("status", status as never);
  const { data, error, count } = await request;
  if (error) throw new Error("Admissions could not be loaded");
  return {
    ...context,
    applications: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
    query,
    status,
  };
}

export async function loadAdmissionOptions(permission = "admissions.manage") {
  const context = await requireAdmissionsContext(permission);
  const [sessions, levels, arms] = await Promise.all([
    context.supabase
      .from("academic_sessions")
      .select("id,name,start_date,end_date,status")
      .eq("school_id", context.active.schoolId!)
      .in("status", ["current", "planned"])
      .order("start_date", { ascending: false }),
    context.supabase
      .from("class_levels")
      .select("id,name")
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
    context.supabase
      .from("class_arms")
      .select("id,name,class_level_id")
      .eq("school_id", context.active.schoolId!)
      .eq("status", "active")
      .order("sort_order"),
  ]);
  if (sessions.error || levels.error || arms.error)
    throw new Error("Admissions configuration could not be loaded");
  return {
    ...context,
    sessions: sessions.data ?? [],
    levels: levels.data ?? [],
    arms: arms.data ?? [],
  };
}

export async function loadAdmission(applicationId: string) {
  const context = await requireAdmissionsContext();
  const application = await context.supabase
    .from("admission_applications")
    .select(
      "*, applicant:people!admission_applications_applicant_person_id_fkey(first_name,last_name,preferred_name), academic_sessions(name), class_levels(name)",
    )
    .eq("id", applicationId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (application.error || !application.data)
    throw new Error("Admission record is unavailable");

  const [
    guardians,
    assessments,
    decisions,
    offer,
    checklist,
    documentRequirements,
    admissionDocuments,
    options,
    enrolledStudent,
  ] = await Promise.all([
    context.supabase
      .from("admission_guardians")
      .select(
        "*, guardian:people!admission_guardians_guardian_person_id_fkey(first_name,last_name)",
      )
      .eq("application_id", applicationId)
      .order("created_at"),
    context.supabase
      .from("entrance_assessment_attempts")
      .select("*")
      .eq("application_id", applicationId)
      .order("attempt_number", { ascending: false }),
    context.supabase
      .from("admission_decisions")
      .select("*, class_levels(name)")
      .eq("application_id", applicationId)
      .order("decided_at", { ascending: false }),
    context.supabase
      .from("admission_offers")
      .select(
        "*, academic_sessions(name), class_levels(name), class_arms(name)",
      )
      .eq("application_id", applicationId)
      .maybeSingle(),
    context.supabase
      .from("admission_checklist_items")
      .select("*")
      .eq("application_id", applicationId)
      .order("label"),
    context.supabase
      .from("admission_application_documents")
      .select("*, documents(id,title,original_filename,status)")
      .eq("application_id", applicationId)
      .order("label"),
    context.supabase
      .from("documents")
      .select("id,title,original_filename,status")
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .eq("entity_type", "admission_application")
      .eq("entity_id", applicationId)
      .eq("status", "available")
      .order("created_at", { ascending: false }),
    loadAdmissionOptions("admissions.view"),
    application.data.enrolled_student_id
      ? context.supabase
          .from("student_profiles")
          .select("id,student_number")
          .eq("id", application.data.enrolled_student_id)
          .eq("organization_id", context.active.organizationId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (
    guardians.error ||
    assessments.error ||
    decisions.error ||
    offer.error ||
    checklist.error ||
    documentRequirements.error ||
    admissionDocuments.error ||
    enrolledStudent.error
  )
    throw new Error("Admission record is unavailable");
  return {
    ...context,
    application: {
      ...application.data,
      student_profiles: enrolledStudent.data,
    },
    guardians: guardians.data ?? [],
    assessments: assessments.data ?? [],
    decisions: decisions.data ?? [],
    offer: offer.data,
    checklist: checklist.data ?? [],
    documentRequirements: documentRequirements.data ?? [],
    admissionDocuments: admissionDocuments.data ?? [],
    sessions: options.sessions,
    levels: options.levels,
    arms: options.arms,
  };
}

export async function loadAdmissionDocumentPolicy() {
  const context = await requireAdmissionsContext();
  const result = await context.supabase
    .from("admission_document_policies")
    .select(
      "id,category_key,label,required,enabled,not_applicable_allowed,version,updated_at",
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .order("label");
  if (result.error) throw new Error("Document policy could not be loaded");
  return { ...context, policies: result.data ?? [] };
}

export async function configureAdmissionDocumentPolicy(
  input: z.infer<typeof admissionDocumentPolicySchema>,
) {
  const context = await requireAdmissionsContext(
    "admissions.documents.configure",
  );
  const { error } = await context.supabase.rpc(
    "configure_admission_document_policy",
    {
      target_school_id: context.active.schoolId!,
      target_category_key: input.categoryKey,
      target_label: input.label,
      target_required: input.required,
      target_enabled: input.enabled,
    },
  );
  if (error) throw new Error("Document policy could not be updated");
}

export async function initializeAdmissionDocumentRequirements(
  input: z.infer<typeof admissionDocumentInitializeSchema>,
) {
  const context = await requireAdmissionsContext(
    "admissions.documents.configure",
  );
  const application = await context.supabase
    .from("admission_applications")
    .select("id")
    .eq("id", input.applicationId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (application.error || !application.data)
    throw new Error("Application is unavailable");
  const { error } = await context.supabase.rpc(
    "initialize_admission_document_requirements",
    {
      target_application_id: input.applicationId,
    },
  );
  if (error) throw new Error("Requirements could not be initialized");
}

export async function submitAdmissionDocument(
  input: z.infer<typeof admissionDocumentSubmitSchema>,
) {
  const context = await requireAdmissionsContext("admissions.documents.submit");
  const requirement = await context.supabase
    .from("admission_application_documents")
    .select("id")
    .eq("id", input.requirementId)
    .eq("application_id", input.applicationId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (requirement.error || !requirement.data)
    throw new Error("Requirement is unavailable");
  const { error } = await context.supabase.rpc("submit_admission_document", {
    target_requirement_id: input.requirementId,
    target_document_id: input.documentId,
  });
  if (error) throw new Error("Evidence could not be submitted");
}

export async function reviewAdmissionDocument(
  input: z.infer<typeof admissionDocumentReviewSchema>,
) {
  const context = await requireAdmissionsContext("admissions.documents.review");
  const requirement = await context.supabase
    .from("admission_application_documents")
    .select("id")
    .eq("id", input.requirementId)
    .eq("application_id", input.applicationId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (requirement.error || !requirement.data)
    throw new Error("Requirement is unavailable");
  const { error } = await context.supabase.rpc("review_admission_document", {
    target_requirement_id: input.requirementId,
    target_status: input.status,
    target_comment: input.comment,
  });
  if (error) throw new Error("Review could not be recorded");
}

export async function recordAdmissionOfferResponse(
  response: z.infer<typeof offerResponseSchema>,
) {
  const context = await requireAdmissionsContext("admissions.manage");
  const [application, offer] = await Promise.all([
    context.supabase
      .from("admission_applications")
      .select("id,status")
      .eq("id", response.applicationId)
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .maybeSingle(),
    context.supabase
      .from("admission_offers")
      .select("status,expires_at")
      .eq("application_id", response.applicationId)
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .maybeSingle(),
  ]);
  const expired =
    offer.data?.expires_at !== null &&
    offer.data?.expires_at !== undefined &&
    new Date(offer.data.expires_at).getTime() <= Date.now();
  if (
    application.error ||
    !application.data ||
    application.data.status !== "admission_offered" ||
    offer.error ||
    !offer.data ||
    offer.data.status !== "issued" ||
    expired
  )
    throw new Error("Offer is unavailable");

  const { error } = await context.supabase.rpc("respond_to_admission_offer", {
    target_application_id: response.applicationId,
    accept_offer: response.response === "accept",
  });
  if (error) throw new Error("Offer is unavailable");
}

export async function updateAdmissionChecklistItem(
  update: z.infer<typeof checklistSchema>,
) {
  const context = await requireAdmissionsContext("admissions.enroll");
  const item = await context.supabase
    .from("admission_checklist_items")
    .select("id,application_id")
    .eq("id", update.itemId)
    .eq("application_id", update.applicationId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (item.error || !item.data)
    throw new Error("Checklist item is unavailable");

  const { error } = await context.supabase.rpc("set_admission_checklist_item", {
    target_item_id: update.itemId,
    target_status: update.status,
  });
  if (error) throw new Error("Checklist item is unavailable");
}

export type AdmissionConversionFailure = {
  stage: "context_resolution" | "rpc_invocation" | "rpc_response";
  category:
    | "authentication_authorization_or_context_rejected"
    | "rpc_invocation_failed"
    | "rpc_business_rule_rejected"
    | "rpc_constraint_rejected"
    | "rpc_transaction_failed"
    | "rpc_transport_failed"
    | "rpc_returned_error"
    | "rpc_invalid_result";
  rpcInvoked: boolean;
  rpcReturnedError: boolean;
  rpcCode?: string;
};

export class AdmissionConversionError extends Error {
  constructor(public readonly diagnostic: AdmissionConversionFailure) {
    super("Application is unavailable for enrollment");
    this.name = "AdmissionConversionError";
  }
}

function safeRpcCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error))
    return undefined;
  const code = Reflect.get(error, "code");
  if (typeof code !== "string") return undefined;
  return /^(?:[0-9A-Z]{5}|PGRST[0-9A-Z]{3})$/.test(code) ? code : undefined;
}

function categorizeRpcError(code: string | undefined) {
  if (code === "22023" || code === "42501" || code === "P0001")
    return "rpc_business_rule_rejected" as const;
  if (code?.startsWith("23")) return "rpc_constraint_rejected" as const;
  if (code?.startsWith("40")) return "rpc_transaction_failed" as const;
  if (code?.startsWith("08") || code?.startsWith("PGRST"))
    return "rpc_transport_failed" as const;
  return "rpc_returned_error" as const;
}

export async function convertAdmissionToStudent(
  input: z.infer<typeof enrollmentConversionSchema>,
) {
  let context: Awaited<ReturnType<typeof requireAdmissionsContext>>;
  try {
    context = await requireAdmissionsContext("admissions.enroll");
  } catch {
    throw new AdmissionConversionError({
      stage: "context_resolution",
      category: "authentication_authorization_or_context_rejected",
      rpcInvoked: false,
      rpcReturnedError: false,
    });
  }

  let result: Awaited<
    ReturnType<typeof context.supabase.rpc<"convert_admission_to_student">>
  >;
  try {
    result = await context.supabase.rpc("convert_admission_to_student", {
      target_application_id: input.applicationId,
      target_student_number: input.studentNumber,
      enrollment_date: input.enrolledOn,
    });
  } catch {
    throw new AdmissionConversionError({
      stage: "rpc_invocation",
      category: "rpc_invocation_failed",
      rpcInvoked: true,
      rpcReturnedError: false,
    });
  }

  const { data, error } = result;
  if (error) {
    const rpcCode = safeRpcCode(error);
    throw new AdmissionConversionError({
      stage: "rpc_response",
      category: categorizeRpcError(rpcCode),
      rpcInvoked: true,
      rpcReturnedError: true,
      ...(rpcCode ? { rpcCode } : {}),
    });
  }
  if (!data)
    throw new AdmissionConversionError({
      stage: "rpc_response",
      category: "rpc_invalid_result",
      rpcInvoked: true,
      rpcReturnedError: false,
    });
  return data;
}
