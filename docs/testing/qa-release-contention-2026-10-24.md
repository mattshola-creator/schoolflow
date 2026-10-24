# QA release contention — 24 October 2026

PR128 is mergeable, draft and unmerged by founder instruction. Draft status is not a merge conflict or deployment failure. No production release is authorized.

CI398 passed code checks, full tests, both builds and independent secret scan, but failed unsuppressed audit on undici GHSA-xjj6-f33q-929c. The jsdom30.0.1 dependency chain admitted a supported same-major patch. Updated only undici8.10.2 to8.12.3, its integrity and lockfile references; package manifests and existing overrides unchanged. Fresh unsuppressed audit reports zero vulnerabilities among574 dependencies. Hosted regression remains required.

Studio restore is a separate open functional defect. Diagnostic head ccae646e46f1b9e183e93383ea13379a866b3cb2 classifies service Data API failures without disclosing raw errors or credentials. A version config has no authoritative image-free marker; failed service-only binding lookup cannot safely be treated as no image. Keep fail-closed. Exact live category not yet observed because protected browser login was declined. No new credential requested and no schema/grant/RLS change.

Remaining gates: authenticated restore/publish/refresh/history/audit/foreign-school/stale-revision, eligible private-image fixture operations, true Studio/Finance concurrency and teacher own-identity acceptance. Never count synthetic or unit tests as those live passes.
