import Link from "next/link";
import {
  evaluateAccess,
  type AuthorizationSnapshot,
} from "@/features/authorization/evaluator";

const sections = [
  {
    href: "/finance/overview",
    label: "Overview",
    permission: "finance.view",
    feature: undefined,
  },
  {
    href: "/finance",
    label: "Fee setup",
    permission: "finance.view",
    feature: "finance.fee_management",
  },
  {
    href: "/finance/billing",
    label: "Student bills",
    permission: "finance.billing.view",
    feature: "finance.billing",
  },
  {
    href: "/finance/payments",
    label: "Collections",
    permission: "finance.payments.view",
    feature: "finance.collections",
  },
  {
    href: "/finance/expenses",
    label: "Expenses",
    permission: "finance.expenses.view",
    feature: "finance.expenses",
  },
  {
    href: "/finance/reports",
    label: "Reports",
    permission: "finance.reports.view",
    feature: "finance.reporting",
  },
] as const;

export function FinanceWorkspaceNav({
  authorization,
  currentPath,
}: {
  authorization: AuthorizationSnapshot;
  currentPath: string;
}) {
  const available = sections.filter(
    (section) =>
      evaluateAccess(authorization, {
        permission: section.permission,
        module: "finance",
        feature: section.feature,
      }).allowed,
  );

  return (
    <nav
      aria-label="Finance workspace sections"
      className="w-full min-w-0 sm:w-auto"
    >
      <ul className="flex min-w-0 flex-wrap gap-2">
        {available.map((section) => {
          const current = currentPath === section.href;
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-semibold whitespace-nowrap transition-colors ${current ? "border-tenant-accent bg-tenant-accent text-white" : "border-border bg-surface text-slate-700 hover:bg-slate-50"}`}
              >
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
