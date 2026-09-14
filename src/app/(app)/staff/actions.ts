"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  departmentSchema,
  endEmploymentSchema,
  positionSchema,
  staffSchema,
  transferAssignmentSchema,
} from "@/features/staff/schemas";
import { requireStaffContext } from "@/features/staff/service";

function failed(destination: string): never {
  redirect(
    `${destination}?error=The+change+could+not+be+saved.+Check+the+details+and+try+again`,
  );
}

function done(destination: string, message: string): never {
  revalidatePath("/staff");
  redirect(`${destination}?message=${encodeURIComponent(message)}`);
}

export async function createDepartment(formData: FormData) {
  const parsed = departmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed("/staff/setup");
  const { supabase, active } = await requireStaffContext(
    "staff.departments.manage",
  );
  const { error } = await supabase.from("departments").insert({
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    name: parsed.data.name,
    code: parsed.data.code as string,
  });
  if (error) failed("/staff/setup");
  done("/staff/setup", "Department created");
}

export async function createPosition(formData: FormData) {
  const parsed = positionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed("/staff/setup");
  const { supabase, active } = await requireStaffContext(
    "staff.positions.manage",
  );
  const { error } = await supabase.from("positions").insert({
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    department_id: parsed.data.departmentId as string,
    name: parsed.data.name,
    code: parsed.data.code as string,
    is_teaching: parsed.data.isTeaching,
  });
  if (error) failed("/staff/setup");
  done("/staff/setup", "Position created");
}

export async function createStaff(formData: FormData) {
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed("/staff/new");
  const { supabase, active } = await requireStaffContext("staff.manage");
  const { data, error } = await supabase.rpc("create_staff_record", {
    target_organization_id: active.organizationId,
    target_school_id: active.schoolId!,
    target_department_id: parsed.data.departmentId as string,
    target_position_id: parsed.data.positionId,
    staff_first_name: parsed.data.firstName,
    staff_last_name: parsed.data.lastName,
    target_staff_number: parsed.data.staffNumber,
    target_employment_type: parsed.data.employmentType,
    target_started_on: parsed.data.startedOn,
    target_work_email: parsed.data.workEmail as string,
    target_phone: parsed.data.phone as string,
    linked_user_id: parsed.data.linkedUserId as string,
    linked_role_id: parsed.data.linkedRoleId as string,
  });
  if (error || !data) failed("/staff/new");
  done(`/staff/${data}`, "Staff record created");
}

export async function endEmployment(formData: FormData) {
  const parsed = endEmploymentSchema.safeParse(Object.fromEntries(formData));
  const fallback = "/staff";
  if (!parsed.success) failed(fallback);
  const { supabase } = await requireStaffContext("staff.access.manage");
  const { error } = await supabase.rpc("end_staff_employment", {
    target_employment_id: parsed.data.employmentId,
    target_ended_on: parsed.data.endedOn,
    target_reason: parsed.data.reason,
  });
  if (error) failed(fallback);
  done("/staff", "Employment ended and linked staff access revoked");
}

export async function transferStaffAssignment(formData: FormData) {
  const parsed = transferAssignmentSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) failed("/staff");
  const { supabase } = await requireStaffContext("staff.assignments.manage");
  const { error } = await supabase.rpc("transfer_staff_assignment", {
    target_assignment_id: parsed.data.assignmentId,
    target_school_id: parsed.data.schoolId,
    target_department_id: parsed.data.departmentId as string,
    target_position_id: parsed.data.positionId,
    target_started_on: parsed.data.startedOn,
  });
  if (error) failed("/staff");
  done("/staff", "School assignment transferred with history preserved");
}
