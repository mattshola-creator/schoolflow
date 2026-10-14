import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommunicationNoticeList } from "./communication-notice-list";

describe("CommunicationNoticeList", () => {
  it("shows a clear empty state when there are no notices", () => {
    render(<CommunicationNoticeList notices={[]} />);
    expect(
      screen.getByRole("heading", { name: "Recent notices" }),
    ).toBeTruthy();
    expect(
      screen.getByText("No notices have been published for this school yet."),
    ).toBeTruthy();
  });

  it("shows the notice status and content for populated records", () => {
    render(
      <CommunicationNoticeList
        notices={[
          {
            id: "notice-1",
            title: "Term begins Monday",
            body: "Classes resume next week.",
            status: "published",
          },
        ]}
      />,
    );
    expect(screen.getByText("Term begins Monday")).toBeTruthy();
    expect(screen.getByText("published")).toBeTruthy();
    expect(screen.getByText("Classes resume next week.")).toBeTruthy();
  });
});
