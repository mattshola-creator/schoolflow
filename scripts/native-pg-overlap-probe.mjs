import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";

// Infrastructure evidence only. No application records, credentials or hosted endpoints.
assert.equal(process.env.GITHUB_ACTIONS, "true", "GitHub Actions lab required");
assert.equal(process.env.PGHOST, "127.0.0.1", "Loopback service required");
assert.equal(process.env.PGDATABASE, "schoolflow_disposable_probe");
const requireDriver = createRequire(
  path.join(process.env.RUNNER_TEMP, "native-pg-driver", "package.json"),
);
const { Client } = requireDriver("pg");
const clients = [];
let pending;
try {
  for (let index = 0; index < 3; index += 1) {
    const client = new Client({ connectionTimeoutMillis: 5000 });
    await client.connect();
    clients.push(client);
    await client.query("set statement_timeout='12s'");
  }
  const [first, second, observer] = clients;
  const version = (
    await observer.query(
      "select current_setting('server_version') version,current_setting('server_version_num')::int number",
    )
  ).rows[0];
  assert.ok(version.number >= 170000 && version.number < 180000);
  const identities = await Promise.all(
    clients.map((client) => client.query("select pg_backend_pid() pid")),
  );
  const pids = identities.map((result) => result.rows[0].pid);
  assert.equal(new Set(pids).size, 3);
  await first.query("begin");
  await second.query("begin");
  await first.query("select pg_advisory_xact_lock(71824026)");
  let complete = false;
  pending = second.query("select pg_advisory_xact_lock(71824026)").then(
    () => {
      complete = true;
    },
    (error) => {
      complete = true;
      throw error;
    },
  );
  let blocked = false;
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const state = (
      await observer.query(
        "select $2::int=any(pg_blocking_pids($1)) blocked,(select state from pg_stat_activity where pid=$2) holder_state",
        [pids[1], pids[0]],
      )
    ).rows[0];
    if (state.blocked) {
      assert.equal(state.holder_state, "idle in transaction");
      assert.equal(complete, false);
      blocked = true;
      break;
    }
    if (complete) break;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.equal(blocked, true, "Actual overlapping lock wait required");
  await first.query("commit");
  await pending;
  await second.query("rollback");
  assert.equal(
    (await observer.query("select pg_advisory_unlock_all()")) !== undefined,
    true,
  );
  console.log(
    JSON.stringify({
      postgres: version.version,
      independentConnections: 3,
      openTransactionObserved: true,
      actualBlockingObserved: true,
      releaseAfterCommit: true,
      waitingTransactionRolledBack: true,
      applicationConcurrencyAcceptance: "NOT_RUN",
      hostedResourcesAccessed: false,
    }),
  );
} catch {
  console.error("Native PostgreSQL overlap probe failed; domain gates stay open.");
  process.exitCode = 1;
} finally {
  // Closing all disposable sessions releases any outstanding transaction locks.
  await Promise.allSettled(clients.map((client) => client.end()));
  if (pending) await Promise.allSettled([pending]);
}
