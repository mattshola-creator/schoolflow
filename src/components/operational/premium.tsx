import type { ReactNode } from "react";
import { ArrowUpRight, ChartNoAxesCombined } from "lucide-react";
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
      className="sf-executive-metric relative min-w-0 overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6"
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
      <div className="sf-metric-heading flex items-center gap-3">
        <span
          className="sf-metric-symbol grid size-10 shrink-0 place-items-center rounded-xl"
          aria-hidden="true"
        >
          <ChartNoAxesCombined size={21} />
        </span>
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
      </div>
      <p className="my-3 text-3xl font-semibold tracking-tight break-words tabular-nums">
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
          style={{ color: "var(--shell-ink,#17211d)" }}
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
      className="sf-executive-header relative isolate min-w-0 overflow-hidden rounded-3xl p-5 shadow-sm sm:p-8"
      style={{
        background: "var(--shell-hero,var(--shell-nav,#073d2b))",
        color: "var(--shell-hero-ink,var(--shell-nav-ink,white))",
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
      <svg
        className="sf-campus-art"
        viewBox="0 0 440 220"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M0 205Q100 145 220 185T440 175V220H0Z"
          fill="currentColor"
          opacity=".12"
        />
        <path
          d="M105 95 245 38 385 95"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        />
        <path d="M120 99H370V195H120Z" fill="currentColor" opacity=".13" />
        <path
          d="M135 99H355M135 190H355M155 110V179M210 110V179M280 110V179M335 110V179"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
        />
        <path
          d="M235 134H255V190H235ZM35 164V210M403 144V209"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        />
        <circle cx="35" cy="143" r="28" fill="currentColor" opacity=".2" />
        <circle cx="403" cy="121" r="32" fill="currentColor" opacity=".2" />
        <path d="M0 217H440" stroke="currentColor" strokeWidth="3" />
      </svg>
      <div className="sf-executive-copy relative">
        <p className="text-xs font-semibold tracking-widest uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl text-2xl leading-tight font-semibold tracking-tight break-words sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 break-words">
          {context}
        </p>
        {children ? (
          <div className="mt-5 flex flex-wrap gap-3 border-t border-current/20 pt-5">
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
