# Option B+ QA environment

## Isolated resources

- Supabase QA project: `schoolflow-px6-qa` (`afqykqlxecpzspjoyegc`, `eu-west-1`).
- Production Supabase project: `bgnmvfktscofbwpyougd`.
- Netlify QA site: `schoolflow-demo-qa` (`1194e892-3c11-4a68-99d3-97eb6f745e75`).
- The QA site currently requires Netlify team SSO for all deploys.

The three public Next.js environment values on the dedicated Netlify QA site point to the QA Supabase project. No production site variables were read or changed. The publishable Supabase key is public by design; never place a Supabase secret/service-role key in a `NEXT_PUBLIC_` variable or browser bundle.

## Applying migrations safely

The Supabase CLI must be authenticated from an interactive Codespaces terminal. Set `QA_SUPABASE_PROJECT_REF=afqykqlxecpzspjoyegc`, then run:

```sh
pnpm db:push:qa
```

The guard refuses any other target, rejects an application URL that does not identify the QA project, requires CLI authentication and an interactive terminal, and runs `supabase db push` with the exact QA project ref, `--skip-vault`, and without `--include-seed`. It never calls `db reset` or points a command at production. Enter the QA database password only into the CLI prompt; do not paste it into chat or commit it.

Do not use the Supabase MCP `apply_migration` endpoint for this repository's 69 versioned files: that endpoint assigns server-generated migration versions, which do not match the source timestamps and leave remote-only migration-history rows. Use the guarded CLI push so Supabase records each repository migration version exactly.

## Current setup status

- The QA Supabase project is healthy and had no application migrations before initialization.
- The QA Netlify site is protected by team SSO and has QA-only public application configuration.
- No database migration or tenant seed has been applied yet.
- Auth redirect URLs and Auth sign-up settings still need configuring in the QA Supabase Dashboard only.
- The Netlify site still needs its Git repository/branch build connection before it can deploy this application.
- Do not use `supabase db reset` against a hosted project. The repository's seed file is intentionally empty.

## Tenant and identity safety

Create separate synthetic Cedarbridge Demo and disposable Internal QA tenants only after the migrations are applied and verified. Do not copy production identities or records. Create identities through Supabase Auth Admin or the supported invitation flow; do not write directly to `auth.users`. Keep payment providers disabled and notifications directed to a non-delivering local sink until QA-safe delivery is independently confirmed. Do not grant interactive users service-role credentials.

The Demo tenant must not be included in ordinary reset routines. Reset only the explicitly disposable Internal QA tenant, with a project-ref guard and a tenant-id allowlist.
