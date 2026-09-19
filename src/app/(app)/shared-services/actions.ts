"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  allowedDocumentTypes,
  approvalDecisionSchema,
  approvalPolicySchema,
  approvalRequestSchema,
  documentMetadataSchema,
  maxDocumentBytes,
  taskSchema,
  taskStatusSchema,
} from "@/features/shared-services/schemas";
import { requireSharedContext } from "@/features/shared-services/service";

function failed(
  path: string,
  message = "The change could not be saved",
): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function done(path: string, message: string): never {
  revalidatePath(path);
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function createTask(formData: FormData) {
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    failed("/action-center", "Check the task details and try again");
  const { supabase, active } = await requireSharedContext(
    "shared.tasks.manage",
    "foundation.action_center",
  );
  const { error } = await supabase.from("action_tasks").insert({
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    title: parsed.data.title,
    description: parsed.data.description || null,
    priority: parsed.data.priority,
    owner_user_id: parsed.data.ownerUserId ?? null,
    due_at: parsed.data.dueAt
      ? new Date(parsed.data.dueAt).toISOString()
      : null,
  });
  if (error) failed("/action-center");
  done("/action-center", "Task added to the Action Center");
}

export async function updateTaskStatus(formData: FormData) {
  const parsed = taskStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed("/action-center");
  const { supabase, active } = await requireSharedContext(
    "shared.tasks.manage",
    "foundation.action_center",
  );
  const { error } = await supabase
    .from("action_tasks")
    .update({
      status: parsed.data.status,
      completed_at:
        parsed.data.status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.taskId)
    .eq("organization_id", active.organizationId)
    .eq("school_id", active.schoolId!);
  if (error) failed("/action-center");
  done("/action-center", "Task status updated");
}

export async function createApprovalPolicy(formData: FormData) {
  const parsed = approvalPolicySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    failed("/action-center", "Check the policy details and try again");
  const { supabase, active } = await requireSharedContext(
    "shared.approvals.manage",
    "foundation.action_center",
  );
  const { error } = await supabase.rpc("create_approval_policy", {
    target_organization_id: active.organizationId,
    target_school_id: active.schoolId!,
    policy_key: parsed.data.key,
    policy_name: parsed.data.name,
    policy_description: parsed.data.description,
    first_approver_role_id: parsed.data.approverRoleId,
  });
  if (error) failed("/action-center");
  done("/action-center", "Approval policy created");
}

export async function submitApprovalRequest(formData: FormData) {
  const parsed = approvalRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    failed("/action-center", "Check the request details and try again");
  const { supabase, active } = await requireSharedContext(
    "shared.approvals.manage",
    "foundation.action_center",
  );
  const { error } = await supabase.rpc("submit_approval_request", {
    target_organization_id: active.organizationId,
    target_school_id: active.schoolId!,
    target_policy_id: parsed.data.policyId,
    target_subject_type: parsed.data.subjectType,
    target_subject_id: parsed.data.subjectId,
    target_title: parsed.data.title,
  });
  if (error) failed("/action-center");
  done("/action-center", "Approval request submitted");
}

export async function decideApproval(formData: FormData) {
  const parsed = approvalDecisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed("/action-center");
  const { supabase } = await requireSharedContext(
    "shared.approvals.decide",
    "foundation.action_center",
  );
  const { error } = await supabase.rpc("decide_approval_request", {
    target_request_id: parsed.data.requestId,
    target_decision: parsed.data.decision,
    target_comment: parsed.data.comment || undefined,
  });
  if (error)
    failed(
      "/action-center",
      "This approval is unavailable or not assigned to your role",
    );
  done("/action-center", "Approval decision recorded");
}

export async function uploadDocument(formData: FormData) {
  const parsed = documentMetadataSchema.safeParse(Object.fromEntries(formData));
  const file = formData.get("file");
  if (!parsed.success || !(file instanceof File))
    failed("/documents", "Choose a valid document and title");
  if (
    !file.size ||
    file.size > maxDocumentBytes ||
    !allowedDocumentTypes.has(file.type)
  )
    failed("/documents", "Use a PDF, JPEG, PNG or CSV file up to 10 MiB");
  if (Boolean(parsed.data.entityType) !== Boolean(parsed.data.entityId))
    failed("/documents", "A linked record requires both its type and ID");
  const { supabase, active } = await requireSharedContext(
    "shared.documents.manage",
    "foundation.document_storage",
  );
  const documentId = crypto.randomUUID();
  const safeName =
    file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-120) || "document";
  const objectPath = `${active.organizationId}/${active.schoolId}/${documentId}/${safeName}`;
  const metadata = await supabase.from("documents").insert({
    id: documentId,
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    title: parsed.data.title,
    original_filename: file.name.slice(0, 240),
    object_path: objectPath,
    mime_type: file.type,
    size_bytes: file.size,
    entity_type: parsed.data.entityType || null,
    entity_id: parsed.data.entityId ?? null,
  });
  if (metadata.error)
    failed("/documents", "Document metadata could not be saved");
  const uploaded = await supabase.storage
    .from("schoolflow-documents")
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });
  if (uploaded.error)
    failed(
      "/documents",
      "Upload failed; the pending record remains visible for review",
    );
  const finalized = await supabase
    .from("documents")
    .update({ status: "available" })
    .eq("id", documentId)
    .eq("organization_id", active.organizationId);
  if (finalized.error)
    failed("/documents", "The upload completed but could not be finalized");
  done("/documents", "Document uploaded securely");
}

export async function downloadDocument(formData: FormData) {
  const documentId = formData.get("documentId");
  if (typeof documentId !== "string") failed("/documents");
  const { supabase, active } = await requireSharedContext(
    "shared.documents.view",
    "foundation.document_storage",
  );
  const result = await supabase
    .from("documents")
    .select("object_path")
    .eq("id", documentId)
    .eq("organization_id", active.organizationId)
    .eq("school_id", active.schoolId!)
    .eq("status", "available")
    .maybeSingle();
  if (result.error || !result.data)
    failed("/documents", "Document is unavailable");
  const signed = await supabase.storage
    .from("schoolflow-documents")
    .createSignedUrl(result.data.object_path, 60);
  if (signed.error || !signed.data)
    failed("/documents", "Document is unavailable");
  redirect(signed.data.signedUrl);
}
