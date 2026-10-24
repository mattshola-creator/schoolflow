import {
  evaluateAccess,
  type AuthorizationSnapshot,
} from "@/features/authorization/evaluator";
export function teacherWorkAreas(auth: AuthorizationSnapshot) {
  const can = (permission: string, module: string, feature?: string) =>
    evaluateAccess(auth, { permission, module, feature }).allowed;
  return [
    can("academics.scores.view", "academics", "academics.score_entry")
      ? {
          title: "Assessment score sheets",
          href: "/assessments",
          description:
            "Open permitted score sheets, save drafts and follow submission status.",
        }
      : null,
    can(
      "academics.teaching_assignments.view",
      "academics",
      "academics.teaching_management",
    )
      ? {
          title: "Classes & subjects",
          href: "/teaching",
          description:
            "Open teaching assignments available in your current school.",
        }
      : null,
    can(
      "academics.timetable.view",
      "academics",
      "academics.teaching_management",
    )
      ? {
          title: "Daily timetable",
          href: "/teaching/timetable",
          description: "Open the working timetable and select the school day.",
        }
      : null,
    can("attendance.view", "attendance", "attendance.student_registers") &&
    can(
      "attendance.student.record",
      "attendance",
      "attendance.student_registers",
    )
      ? {
          title: "Class attendance",
          href: "/attendance",
          description:
            "Open permitted attendance responsibilities and registers.",
        }
      : null,
    [
      "academics.lesson_plans.manage",
      "academics.lesson_plans.approve",
      "academics.lesson_delivery.record",
      "academics.homework.manage",
    ].some((p) => can(p, "academics", "academics.teaching_management"))
      ? {
          title: "Lesson planning & delivery",
          href: "/teaching/lessons",
          description:
            "Open authorized lesson plans, delivery records and homework.",
        }
      : null,
    can("shared.tasks.view", "foundation", "foundation.action_center")
      ? {
          title: "Pending tasks",
          href: "/my-day",
          description: "Open your authorized Action Center priorities.",
        }
      : null,
  ].filter((v): v is NonNullable<typeof v> => v !== null);
}
export function scoreSheetSummary(
  rows: readonly {
    status: string;
    class_level_id: string;
    class_arm_id: string | null;
    subject_id: string;
  }[],
) {
  return {
    classes: new Set(
      rows.map((r) => `${r.class_level_id}:${r.class_arm_id ?? ""}`),
    ).size,
    subjects: new Set(rows.map((r) => r.subject_id)).size,
    drafts: rows.filter((r) => r.status === "draft" || r.status === "reopened")
      .length,
    submitted: rows.filter((r) => r.status === "submitted").length,
  };
}
