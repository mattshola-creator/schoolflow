import { notFound } from "next/navigation";
import { ApplicationShell } from "@/components/application-shell";
import { ContextRibbon } from "@/components/context-ribbon";
import { SkipLink } from "@/components/ui/skip-link";
import {
  buildWorkspaceAccess,
  describeAccessReason,
} from "@/features/authorization/navigation";
import { requireCapability } from "@/lib/authorization";
import { requireUser } from "@/lib/auth";
import { loadTenantContext } from "@/lib/tenant-context";
import { loadAcademicContext } from "@/lib/academic-context";
import { logout, switchContext } from "@/app/(app)/actions";

export const dynamic = "force-dynamic";

export default async function SharedShellReviewPage() {
  if (
    (process.env.SCHOOLFLOW_SHELL_REVIEW !== "true" ||
      process.env.NEXT_PUBLIC_SUPABASE_URL !==
        "https://afqykqlxecpzspjoyegc.supabase.co") &&
    process.env.NODE_ENV !== "development"
  )
    notFound();
  const authorization = await requireCapability({
    permission: "organization.view",
    module: "foundation",
    feature: "foundation.authorization_inspection",
  });
  const [{ user }, tenant] = await Promise.all([
    requireUser(),
    loadTenantContext(),
  ]);
  if (
    !tenant.active ||
    tenant.active.organizationId !== authorization.organizationId ||
    tenant.active.schoolId !== authorization.schoolId
  )
    notFound();
  const academic = await loadAcademicContext(
    tenant.active.organizationId,
    tenant.active.schoolId,
  );
  const workspace = buildWorkspaceAccess(authorization);
  const items = workspace.available.map((item) => ({
    href: item.href ?? `/capabilities/${item.module}`,
    label: item.label,
    group: item.group,
  }));
  return (
    <>
      <SkipLink />
      <ApplicationShell
        enableAppearance
        items={items}
        unavailableItems={workspace.unavailable.map((item) => ({
          label: item.label,
          reason: describeAccessReason(item.reason),
        }))}
        userEmail={user.email}
        signOutAction={logout}
        searchHref={
          items.some((item) => item.href === "/management")
            ? "/management#workspace-search"
            : undefined
        }
        notificationHref={
          items.some((item) => item.href === "/action-center")
            ? "/action-center"
            : undefined
        }
        contextRibbon={
          <ContextRibbon
            active={tenant.active}
            academic={academic}
            options={tenant.options}
            switchAction={switchContext}
          />
        }
      >
        <main className="border-border bg-surface space-y-5 rounded-2xl border p-5">
          <h1 className="text-2xl font-semibold text-slate-950">
            Shared-shell appearance review
          </h1>
          <p className="text-slate-600">
            This isolated review uses your existing authorized navigation,
            context and session controls. Theme selection is temporary. Domain
            pages retain their existing presentation.
          </p>
          <p className="text-sm text-slate-600">
            Follow a workspace link to return to its existing workflow. No
            dashboard metrics are changed.
          </p>
        </main>
      </ApplicationShell>
    </>
  );
}
