import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Disposable database fixtures, not genuine application/browser authentication.
assert.equal(process.env.GITHUB_ACTIONS, "true");
assert.equal(process.env.PGHOST, "127.0.0.1");
assert.equal(process.env.PGDATABASE, "schoolflow_disposable_probe");
const requireDriver = createRequire(
  path.join(process.env.RUNNER_TEMP, "native-pg-driver", "package.json"),
);
const { Client } = requireDriver("pg");
const clients = [];
let stage = "connect";
const checks = [];
async function connect() {
  const client = new Client({ connectionTimeoutMillis: 5000 });
  await client.connect();
  clients.push(client);
  await client.query("set statement_timeout='15s'; set lock_timeout='12s'");
  return client;
}
async function identity(client, user) {
  await client.query("begin");
  await client.query("select set_config('request.jwt.claim.sub',$1,true)", [
    user,
  ]);
  await client.query("set local role authenticated");
}
async function as(client, user, sql, args = []) {
  await identity(client, user);
  try {
    const result = await client.query(sql, args);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}
async function denied(fn, codes = ["42501"]) {
  await assert.rejects(fn, (error) => codes.includes(error.code));
}
async function check(name, fn) {
  stage = name;
  await fn();
  checks.push(name);
}
try {
  const admin = await connect(),
    first = await connect(),
    second = await connect();
  assert.equal(
    (
      await admin.query(
        "select count(*)::int n from pg_tables where schemaname='public'",
      )
    ).rows[0].n,
    0,
  );
  stage = "disposable platform adapters";
  await admin.query(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage; create schema extensions;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    grant usage on schema public,auth,storage,extensions to anon,authenticated,service_role;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant all on storage.objects to anon,authenticated;
    alter default privileges for role postgres in schema public grant all on tables to anon,authenticated,service_role;
    alter default privileges for role postgres in schema public grant all on sequences to anon,authenticated,service_role;
    alter default privileges for role postgres in schema public revoke execute on functions from public;
    alter default privileges for role postgres in schema public grant execute on functions to anon,authenticated,service_role;`);
  const root = path.resolve("supabase/migrations");
  const files = (await readdir(root))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const file of files) {
    stage = `schema:${file}`;
    await admin.query(await readFile(path.join(root, file), "utf8"));
  }
  checks.push(`repository migrations replayed:${files.length}`);
  stage = "synthetic identities";
  const owner = randomUUID(),
    verifier = randomUUID(),
    outsider = randomUUID();
  for (const [id, name] of [
    [owner, "owner"],
    [verifier, "verifier"],
    [outsider, "outsider"],
  ])
    await admin.query(
      "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)",
      [
        id,
        `${name}@synthetic.test`,
        { first_name: "Synthetic", last_name: name },
      ],
    );
  await admin.query("select set_config('request.jwt.claim.sub',$1,false)", [
    owner,
  ]);
  const org = (
    await admin.query(
      "select create_organization_with_school('Synthetic Lab','synthetic-native-lab','Synthetic Location','Synthetic School','LAB') id",
    )
  ).rows[0].id;
  const school = (
    await admin.query("select id from schools where organization_id=$1", [org])
  ).rows[0].id;
  await admin.query(
    "insert into organization_memberships(organization_id,user_id,status,all_schools) values($1,$2,'active',true)",
    [org, verifier],
  );
  const role = (
    await admin.query(
      "select id from roles where organization_id=$1 and key='organization_owner'",
      [org],
    )
  ).rows[0].id;
  await admin.query(
    "insert into role_assignments(organization_id,user_id,role_id,scope) values($1,$2,$3,'organization')",
    [org, verifier, role],
  );
  await admin.query(
    "insert into plans(key,name,description) values('native_lab','Synthetic Lab','Disposable-only fixture')",
  );
  await admin.query(
    "insert into plan_module_entitlements(plan_id,module_id) select p.id,m.id from plans p cross join product_modules m where p.key='native_lab'",
  );
  await admin.query(
    "update organization_plans set plan_id=(select id from plans where key='native_lab'),status='active',starts_at=now()-interval '1 day',ends_at=null where organization_id=$1",
    [org],
  );
  await admin.query(
    "insert into organization_feature_flags(organization_id,feature_id,enabled,reason) select $1,id,true,'Disposable fixture' from product_features on conflict(organization_id,feature_id) do update set enabled=true",
    [org],
  );
  // Core branding requires an existing commercial-plan key. Use Starter in this synthetic organization only.
  await admin.query(
    "insert into plan_module_entitlements(plan_id,module_id) select p.id,m.id from plans p cross join product_modules m where p.key='starter' on conflict do nothing",
  );
  await admin.query(
    "update organization_plans set plan_id=(select id from plans where key='starter') where organization_id=$1",
    [org],
  );
  const ownerSchool = [org, school];
  const saveSQL =
    "select save_school_branding_draft($1,$2,$3,$4,$5::jsonb,null) id";
  const config = {
    themeId: "emerald",
    preset: "executive",
    focalX: 50,
    focalY: 50,
    overlay: 0.65,
  };
  const saveArgs = (revision, request = randomUUID()) => [
    ...ownerSchool,
    revision,
    request,
    config,
  ];
  const pidA = (await first.query("select pg_backend_pid() pid")).rows[0].pid;
  const pidB = (await second.query("select pg_backend_pid() pid")).rows[0].pid;
  assert.notEqual(pidA, pidB);
  async function overlap(
    sqlA,
    argsA,
    sqlB,
    argsB,
    expectedCodes,
    actorA = owner,
    actorB = owner,
  ) {
    await identity(first, actorA);
    await identity(second, actorB);
    const a = await first.query(sqlA, argsA);
    let done = false;
    const pending = second
      .query(sqlB, argsB)
      .then(
        (value) => ({ value }),
        (error) => ({ code: error.code }),
      )
      .then((value) => {
        done = true;
        return value;
      });
    let blocked = false;
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const row = (
        await admin.query("select $2::int=any(pg_blocking_pids($1)) blocked", [
          pidB,
          pidA,
        ])
      ).rows[0];
      if (row.blocked) {
        blocked = true;
        break;
      }
      if (done) break;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    assert.equal(
      blocked,
      true,
      "Independent transaction wait must be observed",
    );
    await first.query("commit");
    const b = await pending;
    if (b.code) {
      await second.query("rollback");
      assert.ok(expectedCodes.includes(b.code));
    } else {
      await second.query("commit");
      assert.ok(expectedCodes.includes("success"));
    }
    return { a, b };
  }
  await check("Studio concurrent save revision", async () => {
    const r = await overlap(saveSQL, saveArgs(0), saveSQL, saveArgs(0), [
      "40001",
    ]);
    assert.ok(r.a.rows[0].id);
    assert.equal(
      (
        await admin.query(
          "select count(*)::int n from school_branding_versions",
        )
      ).rows[0].n,
      1,
    );
    assert.equal(
      (await admin.query("select revision::int n from school_branding_state"))
        .rows[0].n,
      1,
    );
  });
  const version = (
    await admin.query("select draft_version_id id from school_branding_state")
  ).rows[0].id;
  await check("Studio concurrent publication retry", async () => {
    const sql = "select publish_school_branding($1,$2,$3,$4) id",
      args = [org, school, version, 1];
    const r = await overlap(sql, args, sql, args, ["success"]);
    assert.equal(r.a.rows[0].id, r.b.value.rows[0].id);
    assert.equal(
      (
        await admin.query(
          "select count(*)::int n from audit_events where action='branding.published'",
        )
      ).rows[0].n,
      1,
    );
    assert.equal(
      (await admin.query("select revision::int n from school_branding_state"))
        .rows[0].n,
      2,
    );
  });
  await check("Studio unauthorized save", () =>
    denied(() => as(first, outsider, saveSQL, saveArgs(2))),
  );
  await check("Studio immutable history", async () => {
    await denied(() =>
      as(
        first,
        owner,
        "update school_branding_versions set config=$1 where id=$2",
        [{ ...config, themeId: "ocean" }, version],
      ),
    );
    assert.deepEqual(
      (
        await admin.query(
          "select config from school_branding_versions where id=$1",
          [version],
        )
      ).rows[0].config,
      config,
    );
  });
  const paymentSQL =
    "select record_payment($1,$2,null,null,null,80,'cash',null,now(),'Synthetic payer',null,null,null,$3) id";
  const recordArgs = () => [org, school, randomUUID()];
  let payment;
  await check("Finance recorder cannot self-verify", async () => {
    payment = (await as(first, owner, paymentSQL, recordArgs())).rows[0].id;
    await denied(() =>
      as(
        first,
        owner,
        "select verify_payment($1,true,'Synthetic verification')",
        [payment],
      ),
    );
    assert.equal(
      (await admin.query("select status from payments where id=$1", [payment]))
        .rows[0].status,
      "recorded",
    );
  });
  await check("Finance independent verifier actor", async () => {
    await as(
      first,
      verifier,
      "select verify_payment($1,true,'Synthetic independent verification')",
      [payment],
    );
    assert.equal(
      (
        await admin.query("select verified_by from payments where id=$1", [
          payment,
        ])
      ).rows[0].verified_by,
      verifier,
    );
  });
  await check("Finance unauthorized verification", () =>
    denied(() =>
      as(first, outsider, "select verify_payment($1,true,'Synthetic denial')", [
        payment,
      ]),
    ),
  );
  await check("Finance concurrent payment idempotency", async () => {
    const args = recordArgs(),
      r = await overlap(paymentSQL, args, paymentSQL, args, [
        "23505",
        "success",
      ]);
    const retry = (await as(first, owner, paymentSQL, args)).rows[0].id;
    assert.equal(retry, r.a.rows[0].id);
    assert.equal(
      (
        await admin.query(
          "select count(*)::int n from payments where idempotency_key=$1",
          [args[2]],
        )
      ).rows[0].n,
      1,
    );
  });
  stage = "synthetic billing fixture";
  async function insert(table, values) {
    assert.match(table, /^[a-z_]+$/);
    const keys = Object.keys(values);
    assert.ok(keys.every((key) => /^[a-z_]+$/.test(key)));
    return (
      await admin.query(
        `insert into ${table}(${keys.join(",")}) values(${keys.map((_, index) => `$${index + 1}`).join(",")}) returning id`,
        Object.values(values),
      )
    ).rows[0].id;
  }
  const person = await insert("people", {
    first_name: "Synthetic",
    last_name: "Learner",
  });
  const student = await insert("student_profiles", {
    organization_id: org,
    person_id: person,
    student_number: "NATIVE-LAB-001",
    gender: "male",
    status: "active",
  });
  const session = (
    await admin.query(
      "insert into academic_sessions(organization_id,school_id,name,start_date,end_date,status) values($1,$2,'Synthetic session',current_date-30,current_date+30,'current') returning id",
      ownerSchool,
    )
  ).rows[0].id;
  const enrollment = (
    await admin.query(
      "insert into student_enrollments(organization_id,school_id,student_id,academic_session_id,status,enrolled_on) values($1,$2,$3,$4,'active',current_date) returning id",
      [org, school, student, session],
    )
  ).rows[0].id;
  const category = await insert("fee_categories", {
    organization_id: org,
    school_id: school,
    code: "LAB",
    name: "Synthetic fee",
  });
  const structure = (
    await admin.query(
      "insert into fee_structures(organization_id,school_id,session_id,name,effective_from,status,activated_at) values($1,$2,$3,'Synthetic structure',current_date,'active',now()) returning id",
      [org, school, session],
    )
  ).rows[0].id;
  const item = await insert("fee_structure_items", {
    organization_id: org,
    school_id: school,
    fee_structure_id: structure,
    fee_category_id: category,
    amount: 100,
  });
  const run = (
    await admin.query(
      "insert into billing_runs(organization_id,school_id,fee_structure_id,idempotency_key,status,completed_at,affected_students,expected_total) values($1,$2,$3,$4,'completed',now(),1,100) returning id",
      [org, school, structure, randomUUID()],
    )
  ).rows[0].id;
  const invoice = await insert("student_invoices", {
    organization_id: org,
    school_id: school,
    student_id: student,
    enrollment_id: enrollment,
    session_id: session,
    billing_run_id: run,
    invoice_number: "NATIVE-LAB-001",
    currency_code: "NGN",
  });
  const charge = await insert("student_charges", {
    organization_id: org,
    school_id: school,
    student_id: student,
    enrollment_id: enrollment,
    invoice_id: invoice,
    fee_structure_id: structure,
    fee_structure_item_id: item,
    fee_category_id: category,
    session_id: session,
    currency_code: "NGN",
    original_amount: 100,
    fee_structure_name_snapshot: "Synthetic structure",
    fee_structure_version_snapshot: 1,
    fee_category_code_snapshot: "LAB",
    fee_category_name_snapshot: "Synthetic fee",
  });
  const otherPayment = (await as(first, owner, paymentSQL, recordArgs()))
    .rows[0].id;
  await as(
    first,
    verifier,
    "select verify_payment($1,true,'Synthetic independent verification')",
    [otherPayment],
  );
  await check("Finance concurrent shared-charge allocation", async () => {
    const sql = "select allocate_payment($1,$2::jsonb) id",
      allocations = [{ chargeId: charge, amount: 80 }];
    await overlap(
      sql,
      [payment, allocations],
      sql,
      [otherPayment, allocations],
      ["23514"],
    );
    const balance = (
      await admin.query(
        "select outstanding_amount::text balance from student_charge_balances where student_charge_id=$1",
        [charge],
      )
    ).rows[0].balance;
    assert.equal(Number(balance), 20);
    const rows = (
      await admin.query(
        "select amount::text amount,allocated_by from payment_allocations where student_charge_id=$1",
        [charge],
      )
    ).rows;
    assert.equal(rows.length, 1);
    assert.equal(Number(rows[0].amount), 80);
    assert.equal(rows[0].allocated_by, owner);
    await denied(
      () => as(first, owner, sql, [payment, allocations]),
      ["23514", "23505"],
    );
    assert.equal(
      (
        await admin.query(
          "select count(*)::int n from payment_allocations where student_charge_id=$1",
          [charge],
        )
      ).rows[0].n,
      1,
    );
  });
  await check("Finance concurrent receipt issuance", async () => {
    const sql = "select issue_receipt($1) id",
      r = await overlap(sql, [payment], sql, [payment], ["success"]);
    assert.equal(r.a.rows[0].id, r.b.value.rows[0].id);
    assert.equal(
      (
        await admin.query(
          "select count(*)::int n from receipts where payment_id=$1",
          [payment],
        )
      ).rows[0].n,
      1,
    );
  });
  await check("Finance concurrent reversal retry", async () => {
    const sql = "select reverse_payment($1,'Synthetic reversal') id";
    const r = await overlap(sql, [payment], sql, [payment], ["success"]);
    assert.equal(r.a.rows[0].id, r.b.value.rows[0].id);
    assert.equal(
      (
        await admin.query(
          "select count(*)::int n from payment_reversals where payment_id=$1",
          [payment],
        )
      ).rows[0].n,
      1,
    );
    assert.equal(
      Number(
        (
          await admin.query(
            "select outstanding_amount from student_charge_balances where student_charge_id=$1",
            [charge],
          )
        ).rows[0].outstanding_amount,
      ),
      100,
    );
    assert.equal(
      (
        await admin.query(
          "select reversed_by from payment_reversals where payment_id=$1",
          [payment],
        )
      ).rows[0].reversed_by,
      owner,
    );
  });
  await check("Exposed application table RLS", async () => {
    const rows = (
      await admin.query(
        "select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity",
      )
    ).rows;
    assert.equal(rows.length, 0);
  });
  console.log(
    JSON.stringify({
      nativeDomainChecks: checks,
      postgresMajor: 17,
      evidence: "disposable SQL role fixtures; not browser authentication",
      restrictedArtifactsUsed: false,
      hostedResourcesAccessed: false,
      attendanceConcurrency: "NOT_RUN",
      allocationConcurrency:
        "shared-charge wait and unchanged denied effects verified",
      privateStorageTransport: "NOT_RUN",
    }),
  );
} catch (error) {
  console.error(
    JSON.stringify({
      nativeDomainStatus: "FAILED",
      stage,
      sqlstate: error.code ?? "ASSERTION",
    }),
  );
  process.exitCode = 1;
} finally {
  await Promise.allSettled(clients.map((client) => client.end()));
}
