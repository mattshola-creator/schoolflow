import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
const refresh = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("./persistence", () => ({}));
import { BrandingStudio } from "./studio";
const snapshot = {
  schoolId: "00000000-0000-4000-8000-000000000001",
  revision: 1,
  draft_version_id: "00000000-0000-4000-8000-000000000002",
  published_version_id: null,
  history: [],
  effective: {
    themeId: "emerald",
    preset: "executive",
    focalX: 50,
    focalY: 50,
    overlay: 0.65,
  },
  premiumFallback: false,
};
beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("published shell refresh", () => {
  it("refreshes the authenticated server shell only after successful publication", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ...snapshot,
          revision: 2,
          published_version_id: snapshot.draft_version_id,
        }),
      }),
    );
    render(
      <BrandingStudio
        schoolName="Demo school"
        plan="starter"
        initialSnapshot={snapshot as never}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Publish saved draft" }),
    );
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(screen.getByRole("status")).toHaveTextContent("published");
  });
  it("does not refresh or claim publication when the server denies it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Permission denied" }),
      }),
    );
    render(
      <BrandingStudio
        schoolName="Demo school"
        plan="starter"
        initialSnapshot={snapshot as never}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Publish saved draft" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Permission denied"),
    );
    expect(refresh).not.toHaveBeenCalled();
  });
});
