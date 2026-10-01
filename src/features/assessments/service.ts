import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import type {
  AssessmentSchemeInput,
  PromotionInput,
  ScoreInput,
} from "./schemas";
import type { z } from "zod";
import type { resultBatchSchema } from "./schemas";

type BatchInput = z.infer<typeof resultBatchSchema>;

export async function requireAssessmentContext(
  permission = "academics.scores.view",
  feature = "academics.score_entry",
) {
  const authorization = await requireCapability({
    permission,
    module: "academics",
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

export async function loadAssessmentWorkspace() {
  const context = await requireAssessmentContext();
  const scope = {
    organization_id: context.active.organizationId,
    school_id: context.active.schoolId!,
  };
  const [sessions, periods, levels, arms, subjects, schemes, batches] =
    await Promise.all([
      context.supabase
        .from("academic_sessions")
        .select("id,name,status")
        .match(scope)
        .order("start_date", { ascending: false }),
      context.supabase
        .from("academic_periods")
        .select("id,session_id,name,status")
        .match(scope)
        .order("sequence"),
      context.supabase
        .from("class_levels")
        .select("id,name")
        .match(scope)
        .eq("status", "active")
        .order("sort_order"),
      context.supabase
        .from("class_arms")
        .select("id,class_level_id,name")
        .match(scope)
        .eq("status", "active")
        .order("sort_order"),
      context.supabase
        .from("subjects")
        .select("id,name")
        .match(scope)
        .eq("status", "active")
        .order("sort_order"),
      context.supabase
        .from("assessment_schemes")
        .select(
          "id,name,version,status,total_mark,pass_mark,session_id,period_id,class_level_id,subject_id,assessment_components(id,code,name,maximum_score,weight_percent,sequence),grade_bands(id,minimum_percent,maximum_percent,grade,remark,is_pass,sequence)",
        )
        .match(scope)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("result_batches")
        .select(
          "id,status,version,session_id,period_id,class_level_id,class_arm_id,subject_id,scheme_id,submitted_at,reviewed_at,approved_at,published_at",
        )
        .match(scope)
        .order("created_at", { ascending: false }),
    ]);
  for (const result of [
    sessions,
    periods,
    levels,
    arms,
    subjects,
    schemes,
    batches,
  ])
    if (result.error)
      throw new Error("Assessment workspace could not be loaded");
  return {
    ...context,
    sessions: sessions.data ?? [],
    periods: periods.data ?? [],
    levels: levels.data ?? [],
    arms: arms.data ?? [],
    subjects: subjects.data ?? [],
    schemes: schemes.data ?? [],
    batches: batches.data ?? [],
  };
}

export async function createAssessmentScheme(input: AssessmentSchemeInput) {
  const c = await requireAssessmentContext(
    "academics.assessments.configure",
    "academics.assessment_configuration",
  );
  const { error } = await c.supabase.from("assessment_schemes").insert({
    organization_id: c.active.organizationId,
    school_id: c.active.schoolId!,
    session_id: input.sessionId,
    period_id: input.periodId,
    class_level_id: input.classLevelId,
    subject_id: input.subjectId ?? null,
    name: input.name,
    total_mark: input.totalMark,
    pass_mark: input.passMark,
  });
  if (error) throw new Error("Assessment scheme could not be created");
}

export async function createAssessmentComponent(input: {
  schemeId: string;
  code: string;
  name: string;
  maximumScore: number;
  weightPercent: number;
  sequence: number;
}) {
  const c = await requireAssessmentContext(
    "academics.assessments.configure",
    "academics.assessment_configuration",
  );
  const { error } = await c.supabase.from("assessment_components").insert({
    organization_id: c.active.organizationId,
    school_id: c.active.schoolId!,
    scheme_id: input.schemeId,
    code: input.code,
    name: input.name,
    maximum_score: input.maximumScore,
    weight_percent: input.weightPercent,
    sequence: input.sequence,
  });
  if (error) throw new Error("Assessment component could not be created");
}

export async function createGradeBand(input: {
  schemeId: string;
  minimumPercent: number;
  maximumPercent: number;
  grade: string;
  remark: string;
  isPass: boolean;
  sequence: number;
}) {
  const c = await requireAssessmentContext(
    "academics.assessments.configure",
    "academics.assessment_configuration",
  );
  const { error } = await c.supabase.from("grade_bands").insert({
    organization_id: c.active.organizationId,
    school_id: c.active.schoolId!,
    scheme_id: input.schemeId,
    minimum_percent: input.minimumPercent,
    maximum_percent: input.maximumPercent,
    grade: input.grade,
    remark: input.remark,
    is_pass: input.isPass,
    sequence: input.sequence,
  });
  if (error) throw new Error("Grade band could not be created");
}

export async function activateScheme(id: string) {
  const c = await requireAssessmentContext(
    "academics.assessments.configure",
    "academics.assessment_configuration",
  );
  const { error } = await c.supabase.rpc("activate_assessment_scheme", {
    target_scheme_id: id,
  });
  if (error) throw new Error("Assessment scheme could not be activated");
}

export async function createResultBatch(input: BatchInput) {
  const c = await requireAssessmentContext("academics.scores.enter");
  const { error } = await c.supabase.from("result_batches").insert({
    organization_id: c.active.organizationId,
    school_id: c.active.schoolId!,
    session_id: input.sessionId,
    period_id: input.periodId,
    class_level_id: input.classLevelId,
    class_arm_id: input.classArmId ?? null,
    subject_id: input.subjectId,
    scheme_id: input.schemeId,
    teaching_assignment_id: input.teachingAssignmentId ?? null,
  });
  if (error) throw new Error("Result batch could not be created");
}

export async function saveScore(input: ScoreInput) {
  const c = await requireAssessmentContext("academics.scores.enter");
  const { error } = await c.supabase.rpc("upsert_assessment_score", {
    target_batch_id: input.batchId,
    target_student_id: input.studentId,
    target_component_id: input.componentId,
    target_score: input.score,
  });
  if (error) throw new Error("Score could not be saved");
}

export async function loadScoreSheet(batchId: string) {
  const context = await requireAssessmentContext();
  const batch = await context.supabase
    .from("result_batches")
    .select(
      "*,assessment_schemes(name,total_mark,pass_mark,assessment_components(id,code,name,maximum_score,weight_percent,sequence)),subjects(name),academic_sessions(name),academic_periods(name),class_levels(name),class_arms(name)",
    )
    .eq("id", batchId)
    .single();
  if (batch.error || !batch.data)
    throw new Error("Score sheet could not be loaded");
  let membershipQuery = context.supabase
    .from("class_memberships")
    .select(
      "student_id,student_profiles!inner(student_number,people!inner(first_name,last_name))",
    )
    .eq("organization_id", context.active.organizationId)
    .eq("school_id", context.active.schoolId!)
    .eq("academic_session_id", batch.data.session_id)
    .eq("class_level_id", batch.data.class_level_id)
    .eq("status", "active");
  membershipQuery = batch.data.class_arm_id
    ? membershipQuery.eq("class_arm_id", batch.data.class_arm_id)
    : membershipQuery.is("class_arm_id", null);
  const [memberships, scores, results] = await Promise.all([
    membershipQuery,
    context.supabase
      .from("assessment_scores")
      .select("student_id,component_id,score")
      .eq("batch_id", batchId),
    context.supabase
      .from("student_subject_results")
      .select("student_id,weighted_percent,total_score,grade,remark,is_pass")
      .eq("batch_id", batchId),
  ]);
  if (memberships.error || scores.error || results.error)
    throw new Error("Score sheet details could not be loaded");
  return {
    ...context,
    batch: batch.data,
    students: memberships.data ?? [],
    scores: scores.data ?? [],
    results: results.data ?? [],
  };
}

export async function loadPublishedReport(batchId: string) {
  const context = await requireAssessmentContext(
    "academics.results.view",
    "academics.report_cards",
  );
  const publication = await context.supabase
    .from("result_publications")
    .select(
      "id,batch_id,version,snapshot,published_at,result_batches(subjects(name),academic_sessions(name),academic_periods(name),class_levels(name),class_arms(name))",
    )
    .eq("batch_id", batchId)
    .single();
  if (publication.error || !publication.data)
    throw new Error("Published report is unavailable");
  return { ...context, publication: publication.data };
}

export async function transitionBatch(
  id: string,
  status: "submitted" | "reviewed" | "approved" | "published",
) {
  const permissions = {
    submitted: "academics.scores.submit",
    reviewed: "academics.results.review",
    approved: "academics.results.approve",
    published: "academics.results.publish",
  } as const;
  await requireAssessmentContext(
    permissions[status],
    status === "submitted"
      ? "academics.score_entry"
      : "academics.result_workflow",
  );
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("transition_result_batch", {
    target_batch_id: id,
    target_status: status,
  });
  if (error) throw new Error("Result workflow transition failed");
}

export async function promoteStudent(input: PromotionInput) {
  const c = await requireAssessmentContext(
    "academics.promotions.manage",
    "academics.promotion",
  );
  const { error } = await c.supabase.rpc("promote_student", {
    target_student_id: input.studentId,
    source_period: input.sourcePeriodId,
    outcome: input.outcome,
    target_session: (input.targetSessionId ?? null) as unknown as string,
    target_level: (input.targetClassLevelId ?? null) as unknown as string,
    target_arm: (input.targetClassArmId ?? null) as unknown as string,
    idempotency_key: input.idempotencyKey,
    notes: input.notes,
  });
  if (error) throw new Error("Student promotion failed");
}
