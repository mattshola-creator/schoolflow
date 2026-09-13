"use server";

import { redirect } from "next/navigation";
import { previewStudentImport } from "@/features/students/import-preview";
import { importPreviewSchema } from "@/features/students/schemas";
import { requireStudentContext } from "@/features/students/service";

function failed(message: string): never {
  redirect(`/students/import?error=${encodeURIComponent(message)}`);
}

export async function createImportPreview(formData: FormData) {
  const parsed = importPreviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) failed("The import file details are invalid.");
  const { supabase, active } = await requireStudentContext(
    "students.import",
    "students.import_preview",
  );
  let rows;
  try {
    const preliminary = previewStudentImport(parsed.data.csv);
    const numbers = preliminary
      .map((row) => row.normalized.student_number)
      .filter(Boolean);
    const existing = numbers.length
      ? await supabase
          .from("student_profiles")
          .select("student_number")
          .in("student_number", numbers)
      : { data: [], error: null };
    if (existing.error)
      failed("Existing students could not be checked safely.");
    rows = previewStudentImport(
      parsed.data.csv,
      new Set(existing.data?.map((item) => item.student_number) ?? []),
    );
  } catch (error) {
    failed(
      error instanceof Error ? error.message : "The CSV could not be parsed.",
    );
  }
  if (!rows.length) failed("The CSV contains no student rows.");
  const { data: batchId, error: previewError } = await supabase.rpc(
    "create_student_import_preview",
    {
      target_organization_id: active.organizationId,
      target_school_id: active.schoolId!,
      source_name: parsed.data.sourceName,
      preview_rows: rows,
    },
  );
  if (previewError || !batchId)
    failed("The preview could not be saved safely.");
  redirect(`/students/import?batch=${batchId}`);
}
