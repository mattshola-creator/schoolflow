import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";

export type WorkPriority = "urgent" | "high" | "normal" | "low";

export type HomeTask = {
  id: string;
  title: string;
  status: string;
  priority: WorkPriority;
  dueAt: string | null;
  kind: "task" | "approval" | "notification";
  href: string;
};

export type OperationalCounts = {
  tasks: number;
  approvals: number;
  notifications: number;
  urgent: number;
};

const responsibilityRules = [
  ["finance.view", "Finance"],
  ["admissions.view", "Admissions"],
  ["attendance.view", "Attendance"],
  ["academics.teaching_assignments.view", "Teaching"],
  ["academics.scores.view", "Assessment"],
  ["students.view", "Student records"],
  ["staff.view", "Staff operations"],
  ["reporting.dashboard.view", "Management"],
  ["organization.view", "Administration"],
] as const;

export function deriveResponsibilities(authorization: AuthorizationSnapshot) {
  return responsibilityRules
    .filter(([permission]) => authorization.permissions.includes(permission))
    .map(([, label]) => label);
}

const priorityRank: Record<WorkPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export function sortDailyWork(items: HomeTask[]) {
  return [...items].sort((left, right) => {
    const byPriority =
      priorityRank[left.priority] - priorityRank[right.priority];
    if (byPriority) return byPriority;
    if (!left.dueAt) return right.dueAt ? 1 : 0;
    if (!right.dueAt) return -1;
    return left.dueAt.localeCompare(right.dueAt);
  });
}

export function safeOperationalHref(href: string | null) {
  return href?.startsWith("/") && !href.startsWith("//")
    ? href
    : "/communication";
}

export function composeOperationalCounts({
  taskCount,
  approvalCount,
  notificationCount,
  urgentTaskCount,
}: {
  taskCount: number | null;
  approvalCount: number | null;
  notificationCount: number | null;
  urgentTaskCount: number | null;
}): OperationalCounts {
  const approvals = approvalCount ?? 0;
  return {
    tasks: taskCount ?? 0,
    approvals,
    notifications: notificationCount ?? 0,
    urgent: (urgentTaskCount ?? 0) + approvals,
  };
}
