# Known Issues

## Open

- Local Git transport remains unauthenticated. GitHub publication and verification currently use the authenticated connector, whose remote commit SHAs differ from the equivalent local checkpoint SHAs.
- Docker is unavailable in the current execution environment. This does not block M0 because the development-project migration, access restrictions, advisors and application connectivity were verified remotely.
- Supabase security advisor reports intentional warnings for authenticated `SECURITY DEFINER` functions. Each has a fixed empty search path, explicit authenticated grant, revoked anonymous/public execution and caller/scope validation.
- Supabase performance advisor reports informational missing-index, unused-index and permissive-policy overlap findings. These should be revisited against measured workloads.

## Closed

- The canonical GitHub repository is populated with the deployable M0 source. Product specifications and agent instruction files were intentionally excluded because the repository is public.
- GitHub Actions run #1 found a clean-environment `LayoutProps` type failure. The root layout now uses an explicit `ReactNode` prop type.
- GitHub Actions run #2 passed the full M0 CI quality job on remote commit `09359d6`.
- GitHub Actions run #3 passed after the Supabase verification records and generated types were published to remote commit `fe7fe57`.
- The Supabase `SchoolFlow` development project is visible and healthy. The M0 migration is applied, private-schema access is denied to `public`, `anon`, and `authenticated`, generated types are synchronized, and database advisors report no findings.
- Netlify visitor SSO is limited to non-production deploys so the production SaaS URL remains public while previews stay protected.
- Netlify production deploy `6aa5a572b311610008ff633a` succeeded from GitHub commit `1087bd3`; `/` and `/api/health` returned HTTP 200 and health reported Supabase as connected.
