# M8 Attendance and Teaching Verification Matrix

## M8-A1 Teaching scope and attendance policy foundation

| Requirement                                      | Evidence                                                       | Status      |
| ------------------------------------------------ | -------------------------------------------------------------- | ----------- |
| New M8 features are disabled by default          | Catalog migration sets each feature `default_enabled = false`  | Implemented |
| Teaching scope is tenant and school bound        | Composite foreign keys and RLS capability predicate            | Implemented |
| Teacher scope is effective dated                 | Session/staff date validation and overlap rejection            | Implemented |
| Class arms are optional but must match the level | Nullable arm plus validation trigger                           | Implemented |
| Attendance status vocabulary is canonical        | Database enum and TypeScript schema                            | Implemented |
| Morning register cannot be disabled              | Database check constraint                                      | Implemented |
| Closing register is disabled by default          | Attendance settings default                                    | Implemented |
| Attendance lock is configurable                  | Bounded `lock_after_days` policy                               | Implemented |
| Holidays do not imply absence                    | Session-bound calendar exceptions                              | Implemented |
| Staff hours support controlled overrides         | One active school default and one active override per position | Implemented |
| Authentication alone grants no access            | RLS requires membership, permission, entitlement and feature   | Implemented |
| No attendance or teaching activity is created    | M8-A1 contains only scope and policy tables                    | Implemented |

## Verification evidence

- The development migrations applied successfully and generated database types
  were synchronized.
- Formatting, zero-warning lint, strict TypeScript, 142 tests across 33 files and
  the production build passed.
- A transaction-wrapped remote authorization matrix passed for an authorized
  owner and denied an unrelated authenticated identity. The transaction rolled
  back.
- All four M8-A1 tables have RLS enabled and remain empty.
- All three new product features remain disabled by default with no organization
  enablement overrides.
- The Supabase advisor reported no new Critical or High finding. Public
  caller-bound guard functions retain the established SchoolFlow authorization
  pattern; performance-only foreign-key findings were addressed with a focused
  index migration.
- Local database reset was unavailable because Docker/Podman is not installed in
  the execution workspace; transaction-wrapped development validation was used
  without retaining test records.

## M8-A2 Student attendance register data foundation

| Requirement                                  | Evidence                                                                                                            | Status      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------- |
| Register submission is atomic                | One caller-bound function inserts the register and exact effective roster in one transaction                        | Implemented |
| Submission is idempotent                     | UUID key plus canonical request fingerprint; identical replay returns the original register                         | Implemented |
| Partial or duplicate rosters are rejected    | Payload uniqueness and exact roster-set validation                                                                  | Implemented |
| Teaching scope limits staff access           | Effective employment, staff assignment and teaching assignment checks; explicit all-school permissions are separate | Implemented |
| Calendar and lock policy are enforced        | Session, school-day/exception, register-type and timezone-aware lock checks                                         | Implemented |
| Correction history is immutable              | Append-only correction table, mutation-blocking trigger and no client write grant                                   | Implemented |
| Event tables are not directly writable       | Authenticated role receives SELECT only; writes use checked RPCs                                                    | Implemented |
| Tenant isolation applies to reads and writes | Composite foreign keys, RLS and caller-bound scope checks                                                           | Implemented |
| Feature remains disabled                     | Existing feature default is false and no enabled organization override exists                                       | Verified    |
| No production attendance is recorded         | Development tables are empty after rollback-only verification                                                       | Verified    |

### M8-A2 verification evidence

- Both migrations applied to the connected development project and generated
  database types were synchronized.
- Transaction-wrapped verification passed atomic two-student submission,
  identical idempotent replay, correction history, current-state update, direct
  write denial and correction immutability; the transaction rolled back.
- Post-test counts are zero for registers, entries and corrections. The feature
  has no enabled organization override and remains disabled by default.
- Focused schema and service tests cover payload validation, duplicate students,
  correction reasons, exact capability checks, single RPC invocation and safe
  error translation.

## M8-A3 Student attendance register UI

| Requirement                                           | Evidence                                                                                        | Status      |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| Attendance navigation is feature gated                | Navigation requires `attendance.student_registers`; direct route uses the same capability guard | Implemented |
| Only assigned rosters are exposed                     | Caller-bound read RPCs reuse effective M8-A2 record-scope authorization                         | Implemented |
| Attendance access does not imply broad student access | Read RPCs return only class labels/counts and the selected minimal roster                       | Implemented |
| Complete-register submission is preserved             | Server action validates every displayed row and invokes the atomic M8-A2 service once           | Implemented |
| Duplicate browser submission is safe                  | Each rendered register carries a UUID idempotency key enforced by M8-A2                         | Implemented |
| Existing registers are not silently overwritten       | Submitted values render read-only and point to the future correction workflow                   | Implemented |
| Public failures remain safe                           | Validation and service failures redirect with generic messages                                  | Implemented |
| Mobile layout avoids horizontal register tables       | Roster uses stacked responsive grid rows and full-width controls/actions                        | Implemented |
| Feature remains disabled                              | No enabled organization override exists; default remains false                                  | Verified    |
| Production attendance remains empty                   | Register, entry and correction counts remain zero                                               | Verified    |

### M8-A3 verification evidence

- Transaction-wrapped development checks returned exactly the authorized class
  scope and its two-student roster, denied an unrelated authenticated identity,
  and rolled back the temporary feature override.
- Focused tests cover route fail-closed behavior, responsive selector rendering,
  scope parsing, malformed input rejection before service invocation, exactly
  one submission call, no retry and safe error redirects.
- No production feature enablement, browser submission or attendance record was
  created.

## M8-A4 Controlled attendance corrections

| Requirement                                | Evidence                                                                                  | Status      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- | ----------- |
| Submitted registers cannot be overwritten  | Existing roster controls remain disabled and no second register-submit control is shown   | Implemented |
| Corrections require explicit authorization | UI checks effective `attendance.student.correct`; service and RPC repeat authorization    | Implemented |
| New status must differ from current status | UI excludes the current value; RPC independently rejects unchanged status                 | Implemented |
| Audit reason is mandatory and bounded      | Browser and Zod require 3–500 characters; RPC trims and independently enforces the bounds | Implemented |
| Correction history is immutable            | Existing atomic RPC appends history; mutation-blocking trigger prevents update/delete     | Verified    |
| Correction request executes once           | Focused action test proves one service call and no retry on failure                       | Verified    |
| Public errors remain safe                  | Generic redirect messages omit raw database details                                       | Verified    |
| Unauthorized users retain read-only access | Focused rendering test proves correction controls are absent                              | Verified    |
| Feature remains disabled                   | Default is false and no enabled organization override exists                              | Verified    |
| Production attendance remains empty        | Register, entry and correction counts remain zero                                         | Verified    |

### M8-A4 verification evidence

- Focused action tests reject invalid input before service invocation, preserve
  a mandatory reason, perform exactly one correction call and do not retry or
  disclose internal details after failure.
- Focused UI tests show correction controls only for an authorized actor on a
  submitted register and preserve the read-only view otherwise.
- M8-A2 rollback-only database evidence already covers atomic current-state
  update, immutable correction insertion, cross-tenant denial and history
  mutation denial; M8-A4 introduces no new database write path.

## M8-A5 Attendance policy setup prerequisite

| Requirement                                    | Evidence                                                                               | Status      |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | ----------- |
| Missing policy prevents register use           | Register route renders the existing fail-closed policy warning                         | Verified    |
| Setup requires existing authorization          | Route uses attendance context and checks `attendance.configure`                        | Implemented |
| Tenant and school are server-derived           | Service uses the validated active context; no organization/school IDs come from forms  | Implemented |
| Policy values are validated                    | Zod enforces lock days, unique enabled statuses, unique weekdays and policy invariants | Verified    |
| Creating/updating actor is authenticated       | Service uses verified `getUser()` identity; RLS binds audit columns to `auth.uid()`    | Implemented |
| Insert and update preserve column-level grants | Service selects existence, then performs one permitted insert or bounded update        | Implemented |
| Failure is generic and not retried             | Focused action tests prove one call and safe redirect                                  | Verified    |
| Feature remains disabled outside setup window  | Default remains false; temporary QA enablement requires a separate controlled step     | Verified    |
| Production attendance remains empty            | Register, entry and correction counts remain zero                                      | Verified    |

### M8-A5 verification evidence

- Focused route tests cover authorized baseline rendering and fail-closed
  behavior.
- Focused action tests reject incomplete policy data before service invocation,
  save one valid baseline and do not retry or expose internal details on error.
- Focused service tests prove exact `attendance.configure` capability use,
  caller-bound actor fields, school scope and one policy write.
