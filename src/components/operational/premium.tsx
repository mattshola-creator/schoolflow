import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/** Presentation only: callers must supply already-authorized values and links. */
export function ExecutiveMetric({
  title,
  value,
  children,
  href,
  linkLabel,
}: {
  title: string;
  value: string;
  children: ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <article
      className="relative min-w-0 overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6"
      style={{
        background: "var(--shell-surface,white)",
        color: "var(--shell-ink,#17211d)",
        borderColor: "var(--shell-border,#d8e0dc)",
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background:
            "linear-gradient(90deg,var(--shell-primary,#087c57),transparent)",
        }}
      />
      <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
      <p className="my-3 text-4xl font-semibold tracking-tight break-words tabular-nums">
        {value}
      </p>
      <div
        className="text-sm leading-6"
        style={{ color: "var(--shell-muted,#52615a)" }}
      >
        {children}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {linkLabel}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  );
}

export function ExecutiveHeader({
  eyebrow,
  title,
  context,
  children,
}: {
  eyebrow: string;
  title: string;
  context: string;
  children?: ReactNode;
}) {
  return (
    <header
      className="relative isolate min-w-0 overflow-hidden rounded-3xl p-5 shadow-sm sm:p-8"
      style={{
        background: "var(--shell-nav,#073d2b)",
        color: "var(--shell-nav-ink,white)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top right,rgba(214,174,98,.12),transparent 65%),linear-gradient(125deg,transparent,rgba(255,255,255,.04))",
        }}
      />
      <p className="text-xs font-semibold tracking-widest uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 max-w-4xl text-3xl leading-tight font-semibold tracking-tight break-words sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 break-words">{context}</p>
      {children ? (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-current/20 pt-5">
          {children}
        </div>
      ) : null}
    </header>
  );
}
