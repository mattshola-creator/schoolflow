import { ApplicationShell } from "@/components/application-shell";
import { ContextRibbon } from "@/components/context-ribbon";
import { SkipLink } from "@/components/ui/skip-link";
import {
  buildWorkspaceAccess,
  describeAccessReason,
} from "@/features/authorization/navigation";
import { requireUser } from "@/lib/auth";
import { loadAcademicContext } from "@/lib/academic-context";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import { loadTenantContext } from "@/lib/tenant-context";
import { logout, switchContext } from "./actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
  const [authorization, tenant] = await Promise.all([
    loadEffectiveAuthorization(),
    loadTenantContext(),
  ]);
  const academic = tenant.active
    ? await loadAcademicContext(
        tenant.active.organizationId,
        tenant.active.schoolId,
      )
    : {
        sessionId: null,
        sessionName: null,
        periodId: null,
        periodName: null,
        available: false,
      };
  const workspace = authorization
    ? buildWorkspaceAccess(authorization)
    : { available: [], unavailable: [] };
  const navigationItems = workspace.available.map((item) => ({
    href: item.href ?? `/capabilities/${item.module}`,
    label: item.label,
    group: item.group,
  }));
  const unavailableItems = workspace.unavailable.map((item) => ({
    label: item.label,
    reason: describeAccessReason(item.reason),
  }));

  return (
    <>
      <SkipLink />
      <ApplicationShell
        items={navigationItems}
        searchHref={
          navigationItems.some((item) => item.href === "/management")
            ? "/management#workspace-search"
            : undefined
        }
        notificationHref={
          navigationItems.some((item) => item.href === "/action-center")
            ? "/action-center"
            : undefined
        }
        unavailableItems={unavailableItems}
        userEmail={user.email}
        signOutAction={logout}
        contextRibbon={
          <ContextRibbon
            active={tenant.active}
            academic={academic}
            options={tenant.options}
            switchAction={switchContext}
          />
        }
      >
        {children}
      </ApplicationShell>
    </>
  );
}
