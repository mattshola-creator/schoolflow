import Link from "next/link";
import { Building2, ChevronDown } from "lucide-react";
import {
  DesktopPublicNavigation,
  MobilePublicNavigation,
} from "@/components/public-navigation";
import { ButtonLink } from "@/components/ui/button";
import { SkipLink } from "@/components/ui/skip-link";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SkipLink />
      <header className="border-border/80 sticky top-0 z-40 border-b bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-18 sm:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="SchoolFlow public home"
          >
            <span className="bg-brand grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-sm sm:size-10">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-bold tracking-tight sm:text-lg">
                SchoolFlow
              </span>
              <span className="text-muted-foreground hidden text-[0.67rem] font-bold tracking-[0.12em] uppercase min-[380px]:block">
                One platform · every school
              </span>
            </span>
          </Link>
          <DesktopPublicNavigation />
          <div className="hidden items-center gap-2 sm:flex">
            <ButtonLink href="/login" variant="quiet">
              Sign in
            </ButtonLink>
            <ButtonLink href="/get-started">Explore onboarding</ButtonLink>
          </div>
          <MobilePublicNavigation />
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-lg font-bold text-white">SchoolFlow</p>
            <p className="mt-3 max-w-md text-sm leading-6">
              One connected operating platform for single schools and
              multi-school organizations.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Explore</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/modules">Modules</Link>
              <Link href="/plans">Prototype plans</Link>
              <Link href="/demo">Guided tour</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Support & trust</p>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/security">Security</Link>
              <Link href="/support">Help and FAQs</Link>
              <Link href="/login">Sign in</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 px-5 py-5 text-center text-xs text-slate-400">
          Prototype commercial experience. Legal and commercial terms require
          founder approval.
        </div>
      </footer>
    </div>
  );
}

export function MarketingEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-brand mb-4 text-sm font-bold tracking-[0.12em] uppercase">
      {children}
    </p>
  );
}
export function MarketingPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-background border-border border-b">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-18">
        <MarketingEyebrow>{eyebrow}</MarketingEyebrow>
        <h1 className="max-w-4xl text-[2.5rem] leading-[1.05] font-bold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-3xl text-base leading-7 sm:text-lg sm:leading-8">
          {description}
        </p>
      </div>
    </section>
  );
}
export function Disclosure({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="border-border group rounded-2xl border bg-white">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold">
        {title}
        <ChevronDown
          aria-hidden="true"
          className="size-5 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="text-muted-foreground border-border border-t px-5 py-4 leading-7">
        {children}
      </div>
    </details>
  );
}
