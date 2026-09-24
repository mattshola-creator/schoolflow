import type { ReactNode } from "react";

type PageHeaderProps = {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl min-w-0">
        {eyebrow ? (
          <p className="text-brand text-sm font-semibold">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance text-slate-950 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7 font-medium">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
