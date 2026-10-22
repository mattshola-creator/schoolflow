# QA teacher security repair

QA execution only was founder-authorized on 22 October 2026. No production application or merge authorized.

The canonical staff RPC retains its signature, definer/search-path settings and existing grants/capability checks. It locks the linked active profile, reuses its canonical person, checks existing staff/employment/assignment before insertion, and reuses an effective matching role. The follow-up qualification migration fixes an ambiguous PL/pgSQL person variable found by an atomically rejected Owner submission. Both applied migration records are preserved. No partial staff records resulted from that failure.

Read scope: result_batches_select and assessment_scores_select previously admitted any school score-view user. The new ID-only can_read_result_batch predicate validates existing module/feature/membership/permission gates, then requires the existing exact effective teacher assignment unless the caller has configuration authority or authorized management result-view access. The definer avoids RLS recursion, returns only a boolean, uses an empty search_path and denies PUBLIC/anon execution. Existing student_subject_results and result_publications management policies remain unchanged. No academic setup permissions are added.

The application now distinguishes an RLS-hidden/absent batch from a query failure using scoped maybeSingle; only the former becomes a record-free authorization denial. Unexpected query failures remain errors. Existing optional teaching-assignment input is exposed on the Owner batch form and validated against organization, school, session, class, subject and arm before insert.

Validation so far: rolled-back full RPC invocation; actual Owner creation with canonical linkage; sequential retries returned the same profile. Attempted parallel MCP SQL calls were serialized (transaction timestamps did not overlap), so concurrency remains OPEN. Require a direct QA multi-connection runner for genuine overlap, plus cross-tenant, conflicting-input, dates and actor/audit assertions. Do not substitute Promise.all submission for overlap proof.

Before release: complete assigned draft/save/submit and unauthorized workflow tests, exact-head hosted CI, advisor review, independent secret scan and unsuppressed dependency audit. PX6 remains HOLD. Review-only rollback SQL restores former behavior and must never run automatically: it would reopen the read defect. Prefer a reviewed forward fix for any regression.
