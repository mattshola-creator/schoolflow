import { DatabaseZap, Eye, KeyRound, ShieldCheck } from "lucide-react";
import {
  MarketingPageHeader,
  MarketingShell,
} from "@/components/marketing-shell";

const trust = [
  [
    ShieldCheck,
    "Tenant isolation",
    "Organization and school boundaries are enforced by application authorization and database row-level security.",
  ],
  [
    KeyRound,
    "Permission and entitlement checks",
    "A visible menu never replaces server authorization. Permissions, plans and feature availability remain authoritative.",
  ],
  [
    DatabaseZap,
    "Integrity-first workflows",
    "Finance, results and high-impact transitions use server-side validation, constraints, audit evidence and controlled state changes.",
  ],
  [
    Eye,
    "Data minimization",
    "Parents, students, staff and management see only the resources appropriate to their identity, relationship and scope.",
  ],
] as const;
export default function SecurityPage() {
  return (
    <MarketingShell>
      <MarketingPageHeader
        eyebrow="Security & trust"
        title="Broader insight without broader access."
        description="SchoolFlow's experience is built on the security and data-integrity foundations verified throughout M0–M13."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {trust.map(([Icon, title, text]) => (
            <article
              className="border-border rounded-2xl border p-7"
              key={title}
            >
              <Icon aria-hidden="true" className="text-brand size-7" />
              <h2 className="mt-5 text-xl font-bold">{title}</h2>
              <p className="text-muted-foreground mt-3 leading-7">{text}</p>
            </article>
          ))}
        </div>
        <div className="bg-background mt-12 rounded-3xl p-7">
          <h2 className="text-2xl font-bold">Transparent prototype boundary</h2>
          <p className="text-muted-foreground mt-3 leading-7">
            PX2 changes the public presentation only. It does not alter Supabase
            authentication, RLS, tenant isolation, permissions, entitlements,
            feature gates, operational services or production school data.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
