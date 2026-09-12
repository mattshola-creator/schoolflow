# Known Issues

## Open

- Netlify project `schoolflow-app` exists with the public Supabase environment values, but a GitHub repository connection and production deployment have not yet been verified.
- Local Git transport remains unauthenticated. GitHub publication and verification currently use the authenticated connector, whose remote commit SHAs differ from the equivalent local checkpoint SHAs.

## Closed

- The canonical GitHub repository is populated with the deployable M0 source. Product specifications and agent instruction files were intentionally excluded because the repository is public.
- GitHub Actions run #1 found a clean-environment `LayoutProps` type failure. The root layout now uses an explicit `ReactNode` prop type.
- GitHub Actions run #2 passed the full M0 CI quality job on remote commit `09359d6`.
- The Supabase `SchoolFlow` development project is visible and healthy. The M0 migration is applied, private-schema access is denied to `public`, `anon`, and `authenticated`, generated types are synchronized, and database advisors report no findings.
