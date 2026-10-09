import { ArrowRight, Network, ShieldCheck, Workflow } from "lucide-react";
import {
  MarketingPageHeader,
  MarketingShell,
} from "@/components/marketing-shell";
import { ButtonLink } from "@/components/ui/button";

export default function ProductPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        eyebrow="The product"
        title="One source of truth, shaped around how schools actually work."
        description="SchoolFlow connects operational workflows without flattening different schools, responsibilities or academic structures into a generic template."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [
              Network,
              "Connected, not duplicated",
              "Admissions becomes enrollment. Payments update balances. Published results become available to authorized families.",
            ],
            [
              Workflow,
              "Server-authoritative workflows",
              "Critical transitions remain validated, transactional, auditable and protected by the established domain services.",
            ],
            [
              ShieldCheck,
              "Visibility with boundaries",
              "Identity, relationship, school scope, permissions and entitlements determine what each person may see and do.",
            ],
          ].map(([Icon, title, text]) => (
            <article
              key={String(title)}
              className="border-border rounded-2xl border p-7"
            >
              <Icon aria-hidden="true" className="text-brand size-7" />
              <h2 className="mt-5 text-xl font-bold">{String(title)}</h2>
              <p className="text-muted-foreground mt-3 leading-7">
                {String(text)}
              </p>
            </article>
          ))}
        </div>
        <div className="bg-background mt-12 rounded-3xl p-7 sm:p-10">
          <p className="text-brand text-sm font-bold tracking-wider uppercase">
            A coherent operating flow
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            From first enquiry to long-term school history.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-3xl leading-7">
            SchoolFlow preserves the relationships between applicants, students,
            guardians, enrollment, attendance, finance, assessment,
            communication and reporting—while keeping every action within the
            correct school context.
          </p>
          <ButtonLink href="/modules" className="mt-7">
            Explore modules <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
        </div>
      </section>
    </MarketingShell>
  );
}
