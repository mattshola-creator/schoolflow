# M10 Assessment & Results Acceptance Matrix

| Area                            | Evidence                                                            | Status      |
| ------------------------------- | ------------------------------------------------------------------- | ----------- |
| Configurable schemes/components | Versioned schemes, weighted components, activation RPC              | Implemented |
| Grade validation                | Contiguous 0–100 bands and 100% weight validation                   | Implemented |
| Score entry                     | Enrollment, bounds, assignment, lock, permission and feature checks | Implemented |
| Computation                     | Server-side weighted totals, grades and remarks                     | Implemented |
| Workflow                        | Valid server transitions with actor/timestamp evidence              | Implemented |
| Publication/correction          | Immutable snapshots and linked correction versions                  | Implemented |
| Report cards                    | Published-snapshot browser view/print foundation                    | Implemented |
| Promotion                       | Published-result prerequisite, transaction and idempotency          | Implemented |
| RLS/isolation                   | School policies, composite FKs and live cross-tenant denial         | Passed      |
| Entitlements                    | Five feature gates verified and restored disabled                   | Passed      |
| Automated tests                 | 257 passing across 57 files                                         | Passed      |
| TypeScript/lint                 | Strict TypeScript and zero-warning lint                             | Passed      |
| Build/security/advisors         | Build/audit/secret scan pass; advisor warnings reviewed             | Passed      |
| Production lifecycle QA         | `M10-QA-20261001` lifecycle and negative controls                   | Passed      |
| PR/CI/Netlify                   | PR #75, CI #171, merge `8fe6eee`, deploy `6abe5f60` Ready           | Passed      |

## Final production checkpoint — 2026-10-01

- Phase: M10-I closeout complete.
- Migrations: `m10_assessment_results`, `m10_promotion_idempotency_fix`, and `m10_promotion_target_session_date_fix` applied after rollback rehearsals.
- Release: PR #75; Actions run #171 passed; merge `8fe6eee03f1f778e83bc5fe6219c9300945bd45e`; Netlify deploy `6abe5f60483cbb00077f121f` Ready for that exact revision; health reports Supabase connected.
- Production QA: one scheme, two components, two grade bands, two students, four source scores, two computed results (80.00 and 50.00), one published two-result snapshot, one linked correction batch with four copied scores, and one idempotent promotion/future membership.
- Negative controls passed: score bound, enrollment, teacher assignment, cross-tenant scope, academic lock, feature disablement, and duplicate promotion.
- Audit: 24 scoped assessment/result events plus academic-lock evidence. Published actor/timestamps and immutable snapshot persist.
- Safe state: all five M10 overrides disabled; academic QA lock released with reason; QA user has zero active sessions; permanent owner and M7/M8/M9 evidence untouched.
- Fixtures: clearly labeled `M10-QA-20261001` evidence is preserved. No genuine academic data was modified.
