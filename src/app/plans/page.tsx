import { CheckCircle2 } from "lucide-react";
import {
  MarketingPageHeader,
  MarketingShell,
} from "@/components/marketing-shell";
import { ButtonLink } from "@/components/ui/button";
import { prototypePlans } from "@/features/marketing/catalog";

export default function PlansPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        eyebrow="Prototype packaging"
        title="Choose a foundation, then shape it around your schools."
        description="This review surface demonstrates plan comparison and expansion journeys. Names, prices, limits and final inclusions are not commercially approved."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div
          role="note"
          className="border-status-warning bg-status-warning-soft rounded-2xl border p-5 text-sm"
        >
          <strong>Founder decision required:</strong> no binding price,
          discount, school limit or billing commitment is presented in PX2.
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {prototypePlans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl border p-7 ${"featured" in plan && plan.featured ? "border-brand bg-brand-soft shadow-[var(--shadow-md)]" : "border-border bg-white"}`}
            >
              <p className="text-brand text-xs font-bold tracking-wider uppercase">
                Prototype plan
              </p>
              <h2 className="mt-3 text-2xl font-bold">{plan.name}</h2>
              <p className="text-muted-foreground mt-3 min-h-14">
                {plan.audience}
              </p>
              <p className="mt-6 text-3xl font-bold">Pricing to be decided</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm">
                    <CheckCircle2
                      aria-hidden="true"
                      className="text-brand size-5 shrink-0"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-6 text-xs leading-5">
                {plan.note}
              </p>
              <ButtonLink
                href="/get-started"
                variant={
                  "featured" in plan && plan.featured ? "primary" : "secondary"
                }
                className="mt-6 w-full"
              >
                Explore this structure
              </ButtonLink>
            </article>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
