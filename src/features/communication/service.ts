import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import type { NoticeInput } from "./schemas";

type PortalLearner = {
  studentId: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
};
export type PortalContext = {
  accountId: string;
  organizationId: string;
  schoolId: string;
  schoolName: string;
  actorKind: "guardian" | "student";
  learners: PortalLearner[];
};
export type PortalDashboard = {
  student: PortalLearner;
  publishedResults: Array<{
    publicationId: string;
    publishedAt: string;
    snapshot: Record<string, unknown>;
  }>;
  attendance: {
    total?: number;
    present?: number;
    absent?: number;
    late?: number;
  };
  finance: { invoices?: number; billed?: number; paid?: number };
};
export type PortalNotice = {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  priority: string;
  publishedAt: string;
  expiresAt: string | null;
  readAt: string | null;
};

export type PortalMessage = {
  id: string;
  threadId: string;
  subject: string;
  status: "open" | "closed" | "archived";
  studentId: string;
  schoolId: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderUserId: string;
    body: string;
    sentAt: string;
    status: string;
  }>;
};

export async function loadPortalContext() {
  const { supabase } = await requireUser();
  const result = await supabase.rpc("portal_context" as never);
  if (result.error) throw new Error("Portal context could not be loaded");
  return (result.data ?? []) as unknown as PortalContext[];
}

export async function loadPortalDashboard(studentId: string, schoolId: string) {
  const { supabase } = await requireUser();
  const [dashboard, notices] = await Promise.all([
    supabase.rpc(
      "portal_dashboard" as never,
      { target_student: studentId, target_school: schoolId } as never,
    ),
    supabase.rpc("portal_notice_feed" as never),
  ]);
  if (dashboard.error || notices.error)
    throw new Error("Portal information could not be loaded");
  return {
    dashboard: dashboard.data as unknown as PortalDashboard,
    notices: (notices.data ?? []) as unknown as PortalNotice[],
  };
}

/**
 * Load the signed-in family account's controlled message threads. The learner
 * and school filters come only from portal_context; table RLS continues to
 * enforce active participation or the existing school communication grant.
 */
export async function loadPortalMessages() {
  const { supabase, user } = await requireUser();
  const contextResult = await supabase.rpc("portal_context" as never);
  if (contextResult.error)
    throw new Error("Portal messages could not be loaded");
  const contexts = (contextResult.data ?? []) as unknown as PortalContext[];
  const learnerIds = [
    ...new Set(contexts.flatMap((x) => x.learners.map((l) => l.studentId))),
  ];
  const schoolIds = [...new Set(contexts.map((x) => x.schoolId))];
  if (learnerIds.length === 0 || schoolIds.length === 0)
    return { userId: user.id, threads: [] as PortalMessage[] };

  type ThreadRow = {
    id: string;
    subject: string;
    status: "open" | "closed" | "archived";
    student_id: string;
    school_id: string;
    updated_at: string;
  };
  type MessageRow = {
    id: string;
    thread_id: string;
    sender_user_id: string;
    body: string;
    sent_at: string;
    status: string;
  };
  const client = supabase as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        in: (
          column: string,
          values: string[],
        ) => {
          in: (
            column: string,
            values: string[],
          ) => {
            order: (
              column: string,
              options: { ascending: boolean },
            ) => Promise<{ data: ThreadRow[] | null; error: unknown }>;
          };
          order: (
            column: string,
            options: { ascending: boolean },
          ) => Promise<{ data: MessageRow[] | null; error: unknown }>;
        };
      };
    };
  };
  const threadResult = await client
    .from("communication_threads")
    .select("id,subject,status,student_id,school_id,updated_at")
    .in("student_id", learnerIds)
    .in("school_id", schoolIds)
    .order("updated_at", { ascending: false });
  if (threadResult.error)
    throw new Error("Portal messages could not be loaded");
  const threads = threadResult.data ?? [];
  if (threads.length === 0)
    return { userId: user.id, threads: [] as PortalMessage[] };

  const threadIds = threads.map((thread) => thread.id);
  const messageResult = await client
    .from("communication_messages")
    .select("id,thread_id,sender_user_id,body,sent_at,status")
    .in("thread_id", threadIds)
    .order("sent_at", { ascending: true });
  if (messageResult.error)
    throw new Error("Portal messages could not be loaded");
  const messagesByThread = new Map<string, PortalMessage["messages"]>();
  for (const message of messageResult.data ?? []) {
    const items = messagesByThread.get(message.thread_id) ?? [];
    items.push({
      id: message.id,
      senderUserId: message.sender_user_id,
      body: message.body,
      sentAt: message.sent_at,
      status: message.status,
    });
    messagesByThread.set(message.thread_id, items);
  }
  return {
    userId: user.id,
    threads: threads.map((thread) => ({
      id: thread.id,
      threadId: thread.id,
      subject: thread.subject,
      status: thread.status,
      studentId: thread.student_id,
      schoolId: thread.school_id,
      updatedAt: thread.updated_at,
      messages: messagesByThread.get(thread.id) ?? [],
    })),
  };
}

async function requireCommunication(permission: string, feature: string) {
  const authorization = await requireCapability({
    module: "communication",
    permission,
    feature,
  });
  const [{ supabase }, { active }] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !active?.schoolId ||
    active.organizationId !== authorization.organizationId ||
    active.schoolId !== authorization.schoolId
  )
    throw new Error("The active school context is invalid");
  return { supabase, active: { ...active, schoolId: active.schoolId } };
}

export async function loadCommunicationWorkspace() {
  const c = await requireCommunication(
    "communication.view",
    "communication.information_center",
  );
  const client = c.supabase as unknown as {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: string,
        ) => {
          eq: (
            column: string,
            value: string,
          ) => {
            order: (
              column: string,
              options: { ascending: boolean },
            ) => Promise<{ data: unknown[] | null; error: unknown }>;
          };
        };
      };
    };
  };
  const notices = await client
    .from("communication_notices")
    .select("id,title,body,priority,status,published_at,expires_at")
    .eq("organization_id", c.active.organizationId)
    .eq("school_id", c.active.schoolId)
    .order("created_at", { ascending: false });
  if (notices.error)
    throw new Error("Communication workspace could not be loaded");
  return { ...c, notices: notices.data ?? [] };
}

export async function createAndPublishNotice(input: NoticeInput) {
  const c = await requireCommunication(
    "communication.notices.manage",
    "communication.information_center",
  );
  const client = c.supabase as unknown as {
    from: (table: string) => {
      insert: (value: Record<string, unknown>) => {
        select: (columns: string) => {
          single: () => Promise<{
            data: { id: string } | null;
            error: unknown;
          }>;
        };
      };
    };
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ error: unknown }>;
  };
  const created = await client
    .from("communication_notices")
    .insert({
      organization_id: c.active.organizationId,
      school_id: c.active.schoolId,
      title: input.title,
      body: input.body,
      priority: input.priority,
      expires_at: input.expiresAt ?? null,
    })
    .select("id")
    .single();
  if (created.error || !created.data)
    throw new Error("Notice could not be created");
  const audience = await (
    c.supabase as unknown as {
      from: (table: string) => {
        insert: (value: Record<string, unknown>) => Promise<{ error: unknown }>;
      };
    }
  )
    .from("communication_notice_audiences")
    .insert({
      organization_id: c.active.organizationId,
      school_id: c.active.schoolId,
      notice_id: created.data.id,
      audience_kind: input.audienceKind,
    });
  if (audience.error) throw new Error("Notice audience could not be created");
  const published = await client.rpc("publish_communication_notice", {
    target_notice: created.data.id,
  });
  if (published.error) throw new Error("Notice could not be published");
}

export async function sendPortalMessage(
  threadId: string,
  body: string,
  requestId: string,
) {
  const { supabase } = await requireUser();
  const result = await supabase.rpc(
    "send_communication_message" as never,
    {
      target_thread: threadId,
      target_body: body,
      target_request: requestId,
    } as never,
  );
  if (result.error) throw new Error("Message could not be sent");
}
