export type ChildId = "amara" | "musa";
export type FamilyPersona = "guardian" | "student";
export type PlatformPersona = "super" | "operations" | "support";

export const children = {
  amara: {
    id: "amara",
    name: "Amara Okafor",
    school: "Cedarbridge Primary School",
    className: "Primary 5 A",
    attendance: 96.8,
    present: 61,
    sessions: 63,
    billedCents: 48500000,
    paidCents: 36000000,
    result: "Published · First Term",
    average: 84.6,
    receipt: "SFP-2051",
    notice: "Primary sports day consent",
    document: "Published First Term report card",
  },
  musa: {
    id: "musa",
    name: "Musa Ibrahim",
    school: "Cedarbridge Academy",
    className: "JSS 2 Gold",
    attendance: 92.1,
    present: 58,
    sessions: 63,
    billedCents: 62500000,
    paidCents: 50000000,
    result: "Published · First Term",
    average: 78.2,
    receipt: "SFA-2048",
    notice: "Literature project reminder",
    document: "Published First Term report card",
  },
} as const;

export const unrelatedLearner = {
  id: "northgate-learner",
  name: "Unrelated learner",
  reason: "No guardian relationship and outside the authorized tenant",
} as const;

export function money(cents: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(cents / 100);
}

export const tenants = [
  {
    id: "cedarbridge",
    name: "Cedarbridge Learning Group",
    schools: 2,
    plan: "Growth reference",
    status: "Active",
    modules: 11,
    support: "Healthy",
    rollout: "Reporting · 100%",
  },
  {
    id: "brightpath",
    name: "Brightpath Schools",
    schools: 4,
    plan: "Multi-school reference",
    status: "Restricted",
    modules: 8,
    support: "Review billing contact",
    rollout: "Communication · 50%",
  },
  {
    id: "northstar",
    name: "Northstar College",
    schools: 1,
    plan: "Core reference",
    status: "Suspended",
    modules: 5,
    support: "Read-only investigation",
    rollout: "No active rollout",
  },
  {
    id: "oakfield",
    name: "Oakfield Education Trust",
    schools: 3,
    plan: "Growth reference",
    status: "Reactivated",
    modules: 10,
    support: "Post-reactivation watch",
    rollout: "Assessment · 25%",
  },
] as const;

export const platformPersonas = {
  super: {
    label: "Platform Super Admin",
    summary: "Platform governance, risk and high-impact oversight.",
    priorities: [
      "Review restricted tenants",
      "Inspect rollout risk",
      "Review privileged audit",
    ],
    navigation: ["Dashboard", "Organizations", "Catalog", "Rollouts", "Audit"],
  },
  operations: {
    label: "Platform Operations Admin",
    summary:
      "Day-to-day tenant operations, catalog oversight and support coordination.",
    priorities: [
      "Resolve support attention",
      "Review module adoption",
      "Prepare rollout impact",
    ],
    navigation: [
      "Dashboard",
      "Organizations",
      "Catalog",
      "Rollouts",
      "Support",
    ],
  },
  support: {
    label: "Platform Support Viewer",
    summary: "Read-only diagnostics and explicitly authorized tenant support.",
    priorities: [
      "Review support cases",
      "Read safe diagnostics",
      "Escalate access-sensitive work",
    ],
    navigation: ["Dashboard", "Organizations", "Support"],
  },
} as const;

export type BrandLayer = "platform" | "organization" | "school";

export const brandLayers = {
  platform: {
    label: "Platform defaults",
    name: "SchoolFlow",
    accent: "#147d64",
    source: "Fallback for every tenant",
  },
  organization: {
    label: "Organization branding",
    name: "Cedarbridge Learning Group",
    accent: "#2563eb",
    source: "Overrides platform defaults",
  },
  school: {
    label: "School branding",
    name: "Cedarbridge Academy",
    accent: "#7c3aed",
    source: "Overrides organization for this school",
  },
} as const;

export function effectiveBrand(layer: BrandLayer) {
  return brandLayers[layer];
}

export const searchRecords = [
  {
    label: "Amara Okafor",
    group: "Learners",
    scope: "Cedarbridge Primary",
    allowed: true,
  },
  {
    label: "SFP-2051",
    group: "Receipts",
    scope: "Cedarbridge Primary",
    allowed: true,
  },
  {
    label: "Northgate learner",
    group: "Restricted",
    scope: "Outside authorized scope",
    allowed: false,
  },
] as const;
