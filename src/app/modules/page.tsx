import {
  MarketingPageHeader,
  MarketingShell,
} from "@/components/marketing-shell";
import { publicModules } from "@/features/marketing/catalog";

export default function ModulesPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        eyebrow="Modular platform"
        title="A complete platform that does not force every module on every school."
        description="These capabilities are built into SchoolFlow. Each organization chooses the modules it needs, and access remains controlled by plan, role and school."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publicModules.map(
            ({ icon: Icon, title, description, audience, capabilities }) => (
              <article
                key={title}
                className="border-border rounded-2xl border bg-white p-6"
              >
                <Icon aria-hidden="true" className="text-brand size-6" />
                <h2 className="mt-5 text-lg font-bold">{title}</h2>
                <p className="text-muted-foreground mt-2 leading-7">
                  {description}
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                  {capabilities.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <p className="mt-5 text-xs font-semibold text-slate-500">
                  For {audience}
                </p>
                <p className="bg-brand-soft text-brand mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold">
                  Implemented · activation controlled
                </p>
              </article>
            ),
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
