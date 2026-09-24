import type { ReactNode } from "react";

type DetailListProps = {
  children: ReactNode;
  className?: string;
};

export function DetailList({ children, className }: DetailListProps) {
  return (
    <dl
      className={["grid grid-cols-1 gap-4 text-sm sm:grid-cols-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </dl>
  );
}

type DetailItemProps = {
  children: ReactNode;
  label: ReactNode;
};

export function DetailItem({ children, label }: DetailItemProps) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="font-medium break-words">{children}</dd>
    </div>
  );
}
