import {
  Disclosure,
  MarketingPageHeader,
  MarketingShell,
} from "@/components/marketing-shell";
import { ButtonLink } from "@/components/ui/button";

const faqs = [
  [
    "Can SchoolFlow support more than one school?",
    "Yes. SchoolFlow's existing tenancy model supports organizations, multiple schools, locations and authorized management groups while retaining school-level boundaries.",
  ],
  [
    "Do all schools need the same modules?",
    "No. Modules and features are controlled through plans, entitlements, permissions and feature availability.",
  ],
  [
    "Is the demo using real school data?",
    "No. The approved demo architecture requires coherent synthetic records and forbids production data copying.",
  ],
  [
    "Are the plans and prices final?",
    "No. The PX2 plan screen is a founder-review prototype. Commercial names, prices, limits and policies require separate approval.",
  ],
] as const;
export default function SupportPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        eyebrow="Help & resources"
        title="Clear answers before your school takes the next step."
        description="This prototype establishes the public support pattern. Contact operations and final legal content remain subject to founder and operational approval."
      />
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map(([q, a]) => (
            <Disclosure title={q} key={q}>
              {a}
            </Disclosure>
          ))}
        </div>
        <div className="bg-brand-soft border-brand-border mt-10 rounded-3xl border p-7">
          <h2 className="text-2xl font-bold">Need a guided conversation?</h2>
          <p className="text-muted-foreground mt-3">
            A public enquiry workflow is not activated in PX2. Use the
            onboarding prototype to prepare your organization structure without
            submitting production data.
          </p>
          <ButtonLink href="/get-started" className="mt-6">
            Explore onboarding
          </ButtonLink>
        </div>
        <p className="text-muted-foreground mt-8 text-sm">
          Privacy and terms pages require approved legal content before
          publication. PX2 does not create or imply legal commitments.
        </p>
      </section>
    </MarketingShell>
  );
}
