import type { HTMLAttributes, ReactNode } from "react";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
};

export function SurfaceCard({
  children,
  className,
  eyebrow,
  title,
  ...props
}: SurfaceCardProps) {
  return (
    <section
      className={[
        "border-border bg-surface rounded-2xl border p-5 shadow-sm sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {eyebrow ? (
        <p className="text-tenant-accent text-xs font-bold tracking-[0.12em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
      ) : null}
      <div className={title || eyebrow ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}
