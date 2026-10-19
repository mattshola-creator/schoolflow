import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QaInvitationForm } from "./qa-invitation-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("QA invitation handoff", () => {
  it("offers direct private links without sending email or automatically switching identity", async () => {
    const signInUrl =
      "https://schoolflow-demo-qa.netlify.app/auth/qa-sign-in#type=magiclink&token_hash=synthetic-fixture";
    const inviteUrl =
      "https://schoolflow-demo-qa.netlify.app/accept-invitation?token=synthetic-fixture";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "QA links ready", signInUrl, inviteUrl }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <QaInvitationForm
        organizationName="Cedarbridge Learning Group"
        schoolId="11111111-1111-4111-8111-111111111111"
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "payment_verifier" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Prepare test account" }),
    );
    const signIn = await screen.findByRole("link", {
      name: "Sign in to the prepared QA account",
    });
    const invitation = screen.getByRole("link", {
      name: "Open the prepared QA invitation",
    });
    expect(signIn).toHaveAttribute("href", signInUrl);
    expect(invitation).toHaveAttribute("href", inviteUrl);
    for (const link of [signIn, invitation]) {
      expect(link).toHaveAttribute("referrerPolicy", "no-referrer");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAttribute("target", "_blank");
    }
    expect(
      screen.getByText(/Other tabs on the same hostname/),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/administration/qa-invitation",
    );
  });
});
