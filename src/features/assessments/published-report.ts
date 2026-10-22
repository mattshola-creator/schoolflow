import { z } from "zod";
import type { Json } from "@/types/database.generated";

const identity = z.object({
  studentNumber: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});
const result = z.object({
  student_id: z.string().min(1),
  weighted_percent: z.number().finite(),
  total_score: z.number().finite(),
  grade: z.string(),
  remark: z.string(),
  is_pass: z.boolean(),
  student_identity: z.unknown().optional(),
});

// Never enrich a historical publication from mutable current student profiles.
export function publishedReportResults(snapshot: Json) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot))
    return [];
  if (!Array.isArray(snapshot.results)) return [];
  return snapshot.results.flatMap((item) => {
    const parsed = result.safeParse(item);
    if (!parsed.success) return [];
    const captured = identity.safeParse(parsed.data.student_identity);
    return [
      {
        ...parsed.data,
        studentName: captured.success
          ? `${captured.data.firstName} ${captured.data.lastName}`
          : null,
        studentNumber: captured.success ? captured.data.studentNumber : null,
      },
    ];
  });
}
