import { ArrowRight, PlayCircle } from "lucide-react";
import {
  MarketingPageHeader,
  MarketingShell,
} from "@/components/marketing-shell";
import { ButtonLink } from "@/components/ui/button";
import { demoPersonas } from "@/features/marketing/catalog";

export default function DemoPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        eyebrow="Guided product tour"
        title="See SchoolFlow through the people who use it."
        description="Explore what SchoolFlow helps each person accomplish. Every example on this page is illustrative and uses no real school data."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h2 className="text-2xl font-bold">Choose a perspective</h2>
          <div className="mt-5 grid gap-3">
            {demoPersonas.map((persona, index) => (
              <div
                key={persona.title}
                className="border-border flex items-center gap-4 rounded-2xl border bg-white p-4"
              >
                <span className="bg-brand-soft text-brand grid size-9 place-items-center rounded-xl text-sm font-bold">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{persona.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">
                    {persona.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
          <span className="grid size-14 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200">
            <PlayCircle aria-hidden="true" className="size-7" />
          </span>
          <h2 className="mt-7 text-3xl font-bold">
            A coherent synthetic school group
          </h2>
          <p className="mt-4 leading-8 text-slate-300">
            A future Demo & Training Organization will contain fictional
            Nursery/Primary and Secondary schools with connected, resettable
            data. It will never copy a real tenant or make persona switching
            available to ordinary production users.
          </p>
          <div className="mt-7 rounded-2xl bg-white/8 p-5 text-sm text-slate-200">
            <strong>Prototype boundary:</strong> this page does not create demo
            credentials, impersonate users or query private production records.
          </div>
          <ButtonLink
            href="/product"
            variant="secondary"
            className="mt-7 bg-white"
          >
            Continue product tour{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
        </div>
      </section>
    </MarketingShell>
  );
}
