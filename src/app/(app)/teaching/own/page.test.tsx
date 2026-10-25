import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuthorizationError } from "@/lib/authorization";
const { load } = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("@/features/academics/own-teaching-service", () => ({
  loadOwnTeachingWorkspace: load,
}));
vi.mock("./actions", () => ({ saveOwnTeaching: vi.fn() }));
import Page from "./page";
const fixture = {
  schoolName: "Synthetic school",
  canRecordAttendance: true,
  teacherName: "Pilot Teacher",
  sessions: [{ id: "session", name: "Current session", status: "current" }],
  periodsMetadata: [
    {
      id: "term",
      session_id: "session",
      name: "First term",
      status: "current",
    },
  ],
  levels: [{ id: "class", name: "Primary 3" }],
  arms: [{ id: "arm", name: "Blue" }],
  subjects: [{ id: "subject", name: "Mathematics" }],
  assignments: [
    {
      id: "assignment",
      session_id: "session",
      class_level_id: "class",
      class_arm_id: "arm",
      subject_id: "subject",
    },
  ],
  entries: [
    {
      id: "entry",
      session_id: "session",
      period_id: "period",
      teaching_assignment_id: "assignment",
    },
  ],
  periods: [
    {
      id: "period",
      weekday: 1,
      name: "Morning",
      starts_at: "09:00:00",
      ends_at: "09:40:00",
    },
  ],
  plans: [
    {
      id: "plan",
      session_id: "session",
      academic_period_id: "term",
      teaching_assignment_id: "assignment",
      topic: "Counting",
      lesson_date: "2026-10-26",
      objectives: "Count objects",
      status: "submitted",
    },
  ],
  deliveries: [],
};
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  load.mockResolvedValue(fixture);
});
it("renders current assigned timetable, canonical own name and real workflow actions", async () => {
  render(await Page({ searchParams: Promise.resolve({}) }));
  expect(screen.getByLabelText("Academic session")).toHaveValue("session");
  expect(
    screen.getByText("Monday · Morning · 09:00–09:40"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Pilot Teacher · Current session"),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Save draft plan" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Record linked delivery")).toBeInTheDocument();
  expect(screen.queryByText("Edit draft")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /approve/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Class attendance" }),
  ).toHaveAttribute("href", "/attendance");
});
it("shows edit and submit only for an own draft", async () => {
  load.mockResolvedValue({
    ...fixture,
    plans: [{ ...fixture.plans[0], status: "draft" }],
  });
  render(await Page({ searchParams: Promise.resolve({}) }));
  expect(screen.getByText("Edit draft")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Submit lesson plan" }),
  ).toBeInTheDocument();
});
it("denies expired or unauthorized contexts without rendering mutation forms", async () => {
  load.mockRejectedValue(new AuthorizationError("permission_denied"));
  render(await Page({ searchParams: Promise.resolve({}) }));
  expect(
    screen.getByText("Your teaching workspace is unavailable"),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Save draft plan" }),
  ).not.toBeInTheDocument();
});
it("propagates source failures instead of claiming no assignments", async () => {
  load.mockRejectedValue(new Error("source failure"));
  await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
    "source failure",
  );
});
it("retains an explicit empty state without inventing work", async () => {
  load.mockResolvedValue({
    ...fixture,
    assignments: [],
    entries: [],
    plans: [],
  });
  render(await Page({ searchParams: Promise.resolve({}) }));
  expect(screen.getByText("No active assignments")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Save draft plan" }),
  ).not.toBeInTheDocument();
});
