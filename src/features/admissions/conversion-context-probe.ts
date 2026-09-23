import { evaluateAccess } from "@/features/authorization/evaluator";
import type { requireAdmissionsContext } from "@/features/admissions/service";

export type ConversionProbeStage =
  | "context_resolved"
  | "student_authorization_denied"
  | "application_unavailable"
  | "readiness_query_failed"
  | "pre_rpc_context_complete";

export type ConversionProbeResult = {
  stage: ConversionProbeStage;
  checks: {
    applicationAccepted: boolean;
    applicationUnconverted: boolean;
    offerAccepted: boolean;
    mandatoryChecklistPending: number;
    requiredDocumentsUnsatisfied: number;
    guardianCount: number;
    studentProfiles: number;
    enrollments: number;
    classMemberships: number;
    guardianRelationships: number;
  };
};

export class ConversionProbeError extends Error {
  constructor(public readonly stage: ConversionProbeStage) {
    super("Conversion context probe failed");
  }
}

type AdmissionsContext = Awaited<ReturnType<typeof requireAdmissionsContext>>;

export async function readConversionContext(
  context: AdmissionsContext,
  applicationId: string,
): Promise<ConversionProbeResult> {
  const studentAccess = evaluateAccess(context.authorization, {
    permission: "students.manage",
    module: "students",
  });
  if (!studentAccess.allowed)
    throw new ConversionProbeError("student_authorization_denied");

  const application = await context.supabase
    .from("admission_applications")
    .select("id,status,enrolled_student_id,applicant_person_id")
    .eq("id", applicationId)
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .maybeSingle();
  if (application.error || !application.data)
    throw new ConversionProbeError("application_unavailable");

  const [offer, checklist, documents, guardians, students] = await Promise.all([
    context.supabase
      .from("admission_offers")
      .select(
        "status,academic_session_id,offered_class_level_id,offered_class_arm_id",
      )
      .eq("application_id", applicationId)
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!)
      .maybeSingle(),
    context.supabase
      .from("admission_checklist_items")
      .select("required,status")
      .eq("application_id", applicationId)
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!),
    context.supabase
      .from("admission_application_documents")
      .select("required,status")
      .eq("application_id", applicationId)
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!),
    context.supabase
      .from("admission_guardians")
      .select("id", { count: "exact", head: true })
      .eq("application_id", applicationId)
      .eq("organization_id", context.active.organizationId)
      .eq("school_id", context.active.schoolId!),
    context.supabase
      .from("student_profiles")
      .select("id")
      .eq("organization_id", context.active.organizationId)
      .eq("person_id", application.data.applicant_person_id),
  ]);
  if (
    offer.error ||
    checklist.error ||
    documents.error ||
    guardians.error ||
    students.error
  )
    throw new ConversionProbeError("readiness_query_failed");

  const studentIds = (students.data ?? []).map((student) => student.id);
  let enrollments = 0;
  let classMemberships = 0;
  let guardianRelationships = 0;
  if (studentIds.length > 0) {
    const [enrollmentResult, membershipResult, relationshipResult] =
      await Promise.all([
        context.supabase
          .from("student_enrollments")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", context.active.organizationId)
          .eq("school_id", context.active.schoolId!)
          .in("student_id", studentIds),
        context.supabase
          .from("class_memberships")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", context.active.organizationId)
          .eq("school_id", context.active.schoolId!)
          .in("student_id", studentIds),
        context.supabase
          .from("guardian_relationships")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", context.active.organizationId)
          .in("student_id", studentIds),
      ]);
    if (
      enrollmentResult.error ||
      membershipResult.error ||
      relationshipResult.error
    )
      throw new ConversionProbeError("readiness_query_failed");
    enrollments = enrollmentResult.count ?? 0;
    classMemberships = membershipResult.count ?? 0;
    guardianRelationships = relationshipResult.count ?? 0;
  }

  return {
    stage: "pre_rpc_context_complete",
    checks: {
      applicationAccepted: application.data.status === "accepted",
      applicationUnconverted: application.data.enrolled_student_id === null,
      offerAccepted: offer.data?.status === "accepted",
      mandatoryChecklistPending: (checklist.data ?? []).filter(
        (item) =>
          item.required && !["complete", "waived"].includes(item.status),
      ).length,
      requiredDocumentsUnsatisfied: (documents.data ?? []).filter(
        (document) =>
          document.required &&
          !["verified", "not_applicable"].includes(document.status),
      ).length,
      guardianCount: guardians.count ?? 0,
      studentProfiles: studentIds.length,
      enrollments,
      classMemberships,
      guardianRelationships,
    },
  };
}
