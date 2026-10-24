import type { ReactNode } from "react";
import {
  ExecutiveHeader,
  ExecutiveMetric,
} from "@/components/operational/premium";
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
    <ExecutiveHeader eyebrow={eyebrow} title={title} context={description}>
      {children}
    </ExecutiveHeader>
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
    <ExecutiveMetric
      title={title}
      value={value}
      href={href}
      linkLabel="Open workspace"
    >
      <p>{description}</p>
    </ExecutiveMetric>
  );
}
