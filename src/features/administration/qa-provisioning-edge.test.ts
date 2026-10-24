import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
let handler: (request: Request) => Promise<Response>;
let projectUrl = "https://afqykqlxecpzspjoyegc.supabase.co";
const origin = "https://deploy-preview-119--schoolflow-demo-qa.netlify.app";
const body = {
  rolePreset: "assessment_teacher",
  organizationId: "11111111-1111-4111-8111-111111111111",
  schoolId: "22222222-2222-4222-8222-222222222222",
  appOrigin: origin,
};
function request(overrides = {}, requestOrigin = origin, authorized = true) {
  return new Request(`${projectUrl}/functions/v1/qa-provision-identity`, {
    method: "POST",
    headers: {
      Origin: requestOrigin,
      "Content-Type": "application/json",
      ...(authorized ? { Authorization: "Bearer synthetic-test-only" } : {}),
    },
    body: JSON.stringify({ ...body, ...overrides }),
  });
}
beforeAll(async () => {
  vi.stubGlobal("Deno", {
    env: {
      get: (name: string) =>
        name === "SUPABASE_URL"
          ? projectUrl
          : name === "SUPABASE_SERVICE_ROLE_KEY"
            ? "test-server-placeholder"
            : name === "SUPABASE_ANON_KEY"
              ? "test-public-placeholder"
              : undefined,
    },
    serve: (callback: typeof handler) => {
      handler = callback;
    },
  });
  await import("../../../supabase/functions/qa-provision-identity/index");
});
afterAll(() => vi.unstubAllGlobals());
beforeEach(() => {
  vi.clearAllMocks();
  projectUrl = "https://afqykqlxecpzspjoyegc.supabase.co";
  mocks.createClient.mockReturnValue({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
  });
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
});
describe("QA identity Edge authorization boundary", () => {
  it.each([
    "https://attacker.example",
    "https://schoolflow-app.netlify.app",
    "https://schoolflow-demo-qa.netlify.app:444",
  ])("rejects unauthorized origin %s before client creation", async (value) => {
    expect((await handler(request({}, value))).status).toBe(403);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("refuses production project configuration", async () => {
    projectUrl = "https://bgnmvfktscofbwpyougd.supabase.co";
    expect((await handler(request())).status).toBe(503);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it.each(["https://attacker.example", "__proto__", "constructor"])(
    "rejects unknown or inherited preset %s",
    async (rolePreset) => {
      expect((await handler(request({ rolePreset }))).status).toBe(400);
      expect(mocks.createClient).not.toHaveBeenCalled();
    },
  );
  it("refuses arbitrary sign-in destinations", async () => {
    expect(
      (
        await handler(
          request({ signInDestination: "https://attacker.example" }),
        )
      ).status,
    ).toBe(400);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("requires a bearer credential even for the fixed teacher preset", async () => {
    expect((await handler(request({}, origin, false))).status).toBe(401);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("validates the actual signed-in user before provisioning", async () => {
    expect(
      (await handler(request({ signInDestination: "stable_qa" }))).status,
    ).toBe(401);
    expect(mocks.createClient).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("denies an authenticated actor without access-management capabilities", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "33333333-3333-4333-8333-333333333333" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({
      data: { permissions: [], modules: [], features: [] },
      error: null,
    });
    expect((await handler(request())).status).toBe(403);
    expect(mocks.createClient).toHaveBeenCalledTimes(1);
  });
});

it.each(["principal_review", "bursar_recorder"])(
  "requires real user authentication for approved pilot %s",
  async (rolePreset) => {
    expect((await handler(request({ rolePreset }))).status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  },
);
it("refuses pilot delegation outside the authenticated actor's permission subset", async () => {
  mocks.getUser.mockResolvedValue({
    data: { user: { id: "33333333-3333-4333-8333-333333333333" } },
    error: null,
  });
  mocks.rpc.mockResolvedValue({
    data: {
      permissions: ["role.manage", "membership.manage", "membership.view"],
      modules: [{ key: "foundation", enabled: true, entitled: true }],
      features: [
        {
          key: "foundation.authorization_inspection",
          module: "foundation",
          enabled: true,
        },
      ],
    },
    error: null,
  });
  expect(
    (await handler(request({ rolePreset: "principal_review" }))).status,
  ).toBe(403);
  expect(mocks.createClient).toHaveBeenCalledTimes(1);
});
