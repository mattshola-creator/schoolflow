"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Building2, LayoutDashboard, Menu, X } from "lucide-react";

export type WorkspaceNavigationItem = {
  href: string;
  label: string;
};

type WorkspaceNavigationProps = {
  items: WorkspaceNavigationItem[];
  userEmail?: string;
  variant: "desktop" | "mobile";
};

const dashboardItem: WorkspaceNavigationItem = {
  href: "/dashboard",
  label: "Dashboard",
};

function isCurrentPath(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`))
  );
}

function NavigationLinks({
  items,
  onNavigate,
}: {
  items: WorkspaceNavigationItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const links = [dashboardItem, ...items];

  return (
    <nav aria-label="Workspace" className="space-y-1">
      {links.map((item) => {
        const current = isCurrentPath(pathname, item.href);
        const Icon = item.href === "/dashboard" ? LayoutDashboard : null;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            onClick={onNavigate}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
              current
                ? "bg-emerald-50 text-emerald-900"
                : "text-slate-600 hover:bg-white hover:text-slate-950"
            }`}
          >
            {Icon ? (
              <Icon aria-hidden="true" className="size-4 shrink-0" />
            ) : null}
            <span className="min-w-0 break-words">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceNavigation({
  items,
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
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;

      const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
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
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [open]);

  if (variant === "desktop") {
    return (
      <div className="sticky top-4 py-6 pr-5">
        <NavigationLinks items={items} />
      </div>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-workspace-navigation"
        aria-label="Open workspace navigation"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Dismiss workspace navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />
          <aside
            ref={panelRef}
            id="mobile-workspace-navigation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-workspace-navigation-title"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,calc(100vw-3rem))] flex-col overflow-y-auto bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-800 text-white">
                  <Building2 aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p
                    id="mobile-workspace-navigation-title"
                    className="font-semibold text-slate-950"
                  >
                    SchoolFlow
                  </p>
                  {userEmail ? (
                    <p className="truncate text-xs text-slate-500">
                      {userEmail}
                    </p>
                  ) : null}
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close workspace navigation"
                onClick={() => setOpen(false)}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="flex-1 px-4 py-4">
              <NavigationLinks
                items={items}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
