"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const publicNavigation = [
  ["Product", "/product"],
  ["Solutions", "/solutions"],
  ["Modules", "/modules"],
  ["Plans", "/plans"],
  ["Tour", "/demo"],
  ["Security", "/security"],
] as const;

function isActive(pathname: string | null, href: string) {
  return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
}

export function DesktopPublicNavigation() {
  const pathname = usePathname();
  return (
    <nav
      className="hidden items-center gap-0.5 lg:flex"
      aria-label="Public navigation"
    >
      {publicNavigation.map(([label, href]) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${active ? "bg-brand-soft text-brand" : "hover:bg-surface-subtle text-slate-600 hover:text-slate-950"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobilePublicNavigation() {
  const pathname = usePathname();
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
    const onKeyDown = (event: KeyboardEvent) => {
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
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="public-mobile-navigation"
        aria-label="Open public navigation"
        onClick={() => setOpen(true)}
        className="border-border text-muted-foreground hover:bg-surface-subtle inline-flex size-11 items-center justify-center rounded-xl border lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 h-dvh overflow-hidden lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Dismiss public navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
          />
          <aside
            ref={panelRef}
            id="public-mobile-navigation"
            data-testid="public-navigation-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-navigation-title"
            className="absolute inset-y-0 right-0 flex h-dvh max-h-dvh w-[min(21rem,calc(100vw-1rem))] flex-col overflow-hidden bg-white shadow-2xl"
          >
            <div className="border-border flex shrink-0 items-center justify-between border-b px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
              <div>
                <p
                  id="public-navigation-title"
                  className="font-bold text-slate-950"
                >
                  Explore SchoolFlow
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Product information and access
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close public navigation"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-surface-subtle inline-flex size-11 shrink-0 items-center justify-center rounded-xl"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div
              data-testid="public-navigation-scroll"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
            >
              <nav aria-label="Mobile public navigation" className="grid gap-1">
                {publicNavigation.map(([label, href]) => {
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors ${active ? "bg-brand-soft text-brand" : "hover:bg-surface-subtle text-slate-700"}`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-border mt-3 grid gap-2 border-t pt-3">
                <ButtonLink
                  href="/login"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </ButtonLink>
                <ButtonLink href="/get-started" onClick={() => setOpen(false)}>
                  Explore onboarding
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
