# Founder-authorized protected QA integration — 23 October 2026

This branch combines approved implementation milestones for QA acceptance only. It is not a production release branch. Source PRs remain draft and unmerged; production main, production Netlify and production Supabase are unchanged.

## Source revisions

| PR | Exact head | Integration |
| --- | --- | --- |
| #119 | 373be181061874fab2f851a759bdf6c3fb193355 | Included |
| #120 | 4f9f83643c0c8defc3f95ff20c15dc07b28ae5ba | Inherited visual foundation |
| #121 | dabd0ebf89ecf746d846abc70924434e618c459e | Inherited visual foundation |
| #122 | 1e0ca278826d6612a3c96eb6652d44f2137a6362 | Inherited visual foundation |
| #123 | ea32b85999a441fffcc08c9fdf07bb70665d932a | Included |
| #124 | d7ccf89cdbc03f7639ecfa38be33154ee0ea2549 | Included |
| #125 | 7ca669e29a0ab5d6c40998724c097db904564be0 | Included |
| #126 | 8c0b23490347ddcbaa657e89d57f410771f75d68 | Supported patches already in #125; head retained as parent |
| #127 | b5faa5561bf43aab61af579ccb6c70580be61f55 | Included |

The first parent is #125. Its shared-shell, twelve-theme gallery, dependency patches and Studio integration remain intact. Additional integration parents preserve #124, #126, #123 and #127 history. #124 also carries #119's latest source history. #119's two score-sheet denial-handling files are explicitly included because #125 forked one commit earlier.

Source-level conflict review: Assessment service/page on #125 match #124's base; chart files match #123's base. Thus their bounded updates apply without discarding parallel changes. Preserve #125 package/lock rather than replacing them with #126, retaining sharp and showroom commands alongside supported Next/Vitest patches. #127's historical proposal docs supersede earlier proposals; execution guards remain. No authorization weakening or new integration-specific privilege is introduced.

## Migration order and production exclusion

Already applied in isolated QA, not executed by this integration:

1. 20261022145641_qa_canonical_staff_and_teacher_reads
2. 20261022150019_qa_qualify_canonical_staff_person
3. 20261022201726_qa_teaching_assignment_audit
4. 20261022204324_studio_versioned_persistence
5. 20261022204346_studio_private_processed_assets

Persistence precedes private-asset SQL. Existing QA migration identifiers/fixtures/history must be retained. The build command only builds the application; do not run db push/reset as part of preview deploy.

This branch includes QA identity provisioning, synthetic-fixture tooling, QA-only environment bindings and QA migration records for traceable testing. Never merge it wholesale into main. A production candidate must exclude synthetic accounts/data, qa-provision-identity, QA-only provisioning utilities/configuration and unapproved migrations; production migration IDs and compatibility require separate release review. No secrets belong in Git.

## Acceptance matrix at branch creation

| Gate | Verification status |
| --- | --- |
| Integration source/dependency review | Completed; hosted checks pending |
| Earlier #125 Owner draft/publish/refresh/history | Verified on its own revision; not a combined-revision pass |
| Combined Owner dashboard/shell/context | Open |
| Teacher assigned draft/save/submit/restrictions | Open |
| Private Storage processed uploads/signing/expiry | Blocked pending securely saved QA Functions credential |
| Restore-as-new-version | Prior fail-closed response; combined live test open |
| Starter/Growth/Professional/expired/downgrade | Full live matrix open |
| Genuine Studio/Finance concurrent transactions | Open; serialized connector calls are not evidence of overlap |
| Responsive 320/360/768/1440 | Blocked unless browser gains supported viewport control |
| Security definer/leaked-password review | Open |
| Dependency audit | Existing high braces finding unsuppressed; release HOLD |
| Exact combined tests/build/independent secret scan | Pending hosted CI |

## Deployment and recovery

Deploy this draft PR to the existing team-protected schoolflow-demo-qa Deploy Preview. Verify exact commit_ref and preserve SSO protection. Only isolated QA Deploy Preview Functions may receive the existing QA server credential, marked secret; never expose values or grant them to build/client/production contexts.

Recover from an integration defect by reverting its bounded integration changes on this QA branch and rebuilding, while retaining database versions/assets/audit. Disabling Studio/appearance opt-in restores legacy presentation. No destructive down migration or published history deletion is part of rollback.

No prior test is promoted to a combined-revision pass. Update the PR acceptance evidence with exact deployment, CI and actual role sessions.
