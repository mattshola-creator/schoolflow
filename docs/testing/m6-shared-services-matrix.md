# M6 Shared Services Verification Matrix

| Area          | Allowed case                                 | Denied/invariant case                                        |
| ------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Audit         | authorized school history visible            | API update/delete unavailable; outsider rows hidden          |
| Documents     | metadata plus private upload/download        | disallowed MIME/size rejected; cross-school/direct-ID hidden |
| Tasks         | authorized create/update/list                | outsider insert/read denied                                  |
| Approvals     | atomic policy/request; assigned role decides | unassigned role, wrong school and direct writes denied       |
| Notifications | recipient reads own notification             | another recipient cannot inspect/update it                   |
| Tenancy       | own organization/school succeeds             | cross-organization and unauthorized school deny              |

## Evidence

- Remote rollback-only SQL covers authorized task/document/approval creation, approval decision, audit emission and immutability, outsider SELECT denial and outsider INSERT denial.
- The Storage bucket is private and object policies require an authorized metadata row.
- Schema unit tests cover validation boundaries. The complete project gate covers formatting, lint, strict TypeScript, tests and production build.
