import type { ReactNode } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-3 text-slate-950"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-800 text-white">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <span className="font-semibold">SchoolFlow</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}
export const fieldClass =
  "mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";
export const buttonClass =
  "inline-flex h-11 w-full items-center justify-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
