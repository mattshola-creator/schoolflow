"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  GraduationCap,
  House,
  Menu,
  MessageSquareText,
  Settings2,
  UsersRound,
  X,
} from "lucide-react";

export type WorkspaceNavigationItem = {
  href: string;
  label: string;
  group?: string;
};
export type UnavailableNavigationItem = { label: string; reason: string };

type WorkspaceNavigationProps = {
  collapsed?: boolean;
  homeHref?: string;
  items: WorkspaceNavigationItem[];
  onCollapsedChange?: (collapsed: boolean) => void;
  unavailableItems?: UnavailableNavigationItem[];
  userEmail?: string;
  variant: "desktop" | "mobile";
};

const groupIcons = {
  Home: House,
  People: UsersRound,
  Academics: GraduationCap,
  Operations: CircleEllipsis,
  Communication: MessageSquareText,
  Insights: BarChart3,
  Administration: Settings2,
} as const;
const groupOrder = [
  "Home",
  "People",
  "Academics",
  "Operations",
  "Communication",
  "Insights",
  "Administration",
];

function isCurrentPath(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`))
  );
}

function NavigationLinks({
  collapsed = false,
  homeHref = "/dashboard",
  items,
  unavailableItems = [],
  onNavigate,
}: {
  collapsed?: boolean;
  homeHref?: string;
  items: WorkspaceNavigationItem[];
  unavailableItems?: UnavailableNavigationItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const allItems = [{ href: homeHref, label: "Home", group: "Home" }, ...items];
  const groups = groupOrder
    .map((label) => ({
      label,
      items: allItems.filter((item) => item.group === label),
    }))
    .filter((group) => group.items.length);
  return (
    <nav aria-label="Workspace" className="space-y-4">
      {groups.map((group) => {
        const GroupIcon =
          groupIcons[group.label as keyof typeof groupIcons] ?? BookOpenCheck;
        return (
          <section
            key={group.label}
            aria-labelledby={`nav-${group.label.toLowerCase()}`}
          >
            <h2
              id={`nav-${group.label.toLowerCase()}`}
              className={
                collapsed
                  ? "sr-only"
                  : "px-3 text-[0.65rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
              }
            >
              {group.label}
            </h2>
            <div className={collapsed ? "space-y-1" : "mt-1 space-y-1"}>
              {group.items.map((item) => {
                const current = isCurrentPath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                    onClick={onNavigate}
                    className={`group flex min-h-11 items-center rounded-xl text-sm font-semibold ${collapsed ? "justify-center px-2" : "gap-3 px-3"} ${current ? "bg-tenant-accent-soft text-tenant-accent-strong shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}
                  >
                    <GroupIcon
                      aria-hidden="true"
                      className={`size-4 shrink-0 ${current ? "text-tenant-accent" : "text-slate-400 group-hover:text-slate-700"}`}
                    />
                    {collapsed ? null : (
                      <span className="min-w-0 break-words">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
      {unavailableItems.length && !collapsed ? (
        <section aria-labelledby="nav-unavailable">
          <h2
            id="nav-unavailable"
            className="px-3 text-[0.65rem] font-bold tracking-[0.16em] text-slate-400 uppercase"
          >
            Unavailable
          </h2>
          <ul className="mt-1 space-y-1">
            {unavailableItems.map((item) => (
              <li
                key={item.label}
                className="rounded-xl px-3 py-2 text-sm text-slate-400"
              >
                <span className="font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-xs leading-5">
                  {item.reason}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </nav>
  );
}

export function WorkspaceNavigation({
  collapsed = false,
  homeHref = "/dashboard",
  items,
  onCollapsedChange,
  unavailableItems = [],
  userEmail,
  variant,
}: WorkspaceNavigationProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior =
      document.documentElement.style.overscrollBehavior;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overscrollBehavior =
        previousOverscrollBehavior;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [open]);

  if (variant === "desktop")
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavigationLinks
            collapsed={collapsed}
            homeHref={homeHref}
            items={items}
            unavailableItems={unavailableItems}
          />
        </div>
        <div className="border-border border-t p-3">
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => onCollapsedChange?.(!collapsed)}
            className={`text-muted-foreground hover:bg-surface-subtle flex min-h-11 w-full items-center rounded-xl text-sm font-semibold ${collapsed ? "justify-center" : "gap-3 px-3"}`}
          >
            {collapsed ? (
              <ChevronRight aria-hidden="true" className="size-4" />
            ) : (
              <ChevronLeft aria-hidden="true" className="size-4" />
            )}
            {collapsed ? null : "Collapse"}
          </button>
        </div>
      </div>
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-workspace-navigation"
        aria-label="Open workspace navigation"
        onClick={() => setOpen(true)}
        className="border-border text-muted-foreground hover:bg-surface-subtle inline-flex size-11 items-center justify-center rounded-xl border md:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 h-dvh overflow-hidden md:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Dismiss workspace navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
          />
          <aside
            ref={panelRef}
            id="mobile-workspace-navigation"
            data-testid="mobile-navigation-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-workspace-navigation-title"
            aria-describedby={
              userEmail ? "mobile-workspace-navigation-account" : undefined
            }
            className="absolute inset-y-0 left-0 flex h-dvh max-h-dvh w-[min(21rem,calc(100vw-1rem))] flex-col overflow-hidden bg-white shadow-2xl"
          >
            <div
              data-testid="mobile-navigation-header"
              className="border-border shrink-0 border-b px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-tenant-accent grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm">
                    <Building2 aria-hidden="true" className="size-5" />
                  </span>
                  <p
                    id="mobile-workspace-navigation-title"
                    className="min-w-0 font-semibold text-slate-950"
                  >
                    SchoolFlow
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close workspace navigation"
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:bg-surface-subtle inline-flex size-11 shrink-0 items-center justify-center rounded-xl"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
              {userEmail ? (
                <div
                  id="mobile-workspace-navigation-account"
                  className="bg-surface-subtle mt-3 min-w-0 rounded-xl px-3 py-2"
                >
                  <p className="text-[0.65rem] font-bold tracking-[0.12em] text-slate-400 uppercase">
                    Signed in account
                  </p>
                  <p className="mt-0.5 min-w-0 text-xs leading-5 break-words [word-break:normal] text-slate-600">
                    {userEmail}
                  </p>
                </div>
              ) : null}
            </div>
            <div
              data-testid="mobile-navigation-scroll"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <NavigationLinks
                homeHref={homeHref}
                items={items}
                unavailableItems={unavailableItems}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
