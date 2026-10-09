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
  },
  {
    icon: BookOpenCheck,
    title: "Academic setup",
    description:
      "Configure sessions, terms, classes, arms, subjects and academic locks per school.",
  },
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Keep learner, guardian, enrollment and placement history together in Student 360.",
  },
  {
    icon: UsersRound,
    title: "Staff",
    description:
      "Manage staff profiles, assignments, positions, attendance and time-off workflows.",
  },
  {
    icon: UserRoundCheck,
    title: "Admissions",
    description:
      "Move applicants from enquiry and assessment through offer, placement and enrollment.",
  },
  {
    icon: CalendarCheck2,
    title: "Attendance & teaching",
    description:
      "Run student and staff attendance, timetables, lesson plans, delivery and homework.",
  },
  {
    icon: WalletCards,
    title: "Finance",
    description:
      "Control billing, offline payments, allocations, receipts, expenses and reconciliation.",
  },
  {
    icon: FileCheck2,
    title: "Assessment & results",
    description:
      "Configure schemes, enter scores, approve results, publish report cards and promote learners.",
  },
  {
    icon: MessageSquareText,
    title: "Communication",
    description:
      "Publish targeted notices, participant-scoped messages and in-app notifications.",
  },
  {
    icon: ShieldCheck,
    title: "Documents & approvals",
    description:
      "Keep private school documents, tasks, approvals and auditable operational evidence.",
  },
  {
    icon: BarChart3,
    title: "Management insights",
    description:
      "View scoped operational reporting without turning management access into a security bypass.",
  },
  {
    icon: Landmark,
    title: "Modular SaaS controls",
    description:
      "Activate capabilities through plans, entitlements and feature gates as an organization grows.",
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
  "Director / Organization Owner",
  "Principal / Head Teacher",
  "Teacher",
  "Bursar",
  "Admissions Officer",
  "Parent",
  "Student",
] as const;
