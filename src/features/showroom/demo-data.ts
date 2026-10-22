import type { AttendanceDay } from "./charts";
import type {
  ChartPoint,
  ComparisonPoint,
  SchoolComparisonDatum,
} from "./chart-model";
import type { ShowroomRole } from "./catalog";

export const demoPeriod = "5–30 October 2026 · fictional window";
export const attendanceTrend: readonly ChartPoint[] = [
  {
    label: "Week 1",
    value: 91,
    detail: "910 present or late / 1,000 recorded marks",
  },
  { label: "Week 2", value: 93, detail: "930 / 1,000 recorded marks" },
  { label: "Week 3", value: 96, detail: "960 / 1,000 recorded marks" },
  { label: "Week 4", value: 94.8, detail: "948 / 1,000 recorded marks" },
];
export const personalTrend: readonly ChartPoint[] = [
  { label: "Week 1", value: 90, detail: "18 / 20 personal recorded marks" },
  { label: "Week 2", value: 95, detail: "19 / 20 personal recorded marks" },
  { label: "Week 3", value: 100, detail: "20 / 20 personal recorded marks" },
  { label: "Week 4", value: 95, detail: "19 / 20 personal recorded marks" },
];
export const teacherTrend: readonly ChartPoint[] = [
  { label: "Week 1", value: 92, detail: "46 / 50 assigned-class marks" },
  { label: "Week 2", value: 94, detail: "47 / 50 assigned-class marks" },
  { label: "Week 3", value: 90, detail: "45 / 50 assigned-class marks" },
  { label: "Week 4", value: 96, detail: "48 / 50 assigned-class marks" },
];
export const receiptsTrend: readonly ChartPoint[] = [
  { label: "Week 1", value: 95000000 },
  { label: "Week 2", value: 115000000 },
  { label: "Week 3", value: 142000000 },
  { label: "Week 4", value: 130000000 },
];
export const receiptMethods: readonly ChartPoint[] = [
  { label: "Cash", value: 182000000 },
  { label: "Bank transfer", value: 300000000 },
];
export const enrollmentComparison: readonly ComparisonPoint[] = [
  { label: "Nursery", first: 150, second: 138 },
  { label: "Primary", first: 330, second: 294 },
  { label: "Secondary", first: 170, second: 166 },
];
export const admissionsStages: readonly ChartPoint[] = [
  {
    label: "Applied",
    value: 32,
    detail: "32 applications currently in the applied status.",
  },
  {
    label: "Assessment",
    value: 28,
    detail: "28 applications currently undergoing assessment.",
  },
  {
    label: "Accepted",
    value: 19,
    detail: "19 applications currently have an accepted offer.",
  },
  {
    label: "Converted",
    value: 5,
    detail:
      "5 applications currently converted to enrollment. This is not a cohort conversion rate.",
  },
];
export const assessmentStages: readonly ChartPoint[] = [
  {
    label: "Draft",
    value: 6,
    detail:
      "6 draft batch rows in the selected scope, including any correction drafts.",
  },
  {
    label: "Submitted",
    value: 3,
    detail: "3 submitted batch rows awaiting review.",
  },
  {
    label: "Approved",
    value: 4,
    detail: "4 approved batch rows awaiting publication.",
  },
  {
    label: "Published",
    value: 18,
    detail:
      "18 current published batches. Historical snapshots remain separate and unchanged.",
  },
];
export const demoSchools: readonly SchoolComparisonDatum[] = [
  {
    schoolId: "fictional-primary",
    schoolName: "Riverside Primary · Demo",
    presentIncludingLate: 948,
    recordedMarks: 1000,
  },
  {
    schoolId: "fictional-secondary",
    schoolName: "Hillview Secondary · Demo",
    presentIncludingLate: 576,
    recordedMarks: 600,
  },
  {
    schoolId: "fictional-nursery",
    schoolName: "Meadow Nursery · Demo",
    presentIncludingLate: 190,
    recordedMarks: 200,
  },
];
const dates = [
  5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 19, 20, 21, 22, 23, 26, 27, 28, 29, 30,
];
export const attendanceDays: readonly AttendanceDay[] = dates.map(
  (day, index) => ({
    date: `2026-10-${String(day).padStart(2, "0")}`,
    label: String(day),
    present: index === 7 ? 0 : [96, 94, 89, 98, 95][index % 5],
    recorded: index === 7 ? 0 : 100,
  }),
);

export type DemoMetric = {
  label: string;
  value: string;
  definition: string;
  trend: readonly number[];
};
const schoolMetrics: readonly DemoMetric[] = [
  {
    label: "Active enrollments",
    value: "1,248",
    definition: "Enrollment rows · 2026/27 session",
    trend: [1120, 1160, 1200, 1248],
  },
  {
    label: "Recorded attendance",
    value: "94.8%",
    definition: "Latest demo week · 948 / 1,000 marks",
    trend: [91, 93, 96, 94.8],
  },
  {
    label: "Current publications",
    value: "18",
    definition: "Published batches · First Term",
    trend: [8, 12, 15, 18],
  },
  {
    label: "Pending approvals",
    value: "4",
    definition: "Requests in the fictional school scope",
    trend: [7, 6, 3, 4],
  },
];
export function demoMetrics(role: ShowroomRole): readonly DemoMetric[] {
  if (role === "platform")
    return [
      "Organizations",
      "Standard trials",
      "Subscription receipts",
      "Flagged registrations",
    ].map((label) => ({
      label,
      value: "—",
      definition: "Future privileged service · conceptual",
      trend: [],
    }));
  if (role === "finance")
    return [
      {
        label: "Verified receipts",
        value: "₦4.82m",
        definition: "5–30 Oct · NGN · fictional verified receipts",
        trend: [950000, 1150000, 1420000, 1300000],
      },
      {
        label: "Current outstanding",
        value: "₦2.16m",
        definition: "Current NGN balance · not window-limited",
        trend: [3000000, 2700000, 2400000, 2160000],
      },
      {
        label: "Awaiting verification",
        value: "8",
        definition: "Recorded payments · independent verification",
        trend: [12, 10, 6, 8],
      },
      {
        label: "Draft expenses",
        value: "3",
        definition: "School Finance · permitted view only",
        trend: [5, 4, 2, 3],
      },
    ];
  if (role === "admissions")
    return [
      {
        label: "Applications",
        value: "84",
        definition: "Current status snapshot · fictional school",
        trend: [40, 55, 72, 84],
      },
      {
        label: "In assessment",
        value: "28",
        definition: "Current application status",
        trend: [12, 19, 25, 28],
      },
      {
        label: "Accepted offers",
        value: "19",
        definition: "Current application status",
        trend: [5, 10, 15, 19],
      },
      {
        label: "Converted",
        value: "5",
        definition: "Current application status · not cohort rate",
        trend: [1, 2, 3, 5],
      },
    ];
  if (role === "teacher")
    return [
      {
        label: "Assigned classes",
        value: "2",
        definition: "Fictional teacher · current school",
        trend: [2, 2, 2, 2],
      },
      {
        label: "Recorded attendance",
        value: "96%",
        definition: "Latest demo week · 48 / 50 marks",
        trend: [92, 94, 90, 96],
      },
      {
        label: "Draft score sheets",
        value: "2",
        definition: "Assigned subject and classes only",
        trend: [4, 3, 1, 2],
      },
      {
        label: "Open tasks",
        value: "3",
        definition: "Tasks assigned to the demo teacher",
        trend: [5, 3, 2, 3],
      },
    ];
  if (role === "guardian" || role === "student")
    return [
      {
        label: role === "guardian" ? "Linked learners" : "Recorded marks",
        value: role === "guardian" ? "2" : "80",
        definition:
          role === "guardian"
            ? "Fictional authorized family relationships"
            : "Personal entries · fictional window",
        trend: role === "guardian" ? [1, 1, 2, 2] : [20, 40, 60, 80],
      },
      {
        label: "Recorded attendance",
        value: "95%",
        definition: "76 / 80 personal marks · 5–30 Oct",
        trend: [90, 95, 100, 95],
      },
      {
        label: "Published reports",
        value: "1",
        definition: "Selected learner · published snapshot",
        trend: [0, 0, 0, 1],
      },
      {
        label: role === "guardian" ? "Posted invoices" : "Unread notices",
        value: "2",
        definition:
          role === "guardian"
            ? "Authorized portal invoice count · demo"
            : "Addressed to the fictional learner",
        trend: [1, 2, 1, 2],
      },
    ];
  return schoolMetrics;
}

export function demoQueue(role: ShowroomRole) {
  const queues: Record<ShowroomRole, readonly string[]> = {
    owner: [
      "4 approval requests need attention",
      "2 overdue operational tasks",
      "3 submitted result batches",
    ],
    principal: [
      "Review submitted result batches",
      "Follow up on incomplete registers",
      "Open the authorized Action Center",
    ],
    teacher: [
      "Primary 4 Mathematics · draft score sheet",
      "Primary 5 Mathematics · lesson delivery",
      "Your assigned attendance register",
    ],
    finance: [
      "8 recorded payments await verification",
      "2 reconciliation items to review",
      "3 draft expenses to complete",
    ],
    admissions: [
      "6 document reviews to complete",
      "4 offer follow-ups",
      "12 placement checklists to inspect",
    ],
    guardian: [
      "Read a published school notice",
      "View the linked child’s report",
      "Check recorded attendance",
    ],
    student: [
      "View your published report",
      "Check your attendance",
      "Read your school notices",
    ],
    platform: [
      "Registration review · future milestone",
      "Subscription administration · future milestone",
      "Security operations · future milestone",
    ],
  };
  return queues[role];
}
