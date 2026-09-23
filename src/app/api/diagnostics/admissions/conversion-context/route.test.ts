import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  actor: "11111111-1111-4111-8111-111111111111",
  application: "22222222-2222-4222-8222-222222222222",
  organization: "33333333-3333-4333-8333-333333333333",
  school: "44444444-4444-4444-8444-444444444444",
};
const mocks = vi.hoisted(() => ({
  context: vi.fn(),
  read: vi.fn(),
}));
vi.mock("@/features/admissions/service", () => ({
  requireAdmissionsContext: mocks.context,
}));
vi.mock("@/features/admissions/conversion-context-probe", () => ({
  ConversionProbeError: class ConversionProbeError extends Error {
    constructor(public readonly stage: string) {
      super("probe failed");
    }
  },
  readConversionContext: mocks.read,
}));

import { GET } from "./route";

function enableProbe() {
  vi.stubEnv("SCHOOLFLOW_CONVERSION_PROBE_ENABLED", "true");
  vi.stubEnv("SCHOOLFLOW_CONVERSION_PROBE_ACTOR_ID", ids.actor);
  vi.stubEnv("SCHOOLFLOW_CONVERSION_PROBE_APPLICATION_ID", ids.application);
  vi.stubEnv("SCHOOLFLOW_CONVERSION_PROBE_ORGANIZATION_ID", ids.organization);
  vi.stubEnv("SCHOOLFLOW_CONVERSION_PROBE_SCHOOL_ID", ids.school);
  vi.stubEnv(
    "SCHOOLFLOW_CONVERSION_PROBE_EXPIRES_AT",
    new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  );
  vi.stubEnv("CONTEXT", "production");
}

describe("GET conversion context probe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.context.mockResolvedValue({
      user: { id: ids.actor },
      active: { organizationId: ids.organization, schoolId: ids.school },
      authorization: {
        organizationId: ids.organization,
        schoolId: ids.school,
      },
      supabase: {},
    });
    mocks.read.mockResolvedValue({
      stage: "pre_rpc_context_complete",
      checks: { applicationAccepted: true, studentProfiles: 0 },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("is disabled by default and does not resolve authentication", async () => {
    const response = await GET();
    expect(response.status).toBe(404);
    expect(mocks.context).not.toHaveBeenCalled();
    expect(mocks.read).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated callers without exposing diagnostics", async () => {
    enableProbe();
    mocks.context.mockRejectedValue(new Error("unauthenticated"));
    const response = await GET();
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
    expect(mocks.read).not.toHaveBeenCalled();
  });

  it.each([
    ["ordinary actor", { user: { id: crypto.randomUUID() } }],
    [
      "cross-tenant context",
      { active: { organizationId: crypto.randomUUID(), schoolId: ids.school } },
    ],
    [
      "wrong school authorization",
      {
        authorization: {
          organizationId: ids.organization,
          schoolId: crypto.randomUUID(),
        },
      },
    ],
  ])("rejects %s before application reads", async (_label, override) => {
    enableProbe();
    const baseline = await mocks.context();
    mocks.context.mockResolvedValue({ ...baseline, ...override });
    const response = await GET();
    expect(response.status).toBe(404);
    expect(mocks.read).not.toHaveBeenCalled();
  });

  it("binds the exact configured application and returns only a safe correlation", async () => {
    enableProbe();
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.read).toHaveBeenCalledWith(
      expect.objectContaining({ user: { id: ids.actor } }),
      ids.application,
    );
    expect(body).toEqual({
      correlationId: expect.any(String),
      status: "complete",
      stage: "pre_rpc_context_complete",
    });
    expect(JSON.stringify(body)).not.toContain(ids.actor);
    expect(JSON.stringify(body)).not.toContain(ids.application);
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining(body.correlationId),
    );
  });
});
