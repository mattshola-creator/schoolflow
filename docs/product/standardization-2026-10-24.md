# Product standardization — first implementation slice

Baseline: PR128 / 4c05b765ad3673f80e537bd8a5d5b2cc57cb2d34, protected QA deploy6adc6b5cacad7a78136d2033. Read-only QA inspection:180students,30staff,9branding versions (preserved; not reset to an earlier reported count). Roles currently include organization_owner and bounded QA roles. Principal/Bursar definitions are not configured and are not invented here.

## Implemented boundaries

One authentication system. Login workspace intent is a fixed allowlist, never a URL or role grant. Destination resolution requires effective school context, permission, module entitlement, enablement and feature. Owner entry retains identity-bound effective Owner checking. Guardian/student entry retains canonical portal-context resolution. Platform choice falls back to granted workspace navigation: no platform principal, authority, dashboard or schema is created. Choosing a view never reduces the session's other effective permissions.

QA-only leadership route /workspace/leadership reuses Management, academic context and Action Center services. Explicit school/organization equality and single-school report-envelope checks precede allowlisted summary projection. Teaching metrics need reporting academic plus teaching domain permission; attendance and enrollment retain their separate checks. No Finance fields, raw report envelopes or clients are passed to a client component. No new metrics: approved plans, delivered lessons, publication-version counts and recorded-mark attendance retain existing semantics. Attendance completion cannot be computed from recorded marks alone and is not claimed. Submission/review progress remains a later slice.

Owner quick actions and collapsed display controls; Finance themed presentation; shared responsive header/cards; granted dashboard links in Workspaces. Existing domain services, grants/RLS/audit/metric calculations untouched.

QA label is gated by exact QA project plus the existing compiled preview marker. It includes only validated public Git revision metadata. The marker conveys no authorization. Existing stable QA URL is not republished by this isolated PR. PR128 remains the accepted integration entry; this dependent PR has a separate protected review URL until founder review/integration. Do not claim URL convergence is complete.

## Benchmarks used

Official public documentation/marketing reviewed24October2026; private authenticated competitor demos not tested. Vendor claims are not acceptance evidence.

- SAFSIMS https://safsims.com/schools/ — role administration, themes and gradebook; reuse bounded role controls and shared appearance.
- Edves https://www.edves.com/ and https://proposal.edves.net/ — Nigerian curriculum/operations and supported school onboarding; preserve local academic foundations rather than add new exam functionality here.
- SchoolTry https://schooltry.com/ — connected academic/administrative experience; retain existing domain journeys and authorized links.
- d6 https://help.d6.co.za/portal/en/kb/articles/student-portal-school-communication-checklist-20-4-2026 — individual student credentials and identity-linked information; do not implement unsafe role impersonation.
- OpenApply https://help.openapply.com/hc/en-us/articles/4405319803661-Viewing-your-Applicant-Dashboard — task-oriented dashboard and follow-up; lead with actionable work.
- Classter https://www.classter.com/ — audience-oriented workspaces; one app with permission-aware destinations.
- Veracross https://www.veracross.com/ — connected single-record foundation; no copied layouts.
- Smart School https://smart-school.in/docs/ and Ramom https://ramomcoder.com/saas-doc/ — modular administration reference only; no purchased assets or proprietary source.

## Verification and remaining slices

Run full code/build/audit/secret gates; browser evidence must match hosted revision. Genuine320/360/390/768/1440 viewport control was previously unavailable: do not count internal preview controls as live mobile acceptance.

Next slices: verified Principal/Bursar role definitions and real own-identity tests; academic submission/review queue composition; polish remaining operational lists/details; single stable protected QA entry deployment; other role dashboards and gated platform authority; eligible private-image fixture; true Finance/Studio overlap; PX6 teacher/security closeout. No production merge/deploy authorized.

Rollback: revert this PR's presentation/routing files; prior domain services/data/migrations unchanged. Legacy Owner escape remains available under display options.
