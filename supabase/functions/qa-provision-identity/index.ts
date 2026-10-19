import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const QA_PROJECT_REF = "afqykqlxecpzspjoyegc";
const QA_APP_URL = "https://schoolflow-demo-qa.netlify.app";
const QA_BASE_HOST = "schoolflow-demo-qa.netlify.app";
const QA_INTEGRATION_HOST =
  "ops-option-bplus-px6-integration--schoolflow-demo-qa.netlify.app";
const PERMISSION_REQUIREMENTS = [
  "role.manage",
  "membership.manage",
  "membership.view",
] as const;

const presets = {
  payment_recorder: {
    key: "qa_payment_recorder",
    name: "QA Payment Recorder",
    description: "SchoolFlow QA fixed least-privilege payment recorder preset.",
    email: "qa-payment-recorder@schoolflow.test",
    fullName: "QA Payment Recorder",
    organizationSlug: "cedarbridge-learning-group",
    permissions: [
      "finance.view",
      "finance.billing.view",
      "finance.payments.view",
      "finance.payments.record",
    ],
  },
  payment_verifier: {
    key: "qa_payment_verifier",
    name: "QA Independent Payment Verifier",
    description: "SchoolFlow QA fixed least-privilege payment verifier preset.",
    email: "qa-payment-verifier@schoolflow.test",
    fullName: "QA Independent Payment Verifier",
    organizationSlug: "cedarbridge-learning-group",
    permissions: [
      "finance.view",
      "finance.billing.view",
      "finance.payments.view",
      "finance.payments.verify",
      "finance.payments.allocate",
    ],
  },
  internal_qa_reader: {
    key: "qa_internal_read_only",
    name: "QA Read Only",
    description: "SchoolFlow QA fixed read-only internal QA preset.",
    email: "qa-internal-reader@schoolflow.test",
    fullName: "SchoolFlow Internal QA Reader",
    organizationSlug: "schoolflow-internal-qa",
    permissions: [
      "organization.view",
      "school.view",
      "students.view",
      "academics.view",
      "academics.scores.view",
      "academics.results.view",
      "attendance.view",
      "finance.view",
      "finance.billing.view",
      "finance.payments.view",
      "communication.view",
      "reporting.dashboard.view",
      "shared.documents.view",
      "shared.tasks.view",
      "shared.audit.view",
    ],
  },
} as const;

type PresetKey = keyof typeof presets;

function json(body: unknown, status: number, origin: string | null) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
  });
  if (origin && isQaOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set(
      "Access-Control-Allow-Headers",
      "authorization, apikey, content-type, x-client-info",
    );
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function isQaHost(host: string) {
  if (host === QA_BASE_HOST || host === QA_INTEGRATION_HOST) return true;
  const prefix = "deploy-preview-";
  const suffix = "--schoolflow-demo-qa.netlify.app";
  if (!host.startsWith(prefix) || !host.endsWith(suffix)) return false;
  const id = host.slice(prefix.length, -suffix.length);
  return id.length > 0 && [...id].every((char) => char >= "0" && char <= "9");
}

function isQaOrigin(value: string) {
  try {
    const origin = new URL(value);
    return (
      origin.protocol === "https:" &&
      origin.origin === value &&
      isQaHost(origin.hostname)
    );
  } catch {
    return false;
  }
}

function getPublishableKey() {
  const direct =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    Deno.env.get("SB_PUBLISHABLE_KEY");
  if (direct) return direct;
  const values = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (!values) return null;
  try {
    const parsed = JSON.parse(values) as Record<string, string>;
    return parsed.default ?? Object.values(parsed)[0] ?? null;
  } catch {
    return null;
  }
}

function capabilitySnapshotIsAllowed(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return false;
  const value = snapshot as {
    permissions?: unknown;
    modules?: unknown;
    features?: unknown;
  };
  const permissionKeys = value.permissions;
  if (!Array.isArray(permissionKeys)) return false;
  if (!PERMISSION_REQUIREMENTS.every((key) => permissionKeys.includes(key)))
    return false;
  const modules = Array.isArray(value.modules) ? value.modules : [];
  const foundation = modules.find(
    (item) =>
      item &&
      typeof item === "object" &&
      (item as { key?: unknown }).key === "foundation",
  ) as { entitled?: unknown; enabled?: unknown } | undefined;
  const features = Array.isArray(value.features) ? value.features : [];
  const feature = features.find(
    (item) =>
      item &&
      typeof item === "object" &&
      (item as { key?: unknown }).key ===
        "foundation.authorization_inspection" &&
      (item as { module?: unknown }).module === "foundation",
  ) as { enabled?: unknown } | undefined;
  return (
    foundation?.entitled === true &&
    foundation.enabled === true &&
    feature?.enabled === true
  );
}

function exactPermissionSet(actual: string[], expected: readonly string[]) {
  return (
    actual.length === expected.length &&
    expected.every((permission) => actual.includes(permission))
  );
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") {
    if (!origin || !isQaOrigin(origin))
      return json({ error: "forbidden" }, 403, null);
    return json({ ok: true }, 200, origin);
  }
  if (request.method !== "POST")
    return json({ error: "method_not_allowed" }, 405, origin);
  if (!origin || !isQaOrigin(origin))
    return json({ error: "forbidden" }, 403, null);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const publishableKey = getPublishableKey();
    if (
      new URL(supabaseUrl).hostname !== `${QA_PROJECT_REF}.supabase.co` ||
      !serviceRoleKey ||
      !publishableKey
    )
      return json({ error: "qa_environment_unavailable" }, 503, origin);

    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return json({ error: "unauthorized" }, 401, origin);

    const input = (await request.json()) as {
      rolePreset?: unknown;
      organizationId?: unknown;
      schoolId?: unknown;
      appOrigin?: unknown;
    };
    if (
      typeof input.rolePreset !== "string" ||
      !(input.rolePreset in presets) ||
      typeof input.organizationId !== "string" ||
      typeof input.schoolId !== "string" ||
      typeof input.appOrigin !== "string" ||
      input.appOrigin !== origin
    )
      return json({ error: "invalid_request" }, 400, origin);

    const preset = presets[input.rolePreset as PresetKey];
    const userClient = createClient(supabaseUrl, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authorization } },
    });
    const { data: actorResult, error: actorError } =
      await userClient.auth.getUser(token);
    if (actorError || !actorResult.user)
      return json({ error: "unauthorized" }, 401, origin);

    const { data: snapshot, error: authorizationError } = await userClient.rpc(
      "get_my_authorization",
      {
        target_organization_id: input.organizationId,
        target_school_id: input.schoolId,
      },
    );
    if (authorizationError || !capabilitySnapshotIsAllowed(snapshot)) {
      return json({ error: "permission_denied" }, 403, origin);
    }

    const [
      { data: organization, error: organizationError },
      { data: school, error: schoolError },
    ] = await Promise.all([
      userClient
        .from("organizations")
        .select("slug")
        .eq("id", input.organizationId)
        .maybeSingle(),
      userClient
        .from("schools")
        .select("id")
        .eq("id", input.schoolId)
        .eq("organization_id", input.organizationId)
        .maybeSingle(),
    ]);
    if (
      organizationError ||
      schoolError ||
      organization?.slug !== preset.organizationSlug ||
      !school
    )
      return json({ error: "scope_not_allowed" }, 403, origin);

    const { data: role, error: roleError } = await userClient
      .from("roles")
      .select("id,name,description,is_system")
      .eq("organization_id", input.organizationId)
      .eq("key", preset.key)
      .maybeSingle();
    if (
      roleError ||
      !role ||
      role.name !== preset.name ||
      role.description !== preset.description ||
      role.is_system
    )
      return json({ error: "approved_role_required" }, 403, origin);

    const { data: permissions, error: permissionsError } = await userClient
      .from("permissions")
      .select("id,key")
      .in("key", [...preset.permissions]);
    const { data: grants, error: grantsError } = await userClient
      .from("role_permissions")
      .select("permission_id")
      .eq("organization_id", input.organizationId)
      .eq("role_id", role.id);
    if (
      permissionsError ||
      grantsError ||
      !permissions ||
      permissions.length !== preset.permissions.length ||
      !grants ||
      !exactPermissionSet(
        grants.map(
          (grant) =>
            permissions.find(
              (permission) => permission.id === grant.permission_id,
            )?.key ?? "",
        ),
        preset.permissions,
      )
    )
      return json({ error: "role_permissions_mismatch" }, 403, origin);

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: page, error: usersError } =
      await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
    if (usersError)
      return json({ error: "identity_lookup_failed" }, 503, origin);
    let identity = page.users.find(
      (user) => user.email?.toLowerCase() === preset.email,
    );
    if (identity) {
      if (
        identity.app_metadata?.schoolflow_qa_identity !== preset.key ||
        !identity.email_confirmed_at
      )
        return json({ error: "identity_conflict" }, 409, origin);
    } else {
      const { data: created, error: createError } =
        await adminClient.auth.admin.createUser({
          email: preset.email,
          email_confirm: true,
          user_metadata: { full_name: preset.fullName },
          app_metadata: { schoolflow_qa_identity: preset.key },
        });
      if (createError || !created.user) {
        return json({ error: "identity_creation_failed" }, 503, origin);
      }
      identity = created.user;
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", identity.id)
      .maybeSingle();
    if (profileError || !profile)
      return json({ error: "profile_bootstrap_failed" }, 503, origin);

    const [
      { data: memberships, error: membershipsError },
      { data: schoolMemberships, error: schoolMembershipsError },
      { data: assignments, error: assignmentsError },
    ] = await Promise.all([
      adminClient
        .from("organization_memberships")
        .select("organization_id,status")
        .eq("user_id", identity.id),
      adminClient
        .from("school_memberships")
        .select("organization_id,school_id,status")
        .eq("user_id", identity.id),
      adminClient
        .from("role_assignments")
        .select("organization_id,role_id,scope,school_id,status")
        .eq("user_id", identity.id),
    ]);
    if (membershipsError || schoolMembershipsError || assignmentsError) {
      return json({ error: "membership_check_failed" }, 503, origin);
    }

    const organizationRows = memberships ?? [];
    const schoolRows = schoolMemberships ?? [];
    const assignmentRows = assignments ?? [];
    let membershipState: "unassigned" | "complete" = "unassigned";
    if (organizationRows.length || schoolRows.length || assignmentRows.length) {
      const complete =
        organizationRows.length === 1 &&
        organizationRows[0].organization_id === input.organizationId &&
        organizationRows[0].status === "active" &&
        schoolRows.length === 1 &&
        schoolRows[0].organization_id === input.organizationId &&
        schoolRows[0].school_id === input.schoolId &&
        schoolRows[0].status === "active" &&
        assignmentRows.length === 1 &&
        assignmentRows[0].organization_id === input.organizationId &&
        assignmentRows[0].role_id === role.id &&
        assignmentRows[0].scope === "school" &&
        assignmentRows[0].school_id === input.schoolId &&
        assignmentRows[0].status === "active";
      if (!complete)
        return json({ error: "identity_scope_conflict" }, 409, origin);
      membershipState = "complete";
    }

    const { data: link, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: preset.email,
        options: { redirectTo: `${origin}/auth/qa-link` },
      });
    const tokenHash = link?.properties?.hashed_token;
    if (linkError || !tokenHash)
      return json({ error: "sign_in_link_failed" }, 503, origin);

    // Keep the one-time OTP in the URL fragment. Fragments are not sent to the
    // server; the QA page removes it from browser history before verification.
    const signIn = new URL("/auth/qa-link", origin);
    signIn.hash = new URLSearchParams({
      token_hash: tokenHash,
      type: "magiclink",
    }).toString();
    return json({ signInUrl: signIn.toString(), membershipState }, 200, origin);
  } catch {
    return json({ error: "qa_identity_provisioning_failed" }, 503, origin);
  }
});
