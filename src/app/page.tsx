import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { MarketingEyebrow, MarketingShell } from "@/components/marketing-shell";
import { publicModules } from "@/features/marketing/catalog";

export default function Home() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_85%_15%,var(--brand-soft),transparent_34%),linear-gradient(180deg,#fff_0%,#f5f7f7_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <MarketingEyebrow>Clarity for every school</MarketingEyebrow>
            <h1 className="max-w-3xl text-5xl leading-[1.02] font-bold tracking-[-0.05em] text-balance sm:text-7xl">
              One calm operating system for your whole school group.
            </h1>
            <p className="text-muted-foreground mt-7 max-w-2xl text-lg leading-8 sm:text-xl">
              Bring people, academics, operations and insight into one secure
              platform—without forcing every school into the same way of
              working.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/get-started" size="large">
                Explore SchoolFlow{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </ButtonLink>
              <ButtonLink href="/demo" size="large" variant="secondary">
                <PlayCircle aria-hidden="true" className="size-4" />
                Take the guided tour
              </ButtonLink>
            </div>
            <p className="text-muted-foreground mt-5 text-sm">
              Prototype experience · no pricing commitment · no production data
            </p>
          </div>
          <div className="border-border rounded-[2rem] border bg-white p-3 shadow-[var(--shadow-lg)]">
            <div className="rounded-[1.45rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-emerald-300 uppercase">
                    Organization view
                  </p>
                  <p className="mt-1 font-semibold">Unity Learning Group</p>
                </div>
                <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs text-emerald-200">
                  Synthetic preview
                </span>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["3", "schools"],
                  ["1,284", "learners"],
                  ["94%", "attendance"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/8 p-4">
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="mt-1 text-xs text-slate-300">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-2xl bg-white p-5 text-slate-950">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">This week</p>
                  <span className="text-brand text-xs font-semibold">
                    Authorized schools
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    "Admissions ready for review",
                    "Fee collection on track",
                    "Published results available",
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="bg-brand-soft text-brand grid size-8 place-items-center rounded-lg text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-border border-y bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 text-sm sm:px-8 md:grid-cols-3">
          {[
            [
              ShieldCheck,
              "Tenant-safe by design",
              "School and organization boundaries stay authoritative.",
            ],
            [
              Layers3,
              "Modular by choice",
              "Enable capabilities as your operating needs grow.",
            ],
            [
              Sparkles,
              "Human to use",
              "Clear workflows for staff, families and learners.",
            ],
          ].map(([Icon, title, text]) => (
            <div className="flex gap-3" key={String(title)}>
              <Icon
                aria-hidden="true"
                className="text-brand mt-0.5 size-5 shrink-0"
              />
              <div>
                <p className="font-bold">{String(title)}</p>
                <p className="text-muted-foreground mt-1">{String(text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <MarketingEyebrow>Connected capabilities</MarketingEyebrow>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              Start with what matters. Add what comes next.
            </h2>
          </div>
          <Link className="text-brand font-bold" href="/modules">
            Explore all modules →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publicModules
            .slice(0, 6)
            .map(({ icon: Icon, title, description }) => (
              <article
                className="border-border hover:border-brand-border rounded-2xl border bg-white p-6 transition-colors"
                key={title}
              >
                <span className="bg-brand-soft text-brand grid size-11 place-items-center rounded-xl">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="text-muted-foreground mt-2 leading-7">
                  {description}
                </p>
              </article>
            ))}
        </div>
      </section>
      <section className="bg-brand text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold tracking-[0.12em] text-emerald-200 uppercase">
              Designed for growth
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              See the whole organization. Respect every school&apos;s
              boundaries.
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "School-level context and permissions",
                "Organization-wide insight only when authorized",
                "Different academic structures per school",
                "One identity across legitimate responsibilities",
              ].map((x) => (
                <li className="flex gap-2 text-sm" key={x}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-5 shrink-0 text-emerald-200"
                  />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <ButtonLink
            href="/solutions"
            variant="secondary"
            size="large"
            className="bg-white"
          >
            Explore solutions
          </ButtonLink>
        </div>
      </section>
    </MarketingShell>
  );
}
