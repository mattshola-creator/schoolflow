"use server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { roleWorkspace } from "@/features/administration/role-management";
const input = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("assign"),
    userId: z.uuid(),
    roleId: z.uuid(),
  }),
  z.object({ operation: z.literal("revoke"), assignmentId: z.uuid() }),
]);
export async function changeRole(form: FormData) {
  let message = "Role change unavailable";
  try {
    const value = input.parse(Object.fromEntries(form));
    const { supabase, user, active, auth } = await roleWorkspace("role.manage");
    // Existing RLS additionally requires organization-scoped role.manage.
    if (value.operation === "assign") {
      if (value.userId === user.id)
        throw new Error("Self-assignment unavailable");
      const [role, member, orgMember] = await Promise.all([
        supabase
          .from("roles")
          .select("id,key,is_system")
          .eq("id", value.roleId)
          .eq("organization_id", active.organizationId)
          .maybeSingle(),
        supabase
          .from("school_memberships")
          .select("id")
          .eq("organization_id", active.organizationId)
          .eq("school_id", active.schoolId!)
          .eq("user_id", value.userId)
          .eq("status", "active")
          .maybeSingle(),
        supabase
          .from("organization_memberships")
          .select("id")
          .eq("organization_id", active.organizationId)
          .eq("user_id", value.userId)
          .eq("status", "active")
          .maybeSingle(),
      ]);
      if (
        role.error ||
        member.error ||
        orgMember.error ||
        !role.data ||
        !member.data ||
        !orgMember.data ||
        role.data.is_system ||
        role.data.key === "organization_owner"
      )
        throw new Error("Invalid role or membership");
      const grants = await supabase
        .from("role_permissions")
        .select("permissions!inner(key)")
        .eq("organization_id", active.organizationId)
        .eq("role_id", value.roleId);
      if (grants.error || !grants.data?.length)
        throw new Error("Unconfigured role");
      for (const grant of grants.data) {
        const relation = grant.permissions as unknown as
          { key: string } | { key: string }[];
        const keys = Array.isArray(relation)
          ? relation.map((p) => p.key)
          : [relation.key];
        if (keys.some((key) => !auth.permissions.includes(key)))
          throw new Error("Cannot delegate additional authority");
      }
      const existing = await supabase
        .from("role_assignments")
        .select("id,status")
        .eq("organization_id", active.organizationId)
        .eq("school_id", active.schoolId!)
        .eq("scope", "school")
        .eq("user_id", value.userId)
        .eq("role_id", value.roleId)
        .limit(200);
      if (existing.error) throw new Error("Lookup failed");
      if ((existing.data?.length ?? 0) >= 200)
        throw new Error("Assignment history requires review");
      if (!existing.data?.some((row) => row.status === "active")) {
        const digest = createHash("sha256")
          .update(
            [
              active.organizationId,
              active.schoolId,
              value.userId,
              value.roleId,
              String(existing.data?.length ?? 0),
            ].join(":"),
          )
          .digest("hex")
          .slice(0, 32);
        const assignmentId = [
          digest.slice(0, 8),
          digest.slice(8, 12),
          digest.slice(12, 16),
          digest.slice(16, 20),
          digest.slice(20),
        ].join("-");
        const result = await supabase.from("role_assignments").insert({
          id: assignmentId,
          organization_id: active.organizationId,
          school_id: active.schoolId!,
          scope: "school",
          user_id: value.userId,
          role_id: value.roleId,
          status: "active",
        });
        if (result.error?.code === "23505") {
          const concurrent = await supabase
            .from("role_assignments")
            .select("id")
            .eq("id", assignmentId)
            .eq("organization_id", active.organizationId)
            .eq("school_id", active.schoolId!)
            .eq("user_id", value.userId)
            .eq("role_id", value.roleId)
            .eq("scope", "school")
            .eq("status", "active")
            .maybeSingle();
          if (concurrent.error || !concurrent.data)
            throw new Error("Assignment denied");
        } else if (result.error) throw new Error("Assignment denied");
      }
      message = "School role assigned";
    } else {
      const assignment = await supabase
        .from("role_assignments")
        .select("id,user_id,role_id")
        .eq("id", value.assignmentId)
        .eq("organization_id", active.organizationId)
        .eq("school_id", active.schoolId!)
        .eq("scope", "school")
        .eq("status", "active")
        .maybeSingle();
      if (
        assignment.error ||
        !assignment.data ||
        assignment.data.user_id === user.id
      )
        throw new Error("Invalid assignment");
      const role = await supabase
        .from("roles")
        .select("is_system,key")
        .eq("id", assignment.data.role_id)
        .eq("organization_id", active.organizationId)
        .single();
      if (
        role.error ||
        role.data.is_system ||
        role.data.key === "organization_owner"
      )
        throw new Error("Protected role");
      const result = await supabase
        .from("role_assignments")
        .update({ status: "ended", effective_to: new Date().toISOString() })
        .eq("id", assignment.data.id)
        .eq("organization_id", active.organizationId)
        .eq("school_id", active.schoolId!)
        .eq("scope", "school")
        .eq("status", "active");
      if (result.error) throw new Error("Revocation denied");
      message = "School role revoked";
    }
    revalidatePath("/administration");
    revalidatePath("/administration/roles");
    revalidatePath("/dashboard");
  } catch {
    message =
      "Role change denied. Check school membership, configured role and delegation authority.";
  }
  redirect("/administration/roles?message=" + encodeURIComponent(message));
}
