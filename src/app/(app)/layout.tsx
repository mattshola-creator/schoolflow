import Link from "next/link";
import { Building2, LogOut, UserRound } from "lucide-react";
import { WorkspaceNavigation } from "@/components/workspace-navigation";
import { moduleNavigation } from "@/features/authorization/catalog";
import { evaluateAccess } from "@/features/authorization/evaluator";
import { requireUser } from "@/lib/auth";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
  const authorization = await loadEffectiveAuthorization();
  const visibleModules = authorization
    ? moduleNavigation.filter(
        (item) => evaluateAccess(authorization, item).allowed,
      )
    : [];
  const navigationItems = visibleModules.map((item) => ({
    href: item.href ?? `/capabilities/${item.module}`,
    label: item.label,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-800 text-white">
              <Building2 aria-hidden="true" className="size-4" />
            </span>
            <span className="truncate">SchoolFlow</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 text-sm text-slate-600 sm:gap-3">
            <span className="hidden items-center gap-2 sm:flex">
              <UserRound aria-hidden="true" className="size-4" />
              {user.email}
            </span>
            <WorkspaceNavigation
              variant="mobile"
              items={navigationItems}
              userEmail={user.email}
            />
            <form action={logout}>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
                <LogOut aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
                <span className="sr-only sm:hidden">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl px-4 sm:px-5 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8">
        <aside className="hidden min-h-[calc(100vh-4.75rem)] border-r md:block">
          <WorkspaceNavigation variant="desktop" items={navigationItems} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
