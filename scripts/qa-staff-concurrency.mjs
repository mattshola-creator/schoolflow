// QA-only database-role retry test. Requires psql and a secure, direct QA connection.
// No passwords/connection URLs are accepted as arguments or printed.
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
const project = "afqykqlxecpzspjoyegc";
const host = process.env.PGHOST ?? "",
  user = process.env.PGUSER ?? "";
const direct = host === `db.${project}.supabase.co`;
const pooler =
  /^[a-z0-9.-]+\.pooler\.supabase\.com$/.test(host) &&
  user === `postgres.${project}`;
if ((!direct && !pooler) || process.env.PGSSLMODE !== "verify-full")
  throw new Error(
    "Verified QA PostgreSQL connection required; production is refused",
  );
const config = JSON.parse(await readFile(process.argv[2] ?? "", "utf8"));
const fields = [
  "ownerUserId",
  "teacherUserId",
  "organizationId",
  "schoolId",
  "departmentId",
  "positionId",
  "roleId",
];
for (const key of fields)
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      config[key] ?? "",
    )
  )
    throw new Error(`Invalid fixture identifier: ${key}`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(config.startedOn ?? ""))
  throw new Error("startedOn required");
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const call = `public.create_staff_record(${[config.organizationId, config.schoolId, config.departmentId, config.positionId, "QA Assessment", "Teacher", "SFQA/TEACHER/001", "permanent", config.startedOn, "qa-assessment-teacher@schoolflow.test"].map(quote).join(",")},null,${quote(config.teacherUserId)},${quote(config.roleId)})`;
const identity = `select set_config('request.jwt.claim.sub',${quote(config.ownerUserId)},true); set local role authenticated;`;
function session(name) {
  const child = spawn("psql", ["-X", "-qAt", "-v", "ON_ERROR_STOP=1"], {
    env: { ...process.env, PGAPPNAME: name },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let stdout = "",
    stderr = "";
  const waiters = [];
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
    for (const resolve of waiters.splice(0)) resolve();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  const done = new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve(stdout)
        : reject(
            new Error(
              "psql failed; inspect private local logs, never publish credentials",
            ),
          ),
    );
  });
  return {
    child,
    done,
    write: (sql) => child.stdin.write(sql),
    text: () => stdout,
    changed: () => new Promise((r) => waiters.push(r)),
    privateError: () => stderr,
  };
}
async function query(sql) {
  const s = session("schoolflow-qa-staff-observer");
  s.write(`${sql}\n\\q\n`);
  s.child.stdin.end();
  return s.done;
}
const countsSql = `select json_build_object('staff',(select count(*) from public.staff_profiles sp join public.profiles p on p.person_id=sp.person_id where p.id=${quote(config.teacherUserId)} and sp.organization_id=${quote(config.organizationId)}),'employment',(select count(*) from public.employments where user_id=${quote(config.teacherUserId)} and organization_id=${quote(config.organizationId)} and status='active'),'assignments',(select count(*) from public.staff_assignments sa join public.employments e on e.id=sa.employment_id where e.user_id=${quote(config.teacherUserId)} and sa.school_id=${quote(config.schoolId)} and sa.status='active'));`;
const before = JSON.parse((await query(countsSql)).trim());
if (before.staff !== 1 || before.employment !== 1 || before.assignments !== 1)
  throw new Error(
    "Prepare exactly one existing canonical staff/employment/assignment through Owner operations first",
  );
const a = session("schoolflow-qa-staff-a"),
  b = session("schoolflow-qa-staff-b");
const deadline = setTimeout(() => {
  a.child.kill();
  b.child.kill();
}, 20000);
try {
  a.write(`begin; ${identity} select ${call}; select 'LOCK_HELD';\n`);
  while (!a.text().includes("LOCK_HELD"))
    await Promise.race([
      a.changed(),
      a.done.then(() => {
        throw new Error("First session ended before barrier");
      }),
    ]);
  b.write(`begin; ${identity} select ${call}; commit;\n\\q\n`);
  b.child.stdin.end();
  let blocked = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    const result = await query(
      "select exists(select 1 from pg_stat_activity waiting join pg_stat_activity holder on holder.application_name='schoolflow-qa-staff-a' where waiting.application_name='schoolflow-qa-staff-b' and holder.pid=any(pg_blocking_pids(waiting.pid)));",
    );
    if (result.trim() === "t") {
      blocked = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!blocked)
    throw new Error(
      "No overlapping lock wait observed: concurrency gate remains OPEN",
    );
  a.write("commit;\n\\q\n");
  a.child.stdin.end();
  const [left, right] = await Promise.all([a.done, b.done]);
  const ids = (text) =>
    text.split(/\r?\n/).filter((line) => /^[a-f0-9-]{36}$/.test(line));
  const leftProfile = ids(left).at(-1),
    rightProfile = ids(right).at(-1);
  if (!leftProfile || leftProfile !== rightProfile)
    throw new Error("Retries did not return the same staff profile");
  const after = JSON.parse((await query(countsSql)).trim());
  if (JSON.stringify(after) !== JSON.stringify(before))
    throw new Error("Retry duplicated staff effects");
  console.log(
    JSON.stringify({
      evidence: "QA database-role test, not browser identity evidence",
      overlappingLockWaitVerified: true,
      sameProfile: true,
      countsBefore: before,
      countsAfter: after,
    }),
  );
} finally {
  clearTimeout(deadline);
  if (a.child.exitCode === null) a.child.kill();
  if (b.child.exitCode === null) b.child.kill();
}
