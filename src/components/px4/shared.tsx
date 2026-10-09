"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Layers3, ShieldCheck } from "lucide-react";
import { ApplicationShell } from "@/components/application-shell";
import { StatusBadge } from "@/components/ui/status-badge";

export const packLinks = [
  { href: "/px4-families", label: "Pack C · Families", group: "People" },
  {
    href: "/px4-platform",
    label: "Pack D · SaaS Platform",
    group: "Administration",
  },
  {
    href: "/px4-experience",
    label: "Pack E · Experience System",
    group: "Insights",
  },
];

export function PrototypeRibbon({
  primary,
  secondary,
  tertiary,
}: {
  primary: string;
  secondary: string;
  tertiary: string;
}) {
  return (
    <section
      aria-label="Synthetic prototype context"
      className="border-tenant-accent/15 bg-tenant-accent-soft/70 rounded-xl border px-3 py-2.5 shadow-sm sm:px-4"
    >
      <p className="text-tenant-accent-strong text-[0.65rem] font-bold tracking-[0.16em] uppercase">
        Synthetic PX4 context · production context unchanged
      </p>
      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-slate-800">
        <span className="break-words">{primary}</span>
        <span aria-hidden="true" className="text-slate-400">
          →
        </span>
        <span className="break-words">{secondary}</span>
        <span aria-hidden="true" className="text-slate-400">
          →
        </span>
        <span className="break-words">{tertiary}</span>
      </div>
    </section>
  );
}

export function PrototypeNotice({ children }: { children?: ReactNode }) {
  return (
    <div
      role="note"
      className="border-brand-border bg-brand-soft text-brand-strong mb-5 rounded-xl border px-4 py-3 text-sm leading-6"
    >
      <strong>Synthetic prototype.</strong>{" "}
      {children ??
        "No production records, permissions or configuration are changed."}
    </div>
  );
}

export function Px4Shell({
  children,
  ribbon,
  email,
  homeHref,
}: {
  children: ReactNode;
  ribbon: ReactNode;
  email: string;
  homeHref: string;
}) {
  return (
    <ApplicationShell
      contextRibbon={ribbon}
      homeHref={homeHref}
      helpHref={`${homeHref}#guidance`}
      notificationHref={`${homeHref}#notifications`}
      searchHref="/px4-experience#search"
      items={packLinks}
      unavailableItems={[
        { label: "Production mutations", reason: "Disabled throughout PX4" },
        { label: "PX5–PX7", reason: "Not authorized in this prototype" },
      ]}
      userEmail={email}
    >
      {children}
    </ApplicationShell>
  );
}

export function PackNavigation({
  current,
}: {
  current: "families" | "platform" | "experience";
}) {
  return (
    <nav
      aria-label="PX4 prototype packs"
      className="mb-6 grid gap-2 sm:grid-cols-3"
    >
      {packLinks.map((link) => {
        const active = link.href.endsWith(current);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`focus-visible:outline-focus-ring flex min-h-12 items-center gap-3 rounded-xl border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? "border-tenant-accent bg-tenant-accent-soft text-tenant-accent-strong" : "border-border bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {active ? (
              <ShieldCheck aria-hidden="true" className="size-4" />
            ) : (
              <Layers3 aria-hidden="true" className="size-4" />
            )}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  warning = false,
}: {
  label: string;
  value: string;
  detail: string;
  warning?: boolean;
}) {
  return (
    <article className="border-border bg-surface rounded-2xl border p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <StatusBadge tone={warning ? "warning" : "success"}>
          {warning ? "Attention" : "Current"}
        </StatusBadge>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
    </article>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="text-tenant-accent text-xs font-bold tracking-[0.14em] uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
    </header>
  );
}
