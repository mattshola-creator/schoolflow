import type { CapabilityRequirement } from "./evaluator";

export type ModuleNavigationItem = CapabilityRequirement & {
  label: string;
  description: string;
  href?: string;
};

export const moduleNavigation: ModuleNavigationItem[] = [
  {
    module: "admissions",
    permission: "admissions.view",
    label: "Admissions",
    description: "Applicant lifecycle",
  },
  {
    module: "students",
    permission: "students.view",
    label: "Students",
    description: "Student and guardian records",
  },
  {
    module: "staff",
    permission: "staff.view",
    label: "Staff",
    description: "Staff operations",
  },
  {
    module: "attendance",
    permission: "attendance.view",
    label: "Attendance",
    description: "Attendance operations",
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
    module: "finance",
    permission: "finance.view",
    label: "Finance",
    description: "School finance",
  },
  {
    module: "communication",
    permission: "communication.view",
    label: "Communication",
    description: "Messages and announcements",
  },
  {
    module: "reporting",
    permission: "reporting.view",
    label: "Reporting",
    description: "Reports and exports",
  },
];

export function findModuleNavigationItem(moduleKey: string) {
  return moduleNavigation.find((item) => item.module === moduleKey);
}
