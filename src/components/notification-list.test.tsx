import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotificationList } from "./notification-list";

describe("NotificationList", () => {
  it("shows an explicit empty state", () => {
    render(<NotificationList notifications={[]} />);
    expect(screen.getByText("No unread notifications")).toBeTruthy();
    expect(
      screen.getByText(
        "You are up to date. New school notifications will appear here.",
      ),
    ).toBeTruthy();
  });

  it("distinguishes unread from read notifications", () => {
    render(
      <NotificationList
        notifications={[
          {
            id: "unread",
            title: "Approval needed",
            body: "A request needs review.",
            read_at: null,
            created_at: "2026-10-14T10:00:00Z",
          },
          {
            id: "read",
            title: "Task completed",
            body: null,
            read_at: "2026-10-14T10:30:00Z",
            created_at: "2026-10-14T09:00:00Z",
          },
        ]}
      />,
    );
    expect(screen.getByText("1 unread notification")).toBeTruthy();
    expect(screen.getByText("Unread")).toBeTruthy();
    expect(screen.getByText("Read")).toBeTruthy();
  });
});
