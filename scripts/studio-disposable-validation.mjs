const { PGlite } = await import(
  process.env.SCHOOLFLOW_PGLITE_MODULE ?? "@electric-sql/pglite"
);
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
const root = fileURLToPath(new URL("../", import.meta.url)).replace(/\/$/, "");
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create schema extensions; create schema storage;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to anon,authenticated,service_role;
grant execute on function auth.uid() to anon,authenticated,service_role;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security; grant all on storage.objects to anon,authenticated;`);
for (const name of [
  "20260912000100_bootstrap_private_schema.sql",
  "20260912000200_identity_tenancy.sql",
  "20260913052337_authorization_entitlements.sql",
  "20260913052955_harden_entitlement_catalog.sql",
]) {
  let sql = await readFile(root + "/supabase/migrations/" + name, "utf8");
  sql = sql.replace(/create extension[^;]+;/gi, "");
  try {
    await db.exec(sql);
    console.log("BASE", name);
  } catch (e) {
    console.log("BASE FAILED", name, e.message);
    throw e;
  }
}
let academic = await readFile(
  root + "/supabase/migrations/20260913085906_academic_foundation.sql",
  "utf8",
);
for (const name of ["has_module_entitlement", "is_feature_enabled"]) {
  const start = academic.indexOf(
    "create or replace function public." + name + "(",
  );
  const end = academic.indexOf("$$;", start) + 3;
  await db.exec(academic.slice(start, end));
}
let shared = await readFile(
  root + "/supabase/migrations/20260919172011_shared_services.sql",
  "utf8",
);
await db.exec(
  shared.slice(
    shared.indexOf("create table public.audit_events"),
    shared.indexOf("create table public.documents"),
  ),
);
let audit = await readFile(
  root + "/supabase/migrations/20260919172903_harden_shared_services.sql",
  "utf8",
);
const start = audit.indexOf(
  "create or replace function private.capture_audit_event",
);
await db.exec(audit.slice(start, audit.indexOf("$$;", start) + 3));
for (const name of [
  "studio-persistence-proposal.sql",
  "studio-private-assets-proposal.sql",
]) {
  let sql = await readFile(root + "/docs/security/" + name, "utf8");
  sql = sql.replace(/do \$\$ begin raise exception[^;]+; end \$\$;/, "");
  try {
    await db.exec(sql);
    console.log("PASS SQL", name);
  } catch (e) {
    console.log("FAIL SQL", name, e.message);
    throw e;
  }
}
console.log("PostgreSQL", (await db.query("select version()")).rows[0]);

const id = (n) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");
await db.exec(`insert into auth.users(id,email) values ('${id(1)}','owner@synthetic.test'),('${id(2)}','teacher@synthetic.test'),('${id(3)}','foreign@synthetic.test');
insert into public.organizations(id,name,slug,created_by) values('${id(11)}','Synthetic A','synthetic-a','${id(1)}'),('${id(12)}','Synthetic B','synthetic-b','${id(3)}');
insert into public.locations(id,organization_id,name) values('${id(31)}','${id(11)}','Synthetic A'),('${id(32)}','${id(12)}','Synthetic B');
insert into public.schools(id,organization_id,location_id,name,code) values('${id(21)}','${id(11)}','${id(31)}','Synthetic School A','QA1'),('${id(22)}','${id(11)}','${id(31)}','Synthetic School B','QA2'),('${id(23)}','${id(12)}','${id(32)}','Synthetic Foreign School','QA3');
insert into public.organization_memberships(organization_id,user_id,all_schools) values('${id(11)}','${id(1)}',true),('${id(11)}','${id(2)}',false),('${id(12)}','${id(3)}',true) on conflict do nothing;
insert into public.school_memberships(organization_id,school_id,user_id) values('${id(11)}','${id(21)}','${id(2)}');
insert into public.plans(key,name,description) values('professional','Professional','Synthetic test plan') on conflict do nothing;
insert into public.plan_module_entitlements(plan_id,module_id) select p.id,m.id from public.plans p cross join public.product_modules m where p.key='professional' and m.key='foundation' on conflict do nothing;
insert into public.organization_plans(organization_id,plan_id,status,starts_at) select '${id(11)}',id,'active',now()-interval '1 day' from public.plans where key='professional' on conflict(organization_id) do update set plan_id=excluded.plan_id,status=excluded.status,starts_at=excluded.starts_at;`);
let passed = 0;
function assert(value, label) {
  if (!value) throw Error(label);
  console.log("PASS", label);
  passed++;
}
async function as(user, query, params = [], role = "authenticated") {
  await db.exec("begin");
  try {
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
      user ?? "",
    ]);
    await db.exec("set local role " + role);
    const r = await db.query(query, params);
    await db.exec("commit");
    return r.rows;
  } catch (e) {
    await db.exec("rollback");
    throw e;
  }
}
async function denied(
  user,
  sql,
  params,
  label,
  code = "42501",
  role = "authenticated",
) {
  try {
    await as(user, sql, params, role);
    throw Error("Unexpected success: " + label);
  } catch (e) {
    assert(e.code === code, label + " [" + e.code + "]");
  }
}
const org = id(11),
  school = id(21),
  owner = id(1),
  teacher = id(2),
  foreign = id(3);
const config = {
  themeId: "emerald",
  preset: "executive",
  focalX: 50,
  focalY: 50,
  overlay: 0.65,
};
const save =
  "select public.save_school_branding_draft($1,$2,$3,$4,$5::jsonb,null) as id";
assert(
  (
    await as(
      owner,
      "select public.school_branding_images_allowed($1,$2) as ok",
      [org, school],
    )
  )[0].ok,
  "explicit premium image eligibility",
);
await denied(
  null,
  save,
  [org, school, 0, id(51), config],
  "anonymous save",
  "42501",
  "anon",
);
await denied(teacher, save, [org, school, 0, id(51), config], "teacher save");
await denied(
  foreign,
  save,
  [org, school, 0, id(51), config],
  "foreign Owner save",
);
await denied(
  owner,
  save,
  [org, id(23), 0, id(51), config],
  "foreign school save",
);
await denied(
  owner,
  save,
  [org, school, null, id(51), config],
  "null revision save",
  "40001",
);
const v = (await as(owner, save, [org, school, 0, id(51), config]))[0].id;
assert(
  (await as(owner, save, [org, school, 0, id(51), config]))[0].id === v,
  "identical draft retry",
);
await denied(
  owner,
  save,
  [org, school, 0, id(51), { ...config, preset: "analytics" }],
  "mismatched retry",
  "23514",
);
await denied(
  owner,
  save,
  [org, school, 0, id(52), config],
  "stale revision",
  "40001",
);
await denied(
  teacher,
  "insert into public.school_branding_state(organization_id,school_id,updated_by) values($1,$2,$3)",
  [org, school, teacher],
  "direct table mutation",
);
await denied(
  teacher,
  "insert into storage.objects(bucket_id,name) values('schoolflow-branding','forged')",
  [],
  "direct raw Storage upload",
);
await db.exec(
  "create policy unrelated_broad_upload on storage.objects for insert to authenticated with check(true)",
);
await denied(
  teacher,
  "insert into storage.objects(bucket_id,name) values('schoolflow-branding','forged')",
  [],
  "restrictive policy defeats broad permissive upload",
);
assert(
  (await as(teacher, "select * from public.school_branding_versions"))
    .length === 0,
  "teacher cannot read draft",
);
const pub = "select public.publish_school_branding($1,$2,$3,$4) as id";
await denied(teacher, pub, [org, school, v, 1], "teacher publication");
assert(
  (await as(owner, pub, [org, school, v, 1]))[0].id === v,
  "Owner publishes",
);
assert(
  (await as(owner, pub, [org, school, v, 1]))[0].id === v,
  "publication retry",
);
assert(
  (await as(teacher, "select * from public.school_branding_versions"))
    .length === 1,
  "school member reads only published version",
);
assert(
  (await as(foreign, "select * from public.school_branding_versions"))
    .length === 0,
  "foreign tenant reads no versions",
);
const restored = (
  await as(
    owner,
    "select public.save_school_branding_draft($1,$2,2,$3,$4::jsonb,$5) as id",
    [org, school, id(53), config, v],
  )
)[0].id;
assert(restored !== v, "restore appends new version");
assert(
  (
    await db.query(
      "select count(*)::int as n from public.audit_events where actor_user_id=$1",
      [owner],
    )
  ).rows[0].n >= 5,
  "audit identifies Owner",
);
const asset = id(71);
await as(
  null,
  `insert into public.school_branding_assets(id,organization_id,school_id,object_key,sha256,byte_size,width,height,mime_type,processor_version,created_by) values($1,$2,$3,$4,$5,1000,1280,720,'image/webp','fixture-only',$6)`,
  [asset, org, school, `${org}/${school}/${asset}.webp`, "a".repeat(64), owner],
  "service_role",
);
assert(
  (
    await db.query(
      "select actor_user_id from public.audit_events where entity_id=$1",
      [asset],
    )
  ).rows[0].actor_user_id === owner,
  "processor audit retains verified Owner actor",
);
const imageSave =
  "select public.save_school_branding_asset_draft($1,$2,$3,$4,$5::jsonb,$6,null) as id";
await denied(
  teacher,
  imageSave,
  [org, school, 3, id(61), config, asset],
  "teacher asset binding",
);
await denied(
  owner,
  imageSave,
  [org, school, 3, id(61), config, id(72)],
  "unregistered asset binding",
);
const imageVersion = (
  await as(owner, imageSave, [org, school, 3, id(61), config, asset])
)[0].id;
assert(
  (await as(owner, imageSave, [org, school, 3, id(61), config, asset]))[0]
    .id === imageVersion,
  "image draft retry",
);
await denied(
  owner,
  imageSave,
  [org, school, 4, id(51), config, asset],
  "cannot retrofit image onto published version",
  "23514",
);
await denied(
  owner,
  pub,
  [org, school, imageVersion, null],
  "null publication revision",
  "40001",
);
await db.exec(
  `update public.organization_plans set plan_id=(select id from public.plans where key='starter') where organization_id='${org}'`,
);
await denied(
  owner,
  pub,
  [org, school, imageVersion, 4],
  "downgraded image publication",
);
await db.exec(
  `update public.organization_plans set plan_id=(select id from public.plans where key='professional') where organization_id='${org}'`,
);
assert(
  (await as(owner, pub, [org, school, imageVersion, 4]))[0].id === imageVersion,
  "entitled image publication",
);
await denied(
  owner,
  "update public.school_branding_version_assets set asset_id=$1",
  [asset],
  "direct binding mutation",
);
await db.exec(
  `update public.organization_plans set status='expired' where organization_id='${org}'`,
);
assert(
  !(
    await as(
      owner,
      "select public.school_branding_images_allowed($1,$2) as ok",
      [org, school],
    )
  )[0].ok,
  "expired image eligibility denied",
);
await denied(
  owner,
  save,
  [org, school, 3, id(54), config],
  "expired plan draft",
  "42501",
);
await db.exec(
  `update public.organization_plans set status='trialing' where organization_id='${org}'`,
);
assert(
  !(
    await as(
      owner,
      "select public.school_branding_images_allowed($1,$2) as ok",
      [org, school],
    )
  )[0].ok,
  "trial image eligibility denied",
);
await db.exec(
  `update public.organization_plans set status='active',plan_id=(select id from public.plans where key='starter') where organization_id='${org}'`,
);
assert(
  !(
    await as(
      owner,
      "select public.school_branding_images_allowed($1,$2) as ok",
      [org, school],
    )
  )[0].ok,
  "downgrade image eligibility denied",
);
console.log("TOTAL PASS", passed);
await db.close();
