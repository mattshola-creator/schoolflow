import { evaluateAccess } from "@/features/authorization/evaluator";
import type { AuthorizationSnapshot } from "@/features/authorization/evaluator";
import { requireUser } from "@/lib/auth";
import type { TenantOption } from "@/features/tenancy/context";
import {
  deriveResponsibilities,
  composeOperationalCounts,
  safeOperationalHref,
  sortDailyWork,
  type HomeTask,
  type WorkPriority,
} from "./model";

export async function loadOperationalHome(
  active: TenantOption,
  authorization: AuthorizationSnapshot,
) {
  if (
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active operational context is invalid");

  const access = evaluateAccess(authorization, {
    module: "foundation",
    permission: "shared.tasks.view",
    feature: "foundation.action_center",
  });
  const responsibilities = deriveResponsibilities(authorization);
  if (!access.allowed) {
    return {
      responsibilities,
      canViewWork: false,
      tasks: [] as HomeTask[],
      counts: { tasks: 0, approvals: 0, notifications: 0, urgent: 0 },
    };
  }

  const { supabase, user } = await requireUser();
  let tasksQuery = supabase
    .from("action_tasks")
    .select("id,title,status,priority,due_at", { count: "exact" })
    .eq("organization_id", active.organizationId)
    .in("status", ["open", "in_progress"])
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(20);
  let approvalsQuery = supabase
    .from("approval_requests")
    .select("id,title,status,created_at", { count: "exact" })
    .eq("organization_id", active.organizationId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);
  let notificationsQuery = supabase
    .from("notifications")
    .select("id,title,href,created_at", { count: "exact" })
    .eq("organization_id", active.organizationId)
    .eq("recipient_user_id", user.id)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(20);
  let urgentTaskCountQuery = supabase
    .from("action_tasks")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", active.organizationId)
    .in("status", ["open", "in_progress"])
    .in("priority", ["urgent", "high"]);
  if (active.schoolId) {
    tasksQuery = tasksQuery.eq("school_id", active.schoolId);
    approvalsQuery = approvalsQuery.eq("school_id", active.schoolId);
    notificationsQuery = notificationsQuery.or(
      `school_id.eq.${active.schoolId},school_id.is.null`,
    );
    urgentTaskCountQuery = urgentTaskCountQuery.eq(
      "school_id",
      active.schoolId,
    );
  }

  const [tasks, approvals, notifications, urgentTaskCount] = await Promise.all([
    tasksQuery,
    approvalsQuery,
    notificationsQuery,
    urgentTaskCountQuery,
  ]);
  if (
    tasks.error ||
    approvals.error ||
    notifications.error ||
    urgentTaskCount.error
  )
    throw new Error("Your operational overview could not be loaded");

  const taskItems: HomeTask[] = (tasks.data ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority as WorkPriority,
    dueAt: task.due_at,
    kind: "task",
    href: "/action-center",
  }));
  const approvalItems: HomeTask[] = (approvals.data ?? []).map((request) => ({
    id: request.id,
    title: request.title,
    status: "Pending approval",
    priority: "high",
    dueAt: request.created_at,
    kind: "approval",
    href: "/action-center",
  }));
  const notificationItems: HomeTask[] = (notifications.data ?? []).map(
    (notification) => ({
      id: notification.id,
      title: notification.title,
      status: "Unread notification",
      priority: "normal",
      dueAt: notification.created_at,
      kind: "notification",
      href: safeOperationalHref(notification.href),
    }),
  );
  const dailyWork = sortDailyWork([
    ...taskItems,
    ...approvalItems,
    ...notificationItems,
  ]);

  return {
    responsibilities,
    canViewWork: true,
    tasks: dailyWork,
    counts: composeOperationalCounts({
      taskCount: tasks.count,
      approvalCount: approvals.count,
      notificationCount: notifications.count,
      urgentTaskCount: urgentTaskCount.count,
    }),
  };
}
