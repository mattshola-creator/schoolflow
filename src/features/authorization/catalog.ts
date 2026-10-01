import type { CapabilityRequirement } from "./evaluator";

export type ModuleNavigationItem = CapabilityRequirement & {
  label: string;
  description: string;
  href?: string;
};

export const moduleNavigation: ModuleNavigationItem[] = [
  {
    module: "foundation",
    permission: "shared.tasks.view",
    feature: "foundation.action_center",
    label: "Action Center",
    description: "Tasks and approvals",
    href: "/action-center",
  },
  {
    module: "foundation",
    permission: "shared.documents.view",
    feature: "foundation.document_storage",
    label: "Documents",
    description: "Secure school documents",
    href: "/documents",
  },
  {
    module: "foundation",
    permission: "shared.audit.view",
    feature: "foundation.shared_services",
    label: "Audit",
    description: "Protected activity history",
    href: "/audit",
  },
  {
    module: "admissions",
    permission: "admissions.view",
    feature: "admissions.application_workflow",
    label: "Admissions",
    description: "Applicant lifecycle",
    href: "/admissions",
  },
  {
    module: "students",
    permission: "students.view",
    feature: "students.student_records",
    label: "Students",
    description: "Student and guardian records",
    href: "/students",
  },
  {
    module: "staff",
    permission: "staff.view",
    feature: "staff.staff_records",
    label: "Staff",
    description: "Staff operations",
    href: "/staff",
  },
  {
    module: "attendance",
    permission: "attendance.view",
    feature: "attendance.student_registers",
    label: "Attendance",
    description: "Attendance operations",
    href: "/attendance",
  },
  {
    module: "academics",
    permission: "academics.setup.view",
    feature: "academics.academic_setup",
    label: "Academics",
    description: "Academic operations",
    href: "/academic-setup",
  },
  {
    module: "academics",
    permission: "academics.teaching_assignments.view",
    feature: "academics.teaching_management",
    label: "Teaching",
    description: "Teaching assignments and schedules",
    href: "/teaching",
  },
  {
    module: "academics",
    permission: "academics.scores.view",
    feature: "academics.score_entry",
    label: "Assessment",
    description: "Scores, results and report cards",
    href: "/assessments",
  },
  {
    module: "finance",
    permission: "finance.view",
    feature: "finance.fee_management",
    label: "Finance",
    description: "School finance",
    href: "/finance",
  },
  {
    module: "communication",
    permission: "communication.view",
    feature: "communication.information_center",
    label: "Communication",
    description: "Messages and announcements",
    href: "/communication",
  },
  {
    module: "reporting",
    permission: "reporting.dashboard.view",
    feature: "reporting.management_dashboard",
    label: "Management",
    description: "Dashboards and scoped reports",
    href: "/management",
  },
];

export function findModuleNavigationItem(moduleKey: string) {
  return moduleNavigation.find((item) => item.module === moduleKey);
}
