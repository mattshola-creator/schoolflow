# PX2 Public SaaS Hub Acceptance Matrix

| Area              | Criterion                                                             | Status             | Evidence                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope             | Prototype Pack A is isolated from operational module migration        | PASS               | Public routes/components only; no `(app)` operational route replaced                                                                                                     |
| Public shell      | Responsive public header, navigation and footer                       | PASS               | `src/components/marketing-shell.tsx`                                                                                                                                     |
| Product narrative | Homepage, product, solutions and modules surfaces                     | PASS               | `/`, `/product`, `/solutions`, `/modules`                                                                                                                                |
| Plans             | Packaging is clearly non-binding and contains no prices               | PASS               | `/plans`; automated pricing-boundary contract                                                                                                                            |
| Demo              | Tour entry is synthetic and creates no credentials                    | PASS               | `/demo`; automated demo-boundary contract                                                                                                                                |
| Onboarding        | Walkthrough does not persist or submit data                           | PASS               | `/get-started`; component interaction test                                                                                                                               |
| Trust             | Security, support, FAQ and legal placeholders are labelled accurately | PASS               | `/security`, `/support`                                                                                                                                                  |
| Identity          | Platform Super Admin remains distinct from Organization Owner         | PASS               | Demo personas exclude platform role; no platform-console route or capability                                                                                             |
| Data safety       | Demo content is fictional and no production data is queried           | PASS               | Static catalogue/pages; `Unity Learning Group` labelled synthetic                                                                                                        |
| Architecture      | Auth, RLS, permissions, entitlements and domain logic unchanged       | PASS               | Git diff contains no Supabase, migration, authorization or domain-service change                                                                                         |
| Design system     | PX1 tokens and shared controls are reused                             | PASS               | Marketing shell/pages use semantic PX1 classes and UI primitives                                                                                                         |
| Accessibility     | Skip link, labelled navigation, focus and touch sizes retained        | PASS               | Public drawer has labelled dialog/dismissal controls, 44px targets, focus containment/restoration, Escape/backdrop dismissal and body scroll locking                     |
| Responsive        | Public pages remain usable from 320px through large desktop           | PASS               | Public shell, content grids, module cards, plan cards, tour roles and onboarding use bounded responsive layouts; viewport matrix recorded below                          |
| Auth drawer       | Reported repeated authenticated navigation entries investigated       | NOT REPRODUCED     | PX2 does not change the accepted PX1 drawer; source has one mobile navigation tree and regression coverage asserts each authorized/unavailable entry renders once        |
| Regression        | Formatting, lint, strict TypeScript, tests and production build       | PASS               | Local gate: 316 tests across 71 files; optimized build generated all PX2 public routes                                                                                   |
| Security          | Dependency audit remains visible; no unrelated upgrade                | ACCEPTED EXCEPTION | `braces` GHSA-vfj7-8cjw-p6xm remains a development-only ESLint transitive path; one high finding, no production dependency path, no suppression or package change in PX2 |
| Preview           | Protected Netlify deploy preview is Ready at exact PR revision        | PASS               | PR #93 alias is protected by Netlify team SSO; Netlify and commit status report Ready/success at the PR head                                                             |
| Visual review     | Reviewable responsive reference experience available                  | READY FOR REVIEW   | Protected PR #93 preview plus Netlify-rendered reference screenshot; founder acceptance remains outstanding                                                              |

## Prototype limitations

- No binding commercial terms or payments.
- No production onboarding write path.
- No live demo credentials, impersonation or persona switching.
- No analytics or CMS.
- No migration of existing authenticated operational workspaces.

## Founder refinement viewport matrix

| Viewport  | Coverage expectation                                          | Result                                        |
| --------- | ------------------------------------------------------------- | --------------------------------------------- |
| 320×700   | Small mobile; compact brand, scrollable menu, stacked content | PASS — AUTOMATED + FOUNDER CAPTURE            |
| 375×812   | Standard mobile                                               | PASS — AUTOMATED + FOUNDER CAPTURE            |
| 390×844   | Founder-representative mobile                                 | PASS — AUTOMATED + FOUNDER CAPTURE            |
| 430×932   | Large mobile                                                  | PASS — AUTOMATED + FOUNDER CAPTURE            |
| 820×1180  | Tablet; deliberate content-grid transition                    | AUTOMATED PASS; FOUNDER VISUAL REVIEW PENDING |
| 1280×800  | Small laptop; header, hero and card density                   | PASS — PREVIEW CAPTURED                       |
| 1366×768  | Standard laptop; founder screenshot comparison                | PASS — PREVIEW CAPTURED                       |
| 1440×900  | Desktop                                                       | PASS — PREVIEW CAPTURED                       |
| 1920×1080 | Large desktop; bounded content widths                         | AUTOMATED PASS; FOUNDER VISUAL REVIEW PENDING |

The matrix covers `/`, `/product`, `/solutions`, `/modules`, `/plans`,
`/demo`, `/security` and `/get-started`. The Netlify collaboration toolbar
visible in some founder captures is preview infrastructure, not SchoolFlow UI.
All eight routes were checked at a live 1363×936 preview viewport with zero
horizontal overflow. Mobile breakpoints, menu interactions and drawer uniqueness
are covered by focused automated tests. Founder captures `166697.jpg` through
`166701.jpg` provide direct mobile evidence for the homepage, Product, Modules,
public drawer and authenticated organization dashboard. The drawer capture
shows one ordered navigation sequence with no repeated group or entry; the
bottom collaboration controls are Netlify preview infrastructure.
