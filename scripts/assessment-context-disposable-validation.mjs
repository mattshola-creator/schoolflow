// Disposable in-memory PostgreSQL only. Never connects to Supabase or accepts credentials.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const { PGlite } = await import(
  process.env.SCHOOLFLOW_PGLITE_MODULE ?? "@electric-sql/pglite"
);
const db = new PGlite();
const root = fileURLToPath(new URL("../", import.meta.url));
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const q = (value) => `'${String(value).replaceAll("'", "''")}'`;
let assertions = 0;
function check(value, label) {
  assert.ok(value, label);
  assertions++;
  console.log("PASS", label);
}
await db.exec(`create role anon; create role authenticated; create schema auth; create schema private;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('fixture.user',true),'')::uuid $$;
grant usage on schema auth to authenticated,anon;
create table public.result_batches(id uuid primary key, organization_id uuid, school_id uuid, session_id uuid, period_id uuid, class_level_id uuid, class_arm_id uuid, subject_id uuid, teaching_assignment_id uuid);
create table public.teaching_assignments(id uuid primary key,organization_id uuid,school_id uuid,session_id uuid,class_level_id uuid,class_arm_id uuid,subject_id uuid,staff_assignment_id uuid,assignment_type text,status text,started_on date,ended_on date);
create table public.staff_assignments(id uuid primary key,organization_id uuid,school_id uuid,employment_id uuid,staff_profile_id uuid,status text,started_on date,ended_on date);
create table public.employments(id uuid primary key,organization_id uuid,user_id uuid,status text,started_on date,ended_on date);
create table public.staff_profiles(id uuid primary key,organization_id uuid,person_id uuid);
create table public.people(id uuid primary key,first_name text,last_name text);
create table public.profiles(id uuid primary key,person_id uuid);
create function public.can_access_assessments(o uuid,s uuid,p text,f text) returns boolean language sql stable as $$ select coalesce(o='00000000-0000-4000-8000-000000000010'::uuid and s='00000000-0000-4000-8000-000000000011'::uuid and current_setting('fixture.member',true)='true' and current_setting('fixture.entitled',true)='true' and case when p='academics.results.view' then current_setting('fixture.management',true)='true' else current_setting('fixture.score_view',true)='true' end,false) $$;
create function public.has_permission(o uuid,s uuid,p text) returns boolean language sql stable as $$ select coalesce(current_setting('fixture.configure',true)='true',false) $$;
create function public.can_view_staff(s uuid) returns boolean language sql stable as $$ select s is not null and coalesce(current_setting('fixture.staff_view',true)='true',false) $$;`);
for (const table of [
  "subjects",
  "academic_sessions",
  "academic_periods",
  "class_levels",
  "class_arms",
])
  await db.exec(
    `create table public.${table}(id uuid primary key,organization_id uuid,school_id uuid,name text,session_id uuid,class_level_id uuid);`,
  );
const helper = await readFile(
  root +
    "supabase/migrations/20261019192955_enforce_result_teacher_scope_and_insert_columns.sql",
  "utf8",
);
await db.exec(
  helper.slice(
    helper.indexOf(
      "create or replace function private.is_assigned_result_teacher",
    ),
    helper.indexOf("$$;") + 3,
  ),
);
const readContract = await readFile(
  root +
    "supabase/migrations/20261022145641_qa_canonical_staff_and_teacher_reads.sql",
  "utf8",
);
const start = readContract.indexOf(
  "create or replace function public.can_read_result_batch",
);
await db.exec(
  readContract.slice(start, readContract.indexOf("$$;", start) + 3),
);
await db.exec(`insert into public.result_batches values(${[20, 10, 11, 23, 24, 21, 25, 22, 26].map((n) => q(id(n))).join(",")});
insert into public.result_batches values(${[40, 41, 42, 23, 24, 21, 25, 22, 26].map((n) => q(id(n))).join(",")});
insert into public.teaching_assignments values(${[26, 10, 11, 23, 21, 25, 22, 27].map((n) => q(id(n))).join(",")},'subject_teacher','active',current_date-1,null);
insert into public.staff_assignments values(${[27, 10, 11, 28, 29].map((n) => q(id(n))).join(",")},'active',current_date-1,null);
insert into public.employments values(${[28, 10, 1].map((n) => q(id(n))).join(",")},'active',current_date-1,null);
insert into public.staff_profiles values(${[29, 10, 30].map((n) => q(id(n))).join(",")});
insert into public.people values(${q(id(30))},'Fictional','Teacher');
insert into public.profiles values(${q(id(1))},${q(id(30))});`);
for (const [table, n, name] of [
  ["subjects", 22, "Mathematics"],
  ["academic_sessions", 23, "Session A"],
  ["academic_periods", 24, "Term A"],
  ["class_levels", 21, "Class A"],
  ["class_arms", 25, "Blue"],
])
  await db.exec(
    `insert into public.${table} values(${[n, 10, 11].map((x) => q(id(x))).join(",")},${q(name)},${q(id(23))},${q(id(21))});`,
  );
const tables = [
  "result_batches",
  "teaching_assignments",
  "staff_assignments",
  "employments",
  "staff_profiles",
  "people",
  "profiles",
  "subjects",
  "academic_sessions",
  "academic_periods",
  "class_levels",
  "class_arms",
];
for (const table of tables)
  await db.exec(
    `alter table public.${table} enable row level security; grant select on public.${table} to authenticated;`,
  );
const proposal = await readFile(
  root + "docs/security/proposals/assessment-score-sheet-context.sql",
  "utf8",
);
// Remove the review-only execution guard ONLY from this in-memory test copy.
await db.exec(
  proposal.slice(
    proposal.indexOf(
      "create function public.get_assessment_score_sheet_context",
    ),
  ),
);
const call = (batch = 20, org = 10, school = 11) =>
  `select public.get_assessment_score_sheet_context(${[batch, org, school].map((n) => q(id(n))).join(",")}) as value`;
async function asUser(
  user = 1,
  flags = {},
  sql = call(),
  role = "authenticated",
) {
  await db.exec("begin");
  try {
    const settings = {
      user: user === null ? "" : id(user),
      member: "true",
      entitled: "true",
      score_view: "true",
      management: "false",
      configure: "false",
      staff_view: "false",
      ...flags,
    };
    for (const [key, value] of Object.entries(settings))
      await db.query("select set_config($1,$2,true)", [
        "fixture." + key,
        String(value),
      ]);
    await db.exec("set local role " + role);
    return await db.query(sql);
  } finally {
    await db.exec("rollback");
  }
}
async function denied(
  label,
  user,
  flags = {},
  sql = call(),
  role = "authenticated",
) {
  let rejected = false;
  try {
    await asUser(user, flags, sql, role);
  } catch (e) {
    rejected = e.code === "42501";
  }
  check(rejected, label);
}
try {
  const teacher = (await asUser()).rows[0].value;
  check(
    teacher.assignedTeacherName === "Fictional Teacher",
    "assigned Teacher receives own canonical name",
  );
  check(
    teacher.subjectName === "Mathematics" &&
      teacher.sessionName === "Session A" &&
      teacher.periodName === "Term A" &&
      teacher.className === "Class A" &&
      teacher.armName === "Blue",
    "batch-scoped academic labels",
  );
  check(
    Object.keys(teacher).sort().join(",") ===
      "armName,assignedTeacherName,className,periodName,sessionName,subjectName",
    "six-field serialization allowlist",
  );
  check(
    (await asUser(1, {}, "select * from public.people")).rows.length === 0,
    "direct people reads remain default-denied",
  );
  check(
    (await asUser(1, {}, "select * from public.academic_sessions")).rows
      .length === 0,
    "direct academic reads remain default-denied",
  );
  await denied("anonymous EXECUTE denied", null, {}, call(), "anon");
  await denied("missing authenticated identity denied", null);
  await denied("unknown batch denied", 1, {}, call(99));
  await denied("foreign organization denied", 1, {}, call(20, 99, 11));
  await denied("foreign school denied", 1, {}, call(20, 10, 99));
  await denied("unassigned identity denied", 2);
  await denied("existing foreign-school batch denied", 1, {}, call(40, 41, 42));
  await denied("suspended membership denied", 1, { member: "false" });
  await denied("expired entitlement denied", 1, { entitled: "false" });
  await denied("missing score permission denied", 1, { score_view: "false" });
  for (const [table, column, value, label] of [
    [
      "teaching_assignments",
      "status",
      "'ended'",
      "ended teaching assignment denied",
    ],
    ["employments", "status", "'suspended'", "inactive employment denied"],
    [
      "teaching_assignments",
      "subject_id",
      q(id(99)),
      "unassigned subject denied",
    ],
    [
      "teaching_assignments",
      "class_level_id",
      q(id(99)),
      "unassigned class denied",
    ],
    [
      "teaching_assignments",
      "school_id",
      q(id(99)),
      "foreign assignment school denied",
    ],
    [
      "teaching_assignments",
      "started_on",
      "current_date+1",
      "future assignment denied",
    ],
  ]) {
    const before = (
      await db.query(`select ${column} value from public.${table} limit 1`)
    ).rows[0].value;
    await db.exec(`update public.${table} set ${column}=${value}`);
    await denied(label, 1);
    await db.query(`update public.${table} set ${column}=$1`, [before]);
  }
  const management = (
    await asUser(3, { management: "true", score_view: "false" })
  ).rows[0].value;
  check(
    management.subjectName === "Mathematics" &&
      management.assignedTeacherName === null,
    "management batch access does not confer staff directory access",
  );
  check(
    (await asUser(3, { management: "true", staff_view: "true" })).rows[0].value
      .assignedTeacherName === "Fictional Teacher",
    "existing staff authority exposes canonical name",
  );
  await db.exec(`update public.profiles set person_id=${q(id(99))}`);
  check(
    (await asUser()).rows[0].value.assignedTeacherName === null,
    "canonical mismatch never exposes another person",
  );
  await db.exec(
    `update public.profiles set person_id=${q(id(30))}; update public.subjects set organization_id=${q(id(99))}`,
  );
  check(
    (await asUser()).rows[0].value.subjectName === null,
    "foreign metadata relationship filtered",
  );
  await db.exec(
    `update public.subjects set organization_id=${q(id(10))}; update public.result_batches set teaching_assignment_id=null`,
  );
  check(
    (await asUser(3, { management: "true" })).rows[0].value
      .assignedTeacherName === null,
    "historical missing assignment remains null",
  );
  check(
    (await db.query("select count(*)::int count from public.result_batches"))
      .rows[0].count === 2,
    "read endpoint preserves batch count",
  );
  check(
    !(
      await db.query(
        "select has_function_privilege('anon','public.get_assessment_score_sheet_context(uuid,uuid,uuid)','EXECUTE') allowed",
      )
    ).rows[0].allowed,
    "catalog confirms anonymous privilege absent",
  );
  console.log(
    `Disposable proposal assertions passed: ${assertions}. No hosted database or live authentication evidence.`,
  );
} finally {
  await db.close();
}
