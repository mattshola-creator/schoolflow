import { z } from "zod";
import { AuthorizationError } from "@/lib/authorization";

const labelsSchema = z
  .object({
    subjectName: z.string().nullable(),
    sessionName: z.string().nullable(),
    periodName: z.string().nullable(),
    className: z.string().nullable(),
    armName: z.string().nullable(),
    assignedTeacherName: z.string().nullable(),
  })
  .strict();

type ContextArgs = {
  target_batch_id: string;
  target_organization_id: string;
  target_school_id: string;
};
type Probe = (
  name: "get_assessment_score_sheet_context",
  args: ContextArgs,
) => PromiseLike<{ data: unknown; error: { code?: string } | null }>;

export async function readScoreSheetContext(probe: Probe, args: ContextArgs) {
  const { data, error } = await probe(
    "get_assessment_score_sheet_context",
    args,
  );
  if (error?.code === "42501")
    throw new AuthorizationError("permission_denied");
  if (error) throw new Error("Score sheet context could not be loaded");
  const parsed = labelsSchema.safeParse(data);
  if (!parsed.success)
    throw new Error("Score sheet context response is invalid");
  return parsed.data;
}
