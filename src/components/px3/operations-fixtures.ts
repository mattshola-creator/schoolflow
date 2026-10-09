export const perspectiveIds = [
  "owner",
  "principal",
  "teacher",
  "admissions",
  "bursar",
  "assessment",
  "registrar",
] as const;

export type PerspectiveId = (typeof perspectiveIds)[number];
export type ScopeId = "all" | "primary" | "academy";

export const perspectiveOptions: ReadonlyArray<{
  id: PerspectiveId;
  label: string;
}> = [
  { id: "owner", label: "Organization Owner / Director" },
  { id: "principal", label: "Principal / Head Teacher" },
  { id: "teacher", label: "Teacher / Class Teacher" },
  { id: "admissions", label: "Admissions Officer" },
  { id: "bursar", label: "Bursar / Finance Officer" },
  { id: "assessment", label: "Assessment / Examination Officer" },
  { id: "registrar", label: "Student Administrator / Registrar" },
];

export const scopeOptions: ReadonlyArray<{ id: ScopeId; label: string }> = [
  { id: "all", label: "All authorized schools" },
  { id: "primary", label: "Cedarbridge Primary School" },
  { id: "academy", label: "Cedarbridge Academy" },
];

export type StudentFixture = {
  name: string;
  number: string;
  className: string;
  attendance: string;
  balanceCents: number;
  status: string;
  guardian: string;
};

export type SchoolFixture = {
  id: Exclude<ScopeId, "all">;
  label: string;
  shortLabel: string;
  learners: number;
  present: number;
  attendanceFollowUps: number;
  billedCents: number;
  collectedCents: number;
  verificationCents: number;
  verificationCount: number;
  pendingApprovals: number;
  admissionStages: readonly number[];
  overdueRegisters: number;
  lessonPlansApproved: number;
  lessonPlansTotal: number;
  scoreSheets: number;
  submittedSheets: number;
  assessmentBlockers: number;
  publishedSnapshots: number;
  activeMembers: number;
  pendingInvitations: number;
  students: readonly StudentFixture[];
};

const schools: Record<Exclude<ScopeId, "all">, SchoolFixture> = {
  primary: {
    id: "primary",
    label: "Cedarbridge Primary School",
    shortLabel: "Cedarbridge Primary",
    learners: 684,
    present: 651,
    attendanceFollowUps: 33,
    billedCents: 1_860_000_000,
    collectedCents: 1_488_000_000,
    verificationCents: 224_500_00,
    verificationCount: 3,
    pendingApprovals: 7,
    admissionStages: [11, 8, 4, 6, 3, 2],
    overdueRegisters: 1,
    lessonPlansApproved: 18,
    lessonPlansTotal: 20,
    scoreSheets: 24,
    submittedSheets: 20,
    assessmentBlockers: 1,
    publishedSnapshots: 11,
    activeMembers: 68,
    pendingInvitations: 3,
    students: [
      {
        name: "Amara Okafor",
        number: "CBP-0261",
        className: "Primary 5 A",
        attendance: "96%",
        balanceCents: 1_850_000,
        status: "Active",
        guardian: "Chidi Okafor",
      },
      {
        name: "Tobi Adeyemi",
        number: "CBP-0268",
        className: "Primary 5 A",
        attendance: "88%",
        balanceCents: 0,
        status: "Follow-up",
        guardian: "Kemi Adeyemi",
      },
    ],
  },
  academy: {
    id: "academy",
    label: "Cedarbridge Academy",
    shortLabel: "Cedarbridge Academy",
    learners: 600,
    present: 559,
    attendanceFollowUps: 41,
    billedCents: 1_288_000_000,
    collectedCents: 980_045_000,
    verificationCents: 9_325_000,
    verificationCount: 1,
    pendingApprovals: 5,
    admissionStages: [7, 4, 3, 3, 2, 1],
    overdueRegisters: 2,
    lessonPlansApproved: 14,
    lessonPlansTotal: 18,
    scoreSheets: 18,
    submittedSheets: 14,
    assessmentBlockers: 2,
    publishedSnapshots: 7,
    activeMembers: 58,
    pendingInvitations: 1,
    students: [
      {
        name: "Musa Ibrahim",
        number: "CBA-1142",
        className: "JSS 2 Gold",
        attendance: "93%",
        balanceCents: 4_275_000,
        status: "Active",
        guardian: "Aisha Ibrahim",
      },
      {
        name: "Zainab Lawal",
        number: "CBA-1168",
        className: "SS 1 Blue",
        attendance: "90%",
        balanceCents: 2_600_000,
        status: "Follow-up",
        guardian: "Haruna Lawal",
      },
    ],
  },
};

export type ScopeFixture = Omit<SchoolFixture, "id"> & { id: ScopeId };

export function getScopeFixture(scopeId: ScopeId): ScopeFixture {
  if (scopeId !== "all") return schools[scopeId];
  const primary = schools.primary;
  const academy = schools.academy;
  return {
    id: "all",
    label: "All authorized schools",
    shortLabel: "Organization-wide",
    learners: primary.learners + academy.learners,
    present: primary.present + academy.present,
    attendanceFollowUps:
      primary.attendanceFollowUps + academy.attendanceFollowUps,
    billedCents: primary.billedCents + academy.billedCents,
    collectedCents: primary.collectedCents + academy.collectedCents,
    verificationCents: primary.verificationCents + academy.verificationCents,
    verificationCount: primary.verificationCount + academy.verificationCount,
    pendingApprovals: primary.pendingApprovals + academy.pendingApprovals,
    admissionStages: primary.admissionStages.map(
      (value, index) => value + academy.admissionStages[index],
    ),
    overdueRegisters: primary.overdueRegisters + academy.overdueRegisters,
    lessonPlansApproved:
      primary.lessonPlansApproved + academy.lessonPlansApproved,
    lessonPlansTotal: primary.lessonPlansTotal + academy.lessonPlansTotal,
    scoreSheets: primary.scoreSheets + academy.scoreSheets,
    submittedSheets: primary.submittedSheets + academy.submittedSheets,
    assessmentBlockers: primary.assessmentBlockers + academy.assessmentBlockers,
    publishedSnapshots: primary.publishedSnapshots + academy.publishedSnapshots,
    activeMembers: primary.activeMembers + academy.activeMembers,
    pendingInvitations: primary.pendingInvitations + academy.pendingInvitations,
    students: [...primary.students, ...academy.students],
  };
}

export function percentage(numerator: number, denominator: number) {
  return denominator === 0
    ? "0.0%"
    : `${((numerator / denominator) * 100).toFixed(1)}%`;
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export const roleHomeCopy: Record<
  PerspectiveId,
  {
    eyebrow: string;
    title: string;
    description: string;
    tasks: readonly string[];
  }
> = {
  owner: {
    eyebrow: "Organization command view",
    title: "Your school group today",
    description:
      "Cross-school performance, material exceptions and decisions requiring director oversight.",
    tasks: [
      "Compare school operating health",
      "Review high-value finance exceptions",
      "Resolve cross-school approval blockers",
    ],
  },
  principal: {
    eyebrow: "School leadership",
    title: "Lead today’s school operations",
    description:
      "Attendance, teaching readiness and school-level approvals prioritized for the active scope.",
    tasks: [
      "Follow up overdue attendance registers",
      "Review teaching readiness",
      "Resolve school approval queue",
    ],
  },
  teacher: {
    eyebrow: "Teacher workspace",
    title: "Classes and learners needing you",
    description:
      "Today’s teaching, attendance and assessment work in one focused view.",
    tasks: [
      "Take class attendance",
      "Open next lesson workspace",
      "Complete outstanding score entries",
    ],
  },
  admissions: {
    eyebrow: "Admissions workspace",
    title: "Move applicants forward",
    description:
      "Applications, document checks and placement decisions for the selected operating scope.",
    tasks: [
      "Review submitted applications",
      "Complete document checks",
      "Prepare accepted applicants for enrollment",
    ],
  },
  bursar: {
    eyebrow: "Finance workspace",
    title: "Protect today’s collections",
    description:
      "Billing, collections, independent verification and financial exceptions requiring attention.",
    tasks: [
      "Verify bank transfers",
      "Review outstanding balances",
      "Reconcile today’s collection exceptions",
    ],
  },
  assessment: {
    eyebrow: "Assessment workspace",
    title: "Prepare results with confidence",
    description:
      "Score-sheet progress, blockers and publication readiness for the selected scope.",
    tasks: [
      "Resolve incomplete score sheets",
      "Review submitted assessments",
      "Check publication readiness",
    ],
  },
  registrar: {
    eyebrow: "Student administration",
    title: "Keep learner records complete",
    description:
      "Enrollment, guardian relationships and records requiring registrar follow-up.",
    tasks: [
      "Resolve enrollment exceptions",
      "Review guardian-link records",
      "Complete pending student documents",
    ],
  },
};

export function getScopedRolePresentation(
  scopeId: ScopeId,
  perspective: PerspectiveId,
) {
  const scope = getScopeFixture(scopeId);
  const base = roleHomeCopy[perspective];
  const organizationWide = scopeId === "all";

  if (perspective === "owner") {
    return {
      ...base,
      title: organizationWide
        ? "Your school group today"
        : `${scope.label} overview`,
      description: organizationWide
        ? "Cross-school performance, material exceptions and decisions requiring director oversight."
        : `Operational health, material exceptions and decisions for ${scope.label}.`,
      tasks: organizationWide
        ? [
            "Compare authorized school performance",
            "Review cross-school finance exceptions",
            "Resolve organization approval blockers",
          ]
        : [
            `Review ${scope.shortLabel} operating health`,
            "Resolve school finance exceptions",
            "Complete school-level approvals",
          ],
    };
  }

  return {
    ...base,
    title: organizationWide ? base.title : `${scope.label}: ${base.title}`,
    description: organizationWide
      ? `${base.description} Figures include both authorized schools.`
      : `${base.description} Figures and examples are limited to ${scope.label}.`,
  };
}

export const inaccessibleScope = {
  label: "Northgate School",
  reason: "No membership in this school",
};
