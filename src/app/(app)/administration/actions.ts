"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { AuthorizationError, requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import {
  isQaInvitationHost,
  isQaSupabaseUrl,
  qaInvitationAcceptanceUrl,
  qaRolePresets,
} from "@/features/administration/qa-provisioning";

const invitationInput = z.object({
  schoolId: z.string().uuid(),
  rolePreset: z.enum([
    "payment_recorder",
    "payment_verifier",
    "internal_qa_reader",
  ]),
});

export type QaInvitationState = {
  message: string;
  inviteUrl?: string;
  signInUrl?: string;
};

const permissionRequirement = {
  module: "foundation",
  feature: "foundation.authorization_inspection",
} as const;

type QaInvitationStage =
  | "authorization"
  | "tenant_context"
  | "organization_check"
  | "school_check"
  | "permission_catalog"
  | "role_check"
  | "role_grants"
  | "identity_provisioning"
  | "invitation_lookup"
  | "invitation_creation";

export async function createQaInvitation(
  _previousState: QaInvitationState,
  formData: FormData,
): Promise<QaInvitationState> {
  const parsed = invitationInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { message: "Enter a valid email and select an authorized role." };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!isQaSupabaseUrl(supabaseUrl))
    return { message: "QA invitations are unavailable in this environment." };

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!isQaInvitationHost(host))
    return { message: "This host is not an approved SchoolFlow QA site." };

  let stage: QaInvitationStage = "authorization";
  try {
    const [roleAccess, membershipAccess, membershipView, userResult, tenant] =
      await Promise.all([
        requireCapability({
          ...permissionRequirement,
          permission: "role.manage",
        }),
        requireCapability({
          ...permissionRequirement,
          permission: "membership.manage",
        }),
        requireCapability({
          ...permissionRequirement,
          permission: "membership.view",
        }),
        requireUser(),
        loadTenantContext(),
      ]);
    stage = "tenant_context";
    const active = tenant.active;
    if (
      !active ||
      !active.schoolId ||
      active.schoolId !== parsed.data.schoolId ||
      active.organizationId !== roleAccess.organizationId ||
      active.organizationId !== membershipAccess.organizationId ||
      active.organizationId !== membershipView.organizationId
    )
      return {
        message: "Select an authorized school before creating an invitation.",
      };

    const preset = qaRolePresets[parsed.data.rolePreset];
    stage = "organization_check";
    const organization = await userResult.supabase
      .from("organizations")
      .select("slug")
      .eq("id", active.organizationId)
      .maybeSingle();
    if (
      organization.error ||
      !organization.data ||
      organization.data.slug !== preset.organizationSlug
    )
      return {
        message: "That role is not available in the active organization.",
      };

    stage = "school_check";
    const school = await userResult.supabase
      .from("schools")
      .select("id")
      .eq("id", active.schoolId)
      .eq("organization_id", active.organizationId)
      .maybeSingle();
    if (school.error || !school.data)
      return { message: "The active school could not be verified." };

    stage = "permission_catalog";
    const permissionRows = await userResult.supabase
      .from("permissions")
      .select("id,key")
      .in("key", [...preset.permissions]);
    if (
      permissionRows.error ||
      (permissionRows.data?.length ?? 0) !== preset.permissions.length
    )
      return { message: "The QA role permission set is incomplete." };

    stage = "role_check";
    let roleResult = await userResult.supabase
      .from("roles")
      .select("id,description,is_system")
      .eq("organization_id", active.organizationId)
      .eq("key", preset.key)
      .maybeSingle();
    if (roleResult.error)
      return { message: "The QA role could not be checked." };

    if (!roleResult.data) {
      roleResult = await userResult.supabase
        .from("roles")
        .insert({
          organization_id: active.organizationId,
          key: preset.key,
          name: preset.name,
          description: preset.description,
          is_system: false,
        })
        .select("id,description,is_system")
        .single();
    }
    if (
      roleResult.error ||
      !roleResult.data ||
      roleResult.data.is_system ||
      roleResult.data.description !== preset.description
    )
      return {
        message: "The existing QA role differs from its approved preset.",
      };

    stage = "role_grants";
    const currentGrants = await userResult.supabase
      .from("role_permissions")
      .select("permission_id")
      .eq("organization_id", active.organizationId)
      .eq("role_id", roleResult.data.id);
    if (currentGrants.error)
      return { message: "The QA role permissions could not be verified." };

    const permissionIds = new Set(permissionRows.data?.map((item) => item.id));
    const currentIds = new Set(
      currentGrants.data?.map((grant) => grant.permission_id),
    );
    if ([...currentIds].some((id) => !permissionIds.has(id)))
      return {
        message: "The existing QA role has grants outside its approved preset.",
      };

    const missingGrants = (permissionRows.data ?? []).filter(
      (item) => !currentIds.has(item.id),
    );
    if (missingGrants.length) {
      const { error } = await userResult.supabase
        .from("role_permissions")
        .insert(
          missingGrants.map((item) => ({
            organization_id: active.organizationId,
            role_id: roleResult.data!.id,
            permission_id: item.id,
          })),
        );
      if (error)
        return { message: "The QA role permissions could not be prepared." };
    }

    const appOrigin = `https://${host}`;
    stage = "identity_provisioning";
    const { data: identity, error: identityError } =
      await userResult.supabase.functions.invoke<{
        signInUrl: string;
        membershipState: "unassigned" | "complete";
      }>("qa-provision-identity", {
        body: {
          rolePreset: parsed.data.rolePreset,
          organizationId: active.organizationId,
          schoolId: active.schoolId,
          appOrigin,
        },
        headers: { Origin: appOrigin },
      });
    if (
      identityError ||
      !identity?.signInUrl ||
      !["unassigned", "complete"].includes(identity.membershipState)
    )
      return {
        message:
          "QA identity creation was blocked. No email or notification was sent.",
      };
    if (identity.membershipState === "complete")
      return {
        message:
          "This synthetic QA identity already has its approved school membership and role.",
        signInUrl: identity.signInUrl,
      };

    stage = "invitation_lookup";
    const pending = await userResult.supabase
      .from("invitations")
      .select("id,invited_by")
      .eq("organization_id", active.organizationId)
      .eq("school_id", active.schoolId)
      .eq("role_id", roleResult.data.id)
      .eq("email", preset.syntheticEmail)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    if (pending.error)
      return { message: "Existing invitations could not be checked." };
    if (pending.data) {
      if (pending.data.invited_by !== userResult.user.id)
        return {
          message:
            "An active invitation for this synthetic identity was created by another manager.",
        };
      const { error: revokeError } = await userResult.supabase
        .from("invitations")
        .update({ status: "revoked" })
        .eq("id", pending.data.id)
        .eq("invited_by", userResult.user.id);
      if (revokeError)
        return {
          message:
            "The previous unused invitation could not be safely replaced.",
        };
    }

    stage = "invitation_creation";
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { error: inviteError } = await userResult.supabase
      .from("invitations")
      .insert({
        organization_id: active.organizationId,
        school_id: active.schoolId,
        role_id: roleResult.data.id,
        email: preset.syntheticEmail,
        token_hash: tokenHash,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        invited_by: userResult.user.id,
      });
    if (inviteError)
      return { message: "The QA invitation could not be created." };

    const inviteUrl = qaInvitationAcceptanceUrl(token);
    return {
      message:
        "QA sign-in and role acceptance links are ready. No email or external notification was sent.",
      inviteUrl: inviteUrl.toString(),
      signInUrl: identity.signInUrl,
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "qa_invitation_preparation_failed",
        stage,
        category:
          error instanceof AuthorizationError ? error.reason : "unexpected",
      }),
    );
    return {
      message: "Invitation requires role and membership management access.",
    };
  }
}
