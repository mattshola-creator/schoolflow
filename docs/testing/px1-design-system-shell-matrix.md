# PX1 Design System & Application Shell acceptance matrix

| Criterion                                      | Evidence                                            | Status                  |
| ---------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Semantic design-token system                   | `src/app/globals.css`; design contract test         | PASS                    |
| Calm, professional visual character            | founder acceptance at `6eac996`                     | PASS                    |
| Shared action/form/card/status/data components | `src/components/ui` and primitive tests             | PASS                    |
| Desktop collapsible sidebar                    | `ApplicationShell`, navigation tests                | PASS                    |
| Purpose-built mobile drawer                    | viewport/scroll/backdrop/focus tests at 320/375/390 | PASS                    |
| Deliberate tablet layout                       | `md` shell/sidebar and responsive reference layout  | PASS                    |
| Work-oriented navigation groups                | authorization catalog contract test                 | PASS                    |
| Permission parity                              | `buildWorkspaceAccess` unchanged; navigation tests  | PASS                    |
| Entitlement/feature reasons remain distinct    | evaluator plus unavailable-item tests               | PASS                    |
| Search/notification route parity               | Application shell tests                             | PASS                    |
| Organization/school Context Ribbon             | context component and tests                         | PASS                    |
| Academic context and fallback                  | academic resolver and context tests                 | PASS                    |
| Existing authorized context switch reused      | `switchContext`; `ContextRibbon`                    | PASS                    |
| Restrained tenant accent boundary              | CSS semantic tokens; PX1 design record              | PASS                    |
| Loading/empty/error/access/setup states        | `LoadingSkeleton`, `StatePanel`, primitive tests    | PASS                    |
| Bounded synthetic reference route              | `/px1-reference`                                    | PASS                    |
| No schema/data/account changes                 | Git diff and migration inventory                    | PASS                    |
| Reduced-motion support                         | CSS and design contract test                        | PASS                    |
| Formatting, lint, TypeScript, tests, build     | local gate; Actions #210 (pre-audit steps)          | PASS                    |
| Desktop/tablet/mobile responsive review        | founder inspection and formal acceptance            | PASS                    |
| Preview deployment                             | PR #91 latest Netlify deploy, Ready                 | PASS                    |
| Dependency audit                               | 4 high, 4 moderate, 1 low; M13 PR #92 prepared      | BLOCKED — M13 HARDENING |
| Production rollout withheld                    | PR remains unmerged pending founder approval        | PASS                    |

## Production acceptance closeout

| Criterion                                      | Evidence                                                                                                                   | Status                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Founder-authorized production merge            | PR #91; `bf9d1c873c7db7abfb9f30fb1f8035aa9c094a93`                                                                         | PASS                                                |
| Exact production deployment                    | Netlify `6ac895f191b4a60008569588`, Ready                                                                                  | PASS                                                |
| Production secret scan                         | 373 files; zero matches                                                                                                    | PASS                                                |
| Login, persistence, logout and protected route | Read-only production browser smoke                                                                                         | PASS                                                |
| Password-recovery entry                        | `/forgot-password`, no request submitted                                                                                   | PASS                                                |
| Desktop shell and Context Ribbon               | Authenticated production dashboard                                                                                         | PASS                                                |
| Permission and entitlement presentation        | Available links plus safe direct-route denials                                                                             | PASS                                                |
| Available module read-only smoke               | Dashboard, Action Center, Students/360, Staff, Admissions, Academic Setup, Documents, Communication, Administration, Audit | PASS                                                |
| Live production mobile recheck                 | Fixed cloud-browser desktop viewport                                                                                       | NOT REPEATED — prior founder/test evidence retained |
| Multi-school context switching                 | Acceptance identity exposed one school                                                                                     | NOT EXERCISED                                       |
| Permanent founder-owner identity               | Browser displayed `test@schoolflow.com`                                                                                    | NOT INDEPENDENTLY VERIFIED                          |
| Netlify runtime logs                           | Connector exposed deploy/function state, not runtime log querying                                                          | PARTIAL                                             |
| SchoolFlow-origin browser errors               | No application-origin warnings/errors observed                                                                             | PASS                                                |
| Database, RLS, entitlement and data changes    | PX1 diff contains no migration; smoke was read-only                                                                        | PASS                                                |

## Founder gate

Founder visual acceptance is complete at revision `6eac996`. PX1 must remain
unmerged until M13 PR #92 resolves the production dependency paths, the
residual development-only advisory receives an explicit release decision, PX1
is updated onto hardened `main`, and production merge is explicitly
authorized. PX2 and Prototype Packs A–E are not authorized by this matrix.
