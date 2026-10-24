import Link from "next/link";
import type { ReactNode } from "react";
export const workspaceSurface = {
  background: "var(--shell-surface,white)",
  color: "var(--shell-ink,#17211d)",
  borderColor: "var(--shell-border,#d8e0dc)",
};
export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header
      className="flex min-w-0 flex-col gap-5 rounded-3xl border p-5 shadow-sm sm:p-8 lg:flex-row lg:items-end lg:justify-between"
      style={{
        background:
          "linear-gradient(125deg,transparent,rgba(255,255,255,.04)),var(--shell-nav,#073D2B)",
        color: "var(--shell-nav-ink,white)",
      }}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight break-words sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 break-words">
          {description}
        </p>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </header>
  );
}
export function WorkspaceCard({
  title,
  value,
  description,
  href,
}: {
  title: string;
  value: string;
  description: string;
  href: string;
}) {
  return (
    <article
      className="min-w-0 rounded-2xl border p-5 shadow-sm"
      style={workspaceSurface}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="my-3 text-3xl font-semibold tracking-tight break-words tabular-nums">
        {value}
      </p>
      <p className="text-sm leading-6">{description}</p>
      <Link
        href={href}
        className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Open workspace <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
