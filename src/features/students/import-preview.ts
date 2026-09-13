import { z } from "zod";

export const requiredImportHeaders = [
  "first_name",
  "last_name",
  "date_of_birth",
  "student_number",
] as const;

const rowSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  date_of_birth: z.iso.date(),
  student_number: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9][A-Za-z0-9/_-]{1,39}$/),
  guardian_first_name: z.string().trim().max(100).optional().default(""),
  guardian_last_name: z.string().trim().max(100).optional().default(""),
  relationship: z.string().trim().max(60).optional().default(""),
});

export type ImportPreviewRow = {
  rowNumber: number;
  raw: Record<string, string>;
  normalized: Record<string, string>;
  messages: string[];
  status: "valid" | "warning" | "invalid";
};

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted value");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function previewStudentImport(
  input: string,
  existingStudentNumbers: ReadonlySet<string> = new Set(),
): ImportPreviewRow[] {
  const [headerRow, ...dataRows] = parseCsv(input);
  if (!headerRow) throw new Error("CSV is empty");
  const headers = headerRow.map((header) => header.trim().toLowerCase());
  if (new Set(headers).size !== headers.length)
    throw new Error("CSV headers must be unique");
  const missing = requiredImportHeaders.filter(
    (header) => !headers.includes(header),
  );
  if (missing.length)
    throw new Error(`Missing required headers: ${missing.join(", ")}`);
  if (dataRows.length > 500)
    throw new Error("A preview is limited to 500 rows");

  return dataRows.map((values, index) => {
    const raw = Object.fromEntries(
      headers.map((header, offset) => [header, values[offset] ?? ""]),
    );
    const parsed = rowSchema.safeParse(raw);
    const messages = parsed.success
      ? []
      : parsed.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );
    const normalized = parsed.success
      ? {
          ...parsed.data,
          student_number: parsed.data.student_number.toUpperCase(),
        }
      : raw;
    if (parsed.success && existingStudentNumbers.has(normalized.student_number))
      messages.push(
        "Student number already exists; review this possible duplicate.",
      );
    const guardianFields = [
      raw.guardian_first_name,
      raw.guardian_last_name,
      raw.relationship,
    ];
    if (guardianFields.some(Boolean) && !guardianFields.every(Boolean))
      messages.push(
        "Guardian first name, last name and relationship must be supplied together.",
      );
    return {
      rowNumber: index + 2,
      raw,
      normalized,
      messages,
      status:
        !parsed.success ||
        (guardianFields.some(Boolean) && !guardianFields.every(Boolean))
          ? "invalid"
          : messages.length
            ? "warning"
            : "valid",
    };
  });
}
