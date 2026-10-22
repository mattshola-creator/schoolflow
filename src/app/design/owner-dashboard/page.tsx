import { OwnerContextError } from "@/features/owner-dashboard/model";
import { AuthorizationError } from "@/lib/authorization";
import { notFound } from "next/navigation";
import { ApplicationShell } from "@/components/application-shell";
import { ContextRibbon } from "@/components/context-ribbon";
import { SkipLink } from "@/components/ui/skip-link";
import {
  buildWorkspaceAccess,
  describeAccessReason,
} from "@/features/authorization/navigation";
import { loadOwnerDashboard } from "@/features/owner-dashboard/service";
import { OwnerDashboard } from "@/features/owner-dashboard/view";
import "@/features/showroom/visualizations.css";
import { logout, switchContext } from "@/app/(app)/actions";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ appearance?: string }>;
}) {
  const query = await searchParams;
  if (
    (process.env.SCHOOLFLOW_SHELL_REVIEW !== "true" ||
      process.env.NEXT_PUBLIC_SUPABASE_URL !==
        "https://afqykqlxecpzspjoyegc.supabase.co") &&
    process.env.NODE_ENV !== "development"
  )
    notFound();
  const { authorization, tenant, academic, userEmail, dto } =
    await loadOwnerDashboard().catch((error) => {
      if (
        error instanceof AuthorizationError ||
        error instanceof OwnerContextError
      )
        notFound();
      throw error;
    });
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
        enableAppearance={query.appearance !== "legacy"}
        items={items}
        unavailableItems={workspace.unavailable.map((item) => ({
          label: item.label,
          reason: describeAccessReason(item.reason),
        }))}
        userEmail={userEmail}
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
        <OwnerDashboard data={dto} />
      </ApplicationShell>
    </>
  );
}
