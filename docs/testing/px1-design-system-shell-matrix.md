# PX1 Design System & Application Shell acceptance matrix

| Criterion                                      | Evidence                                           | Status                  |
| ---------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Semantic design-token system                   | `src/app/globals.css`; design contract test        | PASS                    |
| Calm, professional visual character            | `/px1-reference`; review captures                  | PENDING FOUNDER REVIEW  |
| Shared action/form/card/status/data components | `src/components/ui` and primitive tests            | PASS                    |
| Desktop collapsible sidebar                    | `ApplicationShell`, navigation tests               | PASS                    |
| Purpose-built mobile drawer                    | navigation focus/Escape tests                      | PASS                    |
| Deliberate tablet layout                       | `md` shell/sidebar and responsive reference layout | PASS                    |
| Work-oriented navigation groups                | authorization catalog contract test                | PASS                    |
| Permission parity                              | `buildWorkspaceAccess` unchanged; navigation tests | PASS                    |
| Entitlement/feature reasons remain distinct    | evaluator plus unavailable-item tests              | PASS                    |
| Search/notification route parity               | Application shell tests                            | PASS                    |
| Organization/school Context Ribbon             | context component and tests                        | PASS                    |
| Academic context and fallback                  | academic resolver and context tests                | PASS                    |
| Existing authorized context switch reused      | `switchContext`; `ContextRibbon`                   | PASS                    |
| Restrained tenant accent boundary              | CSS semantic tokens; PX1 design record             | PASS                    |
| Loading/empty/error/access/setup states        | `LoadingSkeleton`, `StatePanel`, primitive tests   | PASS                    |
| Bounded synthetic reference route              | `/px1-reference`                                   | PASS                    |
| No schema/data/account changes                 | Git diff and migration inventory                   | PASS                    |
| Reduced-motion support                         | CSS and design contract test                       | PASS                    |
| Formatting, lint, TypeScript, tests, build     | local gate; Actions #204 (pre-audit steps)         | PASS                    |
| Desktop/tablet/mobile screenshots              | protected-preview founder inspection              | BLOCKED — NETLIFY SSO   |
| Preview deployment                             | PR #91 latest Netlify deploy, Ready                | PASS                    |
| Dependency audit                               | unchanged base: 3 high, 4 moderate, 1 low          | BLOCKED — M13 HARDENING |
| Production rollout withheld                    | PR remains unmerged pending founder approval       | PASS                    |

## Founder gate

PX1 must remain unmerged until the founder reviews the reference deployment and
explicitly approves production rollout or requests a revision. PX2 and
Prototype Packs A–E are not authorized by this matrix.
