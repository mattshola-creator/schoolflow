"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  armSchema,
  levelSchema,
  lockSchema,
  periodSchema,
  sectionSchema,
  sessionSchema,
  settingsSchema,
  subjectSchema,
  unlockSchema,
} from "@/features/academics/schemas";
import { requireAcademicContext } from "@/features/academics/service";

function done(message: string): never {
  revalidatePath("/academic-setup");
  redirect(`/academic-setup?message=${encodeURIComponent(message)}`);
}

function failed(): never {
  redirect(
    "/academic-setup?error=The+change+could+not+be+saved.+Check+the+details+and+try+again",
  );
}

export async function saveAcademicSettings(formData: FormData) {
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireAcademicContext(
    "academics.structure.manage",
  );
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("school_academic_settings").upsert({
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    period_label: parsed.data.periodLabel,
    week_starts_on: parsed.data.weekStartsOn,
    updated_by: userData.user!.id,
  });
  if (error) failed();
  done("Academic preferences saved");
}

export async function createAcademicSession(formData: FormData) {
  const parsed = sessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireAcademicContext(
    "academics.sessions.manage",
  );
  const { data, error } = await supabase
    .from("academic_sessions")
    .insert({
      organization_id: active.organizationId,
      school_id: active.schoolId!,
      name: parsed.data.name,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
    })
    .select("id")
    .single();
  if (error) failed();
  if (parsed.data.makeCurrent) {
    const result = await supabase.rpc("set_current_academic_session", {
      target_session_id: data.id,
    });
    if (result.error) failed();
  }
  done("Academic session created");
}

export async function createAcademicPeriod(formData: FormData) {
  const parsed = periodSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireAcademicContext(
    "academics.periods.manage",
  );
  const { data, error } = await supabase
    .from("academic_periods")
    .insert({
      organization_id: active.organizationId,
      school_id: active.schoolId!,
      session_id: parsed.data.sessionId,
      name: parsed.data.name,
      sequence: parsed.data.sequence,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
    })
    .select("id")
    .single();
  if (error) failed();
  if (parsed.data.makeCurrent) {
    const result = await supabase.rpc("set_current_academic_period", {
      target_period_id: data.id,
    });
    if (result.error) failed();
  }
  done("Academic period created");
}

export async function createAcademicSection(formData: FormData) {
  const parsed = sectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireAcademicContext(
    "academics.structure.manage",
  );
  const { error } = await supabase.from("academic_sections").insert({
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    name: parsed.data.name,
    code: parsed.data.code,
    sort_order: parsed.data.sortOrder,
  });
  if (error) failed();
  done("Academic section created");
}

export async function createClassLevel(formData: FormData) {
  const parsed = levelSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireAcademicContext(
    "academics.structure.manage",
  );
  const { error } = await supabase.from("class_levels").insert({
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    name: parsed.data.name,
    code: parsed.data.code,
    section_id: parsed.data.sectionId,
    sort_order: parsed.data.sortOrder,
  });
  if (error) failed();
  done("Class level created");
}

export async function createClassArm(formData: FormData) {
  const parsed = armSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireAcademicContext(
    "academics.structure.manage",
  );
  const { error } = await supabase.from("class_arms").insert({
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    class_level_id: parsed.data.classLevelId,
    name: parsed.data.name,
    code: parsed.data.code,
    sort_order: parsed.data.sortOrder,
  });
  if (error) failed();
  done("Class arm created");
}

export async function createSubject(formData: FormData) {
  const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireAcademicContext(
    "academics.subjects.manage",
  );
  const { error } = await supabase.rpc("create_school_subject", {
    target_organization_id: active.organizationId,
    target_school_id: active.schoolId!,
    subject_name: parsed.data.name,
    subject_code: parsed.data.code,
    target_level_id: parsed.data.classLevelId,
    subject_classification: parsed.data.classification,
    subject_sort_order: parsed.data.sortOrder,
  });
  if (error) failed();
  done("Subject created");
}

export async function createAcademicLock(formData: FormData) {
  const parsed = lockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase, active } = await requireAcademicContext(
    "academics.locks.manage",
  );
  const { error } = await supabase.from("academic_locks").insert({
    organization_id: active.organizationId,
    school_id: active.schoolId!,
    scope: parsed.data.scope,
    session_id: parsed.data.sessionId,
    period_id: parsed.data.periodId,
    reason: parsed.data.reason,
  });
  if (error) failed();
  done("Academic lock applied");
}

export async function releaseAcademicLock(formData: FormData) {
  const parsed = unlockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed();
  const { supabase } = await requireAcademicContext("academics.locks.manage");
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("academic_locks")
    .update({
      unlocked_at: new Date().toISOString(),
      unlocked_by: userData.user!.id,
      unlock_reason: parsed.data.reason,
    })
    .eq("id", parsed.data.lockId)
    .is("unlocked_at", null);
  if (error) failed();
  done("Academic lock released");
}

export async function deactivateAcademicItem(formData: FormData) {
  const kind = formData.get("kind");
  const id = formData.get("id");
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) failed();
  const targets = {
    section: ["academic_sections", "academics.structure.manage"],
    level: ["class_levels", "academics.structure.manage"],
    arm: ["class_arms", "academics.structure.manage"],
    subject: ["subjects", "academics.subjects.manage"],
  } as const;
  if (typeof kind !== "string" || !(kind in targets)) failed();
  const [table, permission] = targets[kind as keyof typeof targets];
  const { supabase, active } = await requireAcademicContext(permission);
  const { error } = await supabase
    .from(table)
    .update({ status: "inactive" })
    .eq("id", id)
    .eq("organization_id", active.organizationId)
    .eq("school_id", active.schoolId!);
  if (error) failed();
  done("Item deactivated; historical references were preserved");
}
