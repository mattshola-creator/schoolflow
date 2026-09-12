import Link from "next/link";
import { Building2, LogOut, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
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
      {children}
    </div>
  );
}
