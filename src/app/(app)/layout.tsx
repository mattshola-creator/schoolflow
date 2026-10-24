import { evaluateAccess } from "@/features/authorization/evaluator";
import { QaRevision } from "@/components/qa-revision";
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
import {
  shouldOpenOwnerDashboard,
  ownerEntryEnabled,
} from "@/features/owner-dashboard/entry";
import { loadOwnerAppearance } from "@/features/owner-dashboard/appearance";
import { experienceLinks } from "@/features/administration/experience-links";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, supabase } = await requireUser();
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
  const owner = await shouldOpenOwnerDashboard(
    supabase,
    user.id,
    tenant.active,
    authorization,
  );
  if (
    ownerEntryEnabled() &&
    authorization &&
    evaluateAccess(authorization, {
      module: "academics",
      permission: "academics.scores.view",
      feature: "academics.score_entry",
    }).allowed
  )
    navigationItems.push({
      href: "/workspace/teacher",
      label: "Teacher workspace",
      group: "Home",
    });
  navigationItems.push(
    ...experienceLinks(authorization, owner, ownerEntryEnabled()),
  );
  const appearance =
    owner && tenant.active?.schoolId
      ? await loadOwnerAppearance(
          supabase,
          user.id,
          tenant.active.organizationId,
          tenant.active.schoolId,
        )
      : null;
  const unavailableItems = workspace.unavailable.map((item) => ({
    label: item.label,
    reason: describeAccessReason(item.reason),
  }));

  return (
    <>
      <SkipLink />
      <ApplicationShell
        key={`${tenant.active?.organizationId}:${tenant.active?.schoolId}:${appearance?.themeId}`}
        enableAppearance={
          Boolean(appearance) ||
          Boolean(
            ownerEntryEnabled() &&
            authorization &&
            evaluateAccess(authorization, {
              module: "academics",
              permission: "academics.scores.view",
              feature: "academics.score_entry",
            }).allowed,
          )
        }
        schoolThemeId={appearance?.themeId}
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
          <>
            <QaRevision />
            <ContextRibbon
              active={tenant.active}
              academic={academic}
              options={tenant.options}
              switchAction={switchContext}
            />
          </>
        }
      >
        {children}
      </ApplicationShell>
    </>
  );
}
