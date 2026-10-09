import { Building2, School, UsersRound } from "lucide-react";
import {
  MarketingPageHeader,
  MarketingShell,
} from "@/components/marketing-shell";
import { ButtonLink } from "@/components/ui/button";

const solutions = [
  [
    School,
    "Single-school clarity",
    "Bring academic setup, people, daily operations and school reporting into one workspace.",
  ],
  [
    Building2,
    "Multi-school control",
    "Give leaders a safe organization view while each school retains its own academic and operating context.",
  ],
  [
    UsersRound,
    "Role-focused work",
    "Present the right work to owners, heads, teachers, bursars, admissions teams, families and learners.",
  ],
] as const;
export default function SolutionsPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        eyebrow="Solutions"
        title="Built for the school you run today—and the group you are becoming."
        description="SchoolFlow supports Nursery, Primary and Secondary operations without assuming that every location shares the same classes, calendar or enabled modules."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {solutions.map(([Icon, title, text]) => (
            <article key={title} className="bg-background rounded-3xl p-7">
              <span className="bg-brand grid size-12 place-items-center rounded-2xl text-white">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <h2 className="mt-6 text-2xl font-bold">{title}</h2>
              <p className="text-muted-foreground mt-3 leading-7">{text}</p>
            </article>
          ))}
        </div>
        <div className="border-brand-border bg-brand-soft mt-12 rounded-3xl border p-7 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h2 className="text-2xl font-bold">Not sure where to start?</h2>
            <p className="text-muted-foreground mt-2">
              Explore a non-binding onboarding path built for founder review.
            </p>
          </div>
          <ButtonLink href="/get-started" className="mt-5 sm:mt-0">
            Explore onboarding
          </ButtonLink>
        </div>
      </section>
    </MarketingShell>
  );
}
