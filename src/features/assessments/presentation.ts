const workflowLabels: Record<string, string> = {
  draft: "Draft",
  reopened: "Reopened for correction",
  submitted: "Submitted",
  reviewed: "Reviewed",
  approved: "Approved",
  published: "Published",
};

export function assessmentWorkflowLabel(status: string): string {
  return workflowLabels[status] ?? "Workflow status unavailable";
}

/** A hidden computed result is not evidence that its batch is still a draft. */
export function unavailableResultLabel(status: string): string {
  if (status === "draft" || status === "reopened") return "Not yet computed";
  return "Result details unavailable in this workspace";
}

export function assignedTeacherLabel(
  hasAssignment: boolean,
  person: { first_name: string; last_name: string } | null,
): string {
  const name = person ? `${person.first_name} ${person.last_name}`.trim() : "";
  if (name) return name;
  return hasAssignment
    ? "Assigned teacher details unavailable in this workspace"
    : "No explicit teaching assignment linked";
}
