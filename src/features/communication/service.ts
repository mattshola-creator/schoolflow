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
