import { ArrowRight, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { SystemStatus } from "@/components/system-status";
import Link from "next/link";

export default function Home() {
  const principles = [
    "Organization-level tenant boundary",
    "Database-enforced access controls",
    "Responsive role-based experience",
    "Auditable, migration-driven changes",
  ];
  return (
    <main className="min-h-screen bg-[#f6f8f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-800 text-white">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight">SchoolFlow</p>
              <p className="text-xs text-slate-500">
                Multi-school operating platform
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
        <section aria-labelledby="page-title" className="max-w-2xl">
          <p className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Secure by design · One source of truth
          </p>
          <h1
            id="page-title"
            className="text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-6xl"
          >
            Run every school with clarity and control.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            SchoolFlow connects school operations, academics, finance, staff and
            parent services in one tenant-safe platform.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 font-semibold text-white shadow-sm"
            >
              Create your workspace
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <a
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              href="/api/health"
            >
              View health endpoint
            </a>
          </div>
          <ul
            className="mt-10 grid gap-3 text-sm text-slate-700 sm:grid-cols-2"
            aria-label="Foundation principles"
          >
            {principles.map((item) => (
              <li className="flex items-center gap-2" key={item}>
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 shrink-0 text-emerald-700"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <aside aria-label="Build status">
          <SystemStatus />
        </aside>
      </div>
    </main>
  );
}
