import Link from "next/link";
import { Building2, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { moduleNavigation } from "@/features/authorization/catalog";
import { evaluateAccess } from "@/features/authorization/evaluator";
import { requireUser } from "@/lib/auth";
import { loadEffectiveAuthorization } from "@/lib/authorization";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
  const authorization = await loadEffectiveAuthorization();
  const visibleModules = authorization
    ? moduleNavigation.filter(
        (item) => evaluateAccess(authorization, item).allowed,
      )
    : [];
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-semibold"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-800 text-white">
              <Building2 aria-hidden="true" className="size-4" />
            </span>
            SchoolFlow
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="hidden items-center gap-2 sm:flex">
              <UserRound aria-hidden="true" className="size-4" />
              {user.email}
            </span>
            <form action={logout}>
              <button className="inline-flex items-center gap-2 hover:text-slate-950">
                <LogOut aria-hidden="true" className="size-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[13rem_1fr]">
        <nav
          aria-label="Workspace"
          className="flex gap-2 overflow-x-auto border-b py-4 md:block md:border-r md:border-b-0 md:pr-5"
        >
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white"
          >
            <LayoutDashboard aria-hidden="true" className="size-4" /> Dashboard
          </Link>
          {visibleModules.map((item) => (
            <Link
              key={item.module}
              href={item.href ?? `/capabilities/${item.module}`}
              className="block shrink-0 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
