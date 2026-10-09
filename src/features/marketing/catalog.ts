import {
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarCheck2,
  FileCheck2,
  GraduationCap,
  Landmark,
  MessageSquareText,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

export const publicModules = [
  {
    icon: Building2,
    title: "Organization & schools",
    description:
      "Operate one school or a connected group without losing each school's context.",
    audience: "owners and organization administrators",
    capabilities: ["Schools and locations", "Roles and access"],
  },
  {
    icon: BookOpenCheck,
    title: "Academic setup",
    description:
      "Configure sessions, terms, classes, arms, subjects and academic locks per school.",
    audience: "school leaders and academic administrators",
    capabilities: ["Sessions and terms", "Classes and subjects"],
  },
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Keep learner, guardian, enrollment and placement history together in Student 360.",
    audience: "administrators and student-services teams",
    capabilities: ["Learner records", "Enrollment history"],
  },
  {
    icon: UsersRound,
    title: "Staff",
    description:
      "Manage staff profiles, assignments, positions, attendance and time-off workflows.",
    audience: "school leaders and HR administrators",
    capabilities: ["Staff records", "Assignments and time off"],
  },
  {
    icon: UserRoundCheck,
    title: "Admissions",
    description:
      "Move applicants from enquiry and assessment through offer, placement and enrollment.",
    audience: "admissions teams and school leaders",
    capabilities: ["Applications and offers", "Placement and enrollment"],
  },
  {
    icon: CalendarCheck2,
    title: "Attendance & teaching",
    description:
      "Run student and staff attendance, timetables, lesson plans, delivery and homework.",
    audience: "teachers, heads and operations teams",
    capabilities: ["Attendance and timetables", "Lessons and homework"],
  },
  {
    icon: WalletCards,
    title: "Finance",
    description:
      "Control billing, offline payments, allocations, receipts, expenses and reconciliation.",
    audience: "bursars, cashiers and authorized leaders",
    capabilities: ["Billing and receipts", "Expenses and reconciliation"],
  },
  {
    icon: FileCheck2,
    title: "Assessment & results",
    description:
      "Configure schemes, enter scores, approve results, publish report cards and promote learners.",
    audience: "teachers and academic leaders",
    capabilities: ["Score entry and approval", "Report cards and promotion"],
  },
  {
    icon: MessageSquareText,
    title: "Communication",
    description:
      "Publish targeted notices, participant-scoped messages and in-app notifications.",
    audience: "school teams, families and learners",
    capabilities: ["Notices and messages", "In-app notifications"],
  },
  {
    icon: ShieldCheck,
    title: "Documents & approvals",
    description:
      "Keep private school documents, tasks, approvals and auditable operational evidence.",
    audience: "authorized staff and management",
    capabilities: ["Private documents", "Tasks and approvals"],
  },
  {
    icon: BarChart3,
    title: "Management insights",
    description:
      "Give authorized leaders clear school and group-wide reporting without exposing unrelated records.",
    audience: "owners, directors and school leaders",
    capabilities: ["School dashboards", "Authorized multi-school reports"],
  },
  {
    icon: Landmark,
    title: "Modular SaaS controls",
    description:
      "Activate the right capabilities for each organization as its needs grow.",
    audience: "organization owners and platform operators",
    capabilities: ["Module activation", "Plan-aware availability"],
  },
] as const;

export const prototypePlans = [
  {
    name: "Foundation",
    audience: "A school establishing its digital operating core",
    note: "Prototype package — commercial name and price require founder approval.",
    features: [
      "Organization and school setup",
      "Students and staff",
      "Academic setup",
      "Documents and Action Center",
    ],
  },
  {
    name: "Operations",
    audience: "A school coordinating daily academic and administrative work",
    note: "Prototype package — inclusions remain configurable.",
    features: [
      "Everything in Foundation",
      "Admissions",
      "Attendance and teaching",
      "Communication",
    ],
    featured: true,
  },
  {
    name: "Multi-school",
    audience:
      "A group that needs school-level control and organization-wide insight",
    note: "Prototype package — pricing and school limits are undecided.",
    features: [
      "Everything in Operations",
      "Finance and assessment options",
      "Management reporting",
      "Multi-school scope controls",
    ],
  },
] as const;

export const demoPersonas = [
  {
    title: "Director / Organization Owner",
    description:
      "Oversee schools, people, finances and organization-wide insight.",
  },
  {
    title: "Principal / Head Teacher",
    description:
      "Coordinate daily school operations, staff and academic progress.",
  },
  {
    title: "Teacher",
    description: "Manage attendance, lessons, homework and learner results.",
  },
  {
    title: "Bursar",
    description:
      "Record billing, payments, receipts, expenses and reconciliation.",
  },
  {
    title: "Admissions Officer",
    description: "Guide applicants from enquiry through offer and enrollment.",
  },
  {
    title: "Parent",
    description:
      "View approved learner updates, notices, results and balances.",
  },
  {
    title: "Student",
    description:
      "See personal attendance, published results and school information.",
  },
] as const;
