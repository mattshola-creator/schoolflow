"use server";

import { redirect } from "next/navigation";
import { studentSchema } from "@/features/students/schemas";
import { requireStudentContext } from "@/features/students/service";

function failed(): never {
  redirect(
    "/students/new?error=The+student+could+not+be+created.+Check+the+details+and+try+again",
  );
}

export async function createStudent(formData: FormData) {
  const parsed = studentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireStudentContext("students.manage");
  const { data, error } = await supabase.rpc("create_student_record", {
    target_organization_id: active.organizationId,
    target_school_id: active.schoolId!,
    target_session_id: parsed.data.sessionId,
    target_level_id: parsed.data.levelId,
    target_arm_id: parsed.data.armId as string,
    student_first_name: parsed.data.firstName,
    student_last_name: parsed.data.lastName,
    target_student_number: parsed.data.studentNumber,
    target_date_of_birth: parsed.data.dateOfBirth,
    target_gender: parsed.data.gender as string,
    enrollment_date: parsed.data.enrolledOn,
    guardian_first_name: parsed.data.guardianFirstName as string,
    guardian_last_name: parsed.data.guardianLastName as string,
    guardian_relationship: parsed.data.guardianRelationship as string,
    guardian_primary: parsed.data.guardianPrimary,
    guardian_financial: parsed.data.guardianFinancial,
  });
  if (error || !data) failed();
  redirect(`/students/${data}?message=Student+created`);
}
