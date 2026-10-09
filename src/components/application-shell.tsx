"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  CircleHelp,
  LogOut,
  Search,
  UserRound,
} from "lucide-react";
import {
  WorkspaceNavigation,
  type UnavailableNavigationItem,
  type WorkspaceNavigationItem,
} from "@/components/workspace-navigation";

type ApplicationShellProps = {
  children: ReactNode;
  contextRibbon: ReactNode;
  helpHref?: string;
  homeHref?: string;
  items: WorkspaceNavigationItem[];
  notificationHref?: string;
  searchHref?: string;
  signOutAction?: () => void | Promise<void>;
  unavailableItems: UnavailableNavigationItem[];
  userEmail?: string;
};

export function ApplicationShell({
  children,
  contextRibbon,
  helpHref = "/experience-preview#guidance",
  homeHref = "/dashboard",
  items,
  notificationHref,
  searchHref,
  signOutAction,
  unavailableItems,
  userEmail,
}: ApplicationShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCollapsed(
        window.localStorage.getItem("sf-shell-collapsed") === "true",
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  function updateCollapsed(next: boolean) {
    setCollapsed(next);
    window.localStorage.setItem("sf-shell-collapsed", String(next));
  }
  return (
    <div className="bg-background min-h-screen">
      <header className="border-border bg-surface/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className="flex min-h-16 items-center gap-3 px-3 sm:px-5">
          <WorkspaceNavigation
            variant="mobile"
            homeHref={homeHref}
            items={items}
            unavailableItems={unavailableItems}
            userEmail={userEmail}
          />
          <Link
            href={homeHref}
            className="flex min-w-0 items-center gap-3 rounded-xl font-semibold"
          >
            <span className="bg-tenant-accent grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
            <span className="hidden text-lg tracking-tight text-slate-950 sm:inline">
              SchoolFlow
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {searchHref ? (
              <Link
                href={searchHref}
                aria-label="Global search"
                title="Global search"
                className="text-muted-foreground hover:bg-surface-subtle inline-flex size-11 items-center justify-center rounded-xl"
              >
                <Search aria-hidden="true" className="size-5" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-label="Global search unavailable"
                title="Global search is not available in this workspace"
                className="inline-flex size-11 cursor-not-allowed items-center justify-center rounded-xl text-slate-300"
              >
                <Search aria-hidden="true" className="size-5" />
              </button>
            )}
            {notificationHref ? (
              <Link
                href={notificationHref}
                aria-label="Notifications and actions"
                title="Notifications and actions"
                className="text-muted-foreground hover:bg-surface-subtle inline-flex size-11 items-center justify-center rounded-xl"
              >
                <Bell aria-hidden="true" className="size-5" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-label="Notifications unavailable"
                title="Notifications are not available in this workspace"
                className="inline-flex size-11 cursor-not-allowed items-center justify-center rounded-xl text-slate-300"
              >
                <Bell aria-hidden="true" className="size-5" />
              </button>
            )}
            <Link
              href={helpHref}
              aria-label="Help and guidance"
              title="Help and guidance"
              className="text-muted-foreground hover:bg-surface-subtle hidden size-11 items-center justify-center rounded-xl sm:inline-flex"
            >
              <CircleHelp aria-hidden="true" className="size-5" />
            </Link>
            <details className="relative">
              <summary
                className="text-muted-foreground hover:bg-surface-subtle flex size-11 cursor-pointer list-none items-center justify-center rounded-xl"
                aria-label={
                  userEmail
                    ? `Open account menu for ${userEmail}`
                    : "Open account menu"
                }
                title={userEmail ? `Account: ${userEmail}` : "Account"}
              >
                <UserRound aria-hidden="true" className="size-5" />
              </summary>
              <div className="border-border bg-surface absolute right-0 mt-2 w-64 rounded-xl border p-2 shadow-lg">
                <p className="px-3 py-2 text-xs font-medium break-all text-slate-500">
                  {userEmail ?? "Signed in"}
                </p>
                <Link
                  href={helpHref}
                  className="hover:bg-surface-subtle flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700 sm:hidden"
                >
                  <CircleHelp aria-hidden="true" className="size-4" /> Help and
                  guidance
                </Link>
                {signOutAction ? (
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="hover:bg-surface-subtle flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700"
                    >
                      <LogOut aria-hidden="true" className="size-4" /> Sign out
                    </button>
                  </form>
                ) : (
                  <p className="px-3 py-2 text-xs leading-5 text-slate-500">
                    Synthetic reference preview — no account session
                  </p>
                )}
              </div>
            </details>
          </div>
        </div>
      </header>
      <div
        className={
          collapsed
            ? "grid min-h-[calc(100vh-4rem)] md:grid-cols-[4.75rem_minmax(0,1fr)]"
            : "grid min-h-[calc(100vh-4rem)] md:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)]"
        }
      >
        <aside className="border-border bg-surface hidden border-r md:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <WorkspaceNavigation
              variant="desktop"
              homeHref={homeHref}
              collapsed={collapsed}
              onCollapsedChange={updateCollapsed}
              items={items}
              unavailableItems={unavailableItems}
            />
          </div>
        </aside>
        <div className="min-w-0">
          <div className="border-border bg-surface/60 border-b px-3 py-2 sm:px-5 sm:py-3 lg:px-8">
            {contextRibbon}
          </div>
          <div
            id="main-content"
            tabIndex={-1}
            className="mx-auto max-w-[96rem] min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
