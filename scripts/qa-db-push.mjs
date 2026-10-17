import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const QA_PROJECT_REF = "afqykqlxecpzspjoyegc";
const PRODUCTION_PROJECT_REF = "bgnmvfktscofbwpyougd";

function stop(message) {
  console.error(`QA migration push stopped: ${message}`);
  process.exit(1);
}

const requestedRef = process.env.QA_SUPABASE_PROJECT_REF?.trim();
if (requestedRef !== QA_PROJECT_REF) {
  stop(
    `set QA_SUPABASE_PROJECT_REF to the allowlisted QA project ${QA_PROJECT_REF}.`,
  );
}
if (requestedRef === PRODUCTION_PROJECT_REF) {
  stop("the configured target is the production project.");
}

const appUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
if (appUrl) {
  let appRef;
  try {
    appRef = new URL(appUrl).hostname.split(".")[0];
  } catch {
    stop("the configured Supabase URL is invalid.");
  }
  if (appRef !== QA_PROJECT_REF || appRef === PRODUCTION_PROJECT_REF) {
    stop(
      "the configured application URL does not point to the allowlisted QA project.",
    );
  }
}

const hasCliToken =
  Boolean(process.env.SUPABASE_ACCESS_TOKEN) ||
  existsSync(join(homedir(), ".supabase", "access-token"));
if (!hasCliToken) {
  stop(
    "authenticate the Supabase CLI first with `supabase login` or SUPABASE_ACCESS_TOKEN.",
  );
}
if (!process.stdin.isTTY) {
  stop(
    "run from an interactive terminal so Supabase can request the QA database password safely.",
  );
}

console.log(
  `Applying repository migrations to QA project ${QA_PROJECT_REF} only.`,
);
console.log(
  "Vault updates and seed files are excluded; production is not an allowed target.",
);

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "supabase",
    "db",
    "push",
    "--project-ref",
    QA_PROJECT_REF,
    "--skip-vault",
    "--yes",
  ],
  { stdio: "inherit", env: process.env },
);

if (result.error) stop(result.error.message);
process.exit(result.status ?? 1);
