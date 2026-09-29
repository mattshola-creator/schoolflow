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
| No production attendance was created in A3            | Register, entry and correction counts remained zero at the A3 checkpoint                        | Verified    |

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
| No production attendance was created in A4 | Register, entry and correction counts remained zero at the A4 checkpoint                  | Verified    |

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
| Policy setup creates no attendance activity    | Setup saved policy only; register, entry and correction counts stayed zero             | Verified    |

### M8-A5 verification evidence

- Focused route tests cover authorized baseline rendering and fail-closed
  behavior.
- Focused action tests reject incomplete policy data before service invocation,
  save one valid baseline and do not retry or expose internal details on error.
- Focused service tests prove exact `attendance.configure` capability use,
  caller-bound actor fields, school scope and one policy write.

## M8-A6 Controlled production attendance verification

| Requirement                                       | Evidence                                                                                          | Status   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- |
| Authorized register loads the exact active roster | Production morning register showed the two active Primary 4 QA students                           | Verified |
| Complete register is submitted atomically         | One register and exactly two entries persisted from one browser submission                        | Verified |
| Submitted register becomes read-only              | Production UI disabled the original status controls and removed the submit action                 | Verified |
| Correction uses the controlled workflow           | One authorized Present-to-Late correction persisted with a bounded QA reason                      | Verified |
| Current state and history agree                   | Final entries are one Late and one Present; immutable history records Present to Late             | Verified |
| Audit coverage is complete                        | Audit contains one register insert, two entry inserts, one entry update and one correction insert | Verified |
| Authenticated actor remains consistent            | Register, entries, correction and audit records resolve to the same authorized QA actor           | Verified |
| No duplicate or extra write occurred              | Final counts are one register, two entries and one correction                                     | Verified |
| Temporary enablement is closed                    | QA organization override was returned to disabled immediately after verification                  | Verified |
| Session and protected account safety              | QA account signed out; permanent owner account was not accessed or modified                       | Verified |

### M8-A6 production evidence

- The production policy uses a one-day lock, morning registers only, the five
  approved attendance statuses and Monday-to-Friday attendance days.
- The authorized QA actor submitted one morning register for 28 September 2026
  against the active 2026/2027 Primary 4 QA roster. Both entries began as
  Present.
- The actor saved one controlled correction from Present to Late with the
  reason `Controlled M8 production correction verification`. The final persisted
  state is one Late entry, one Present entry and one immutable correction.
- The temporary feature override was disabled after verification. No second
  register, second correction, code change, migration or deployment occurred.

## Smallest remaining M8 slice

Student attendance is implemented and production-verified. The next independent
slice is M8-B1 Staff Attendance Foundation: define caller-bound staff clock-event
and daily-summary data boundaries, school-hours policy enforcement, immutable
correction/audit history, RLS and rollback-only verification. It must remain
disabled by default and must not create production clock events during its
foundation phase. Timetable, curriculum, lesson delivery and homework remain
separate later slices.

## M8-B1 Staff attendance foundation

| Requirement                                          | Evidence                                                                                                                                    | Status           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Staff clock activity is feature gated                | Existing `attendance.staff_clock` feature remains disabled by default and is rechecked in caller-bound database authorization               | Implemented      |
| Self-service is bound to the staff identity          | Access helper requires a current school assignment whose employment is linked to the authenticated user                                     | Implemented      |
| Broader recording and correction are separate powers | `attendance.staff.record_all` and `attendance.staff.correct_all` are distinct permissions granted only to organization owners by this slice | Implemented      |
| Clock events are idempotent and ordered              | Record RPC uses caller-scoped idempotency and permits one clock-in and clock-out, with clock-out later than clock-in                        | Implemented      |
| Policy is effective-dated and historically stable    | Position override or school default is validated and snapshotted into the daily summary                                                     | Implemented      |
| Corrections preserve original evidence               | Original event is immutable; correction history stores previous and corrected occurrence times, reason and actor                            | Implemented      |
| Direct writes are denied                             | Authenticated grants are SELECT-only; event and correction mutation triggers fail closed                                                    | Implemented      |
| Browser-facing service errors are generic            | Focused service tests prove one RPC call, exact capability selection and no raw database error disclosure                                   | Verified locally |
| Foundation creates no production activity            | Rollback-only remote matrix reached one day, two events and one correction in-transaction; post-rollback production counts are 0/0/0        | Verified         |

M8-B1 intentionally contains no staff-attendance UI or production feature
enablement. A later separately authorized slice may add the staff clock and
management experience after this foundation is deployed and verified.

The remote matrix also verified idempotent replay, ordered clock-out,
caller-bound correction, cross-tenant denial and event immutability. The
temporary actor, role, policy, feature override and attendance activity all
rolled back. The effective production feature state remained disabled.

## M8-B2 Protected staff attendance UI

| Requirement                                        | Evidence                                                                                                                                                               | Status                             |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Clock UI uses the M8-B1 authorization boundary     | Caller-bound list RPC reuses `can_access_staff_attendance_assignment`; service and route require `attendance.staff.record` plus `attendance.staff_clock`               | Verified locally and in production |
| Self-service cannot enumerate unrelated staff      | Assignment rows are returned only when the existing helper authorizes that exact assignment and date; the controlled QA actor saw only its authorized assignment       | Verified locally and in production |
| Working-hours setup is separately protected        | Setup load/save require `attendance.configure`, active context and the staff-clock feature; one position-specific QA policy persisted under the expected school        | Verified locally and in production |
| Browser cannot choose an arbitrary occurrence time | Server action generates the timestamp and submits one validated RPC call; the production cycle recorded server-authorized clock-in and clock-out events                | Verified locally and in production |
| Failure remains generic and does not retry         | Focused action/service tests assert one call and safe redirects without database detail                                                                                | Verified locally                   |
| Mobile layout avoids page-wide overflow            | Assignment state uses stacked responsive cards, wrapped identifiers and full-width mobile actions; real-phone verification passed                                      | Verified locally and in production |
| Historical clock state is read-only                | Clock action is rendered only for the current local school date                                                                                                        | Verified locally                   |
| Controlled production persistence and audit        | One authorized cycle persisted one policy, one daily summary and two ordered clock events with zero corrections; matching school-scoped audit events used the QA actor | Verified in production             |
| Feature returns to its safe default                | `attendance.staff_clock` was disabled after verification, the QA session was signed out and the permanent owner account was untouched                                  | Verified in production             |

M8-B2 does not include controlled correction UI, approved absence/permission,
missing-clock Action Center exceptions, summaries or continuing production
enablement. The remote matrix verified authorized assignment and position
discovery, cross-tenant non-disclosure and RLS-protected policy insertion
before rolling back its actor, role, feature override and policy. Controlled
production QA then verified the deployed working-hours and clock journey with
one synthetic policy, one attendance day and two clock events. The resulting
QA evidence is intentionally preserved; no correction was created. The feature
override was disabled after the test.

## M8-B3 Controlled staff clock corrections

| Requirement                                       | Evidence                                                                                                                                             | Status            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Correction access is separately authorized        | Route rendering, service context and caller-bound read RPC require `attendance.staff.correct` plus `attendance.staff_clock`                          | Implemented       |
| Correction events remain tenant and school bound  | The read RPC derives identity fields through the attendance day and rechecks the existing assignment/date access helper                              | Implemented       |
| Original clock evidence remains immutable         | UI invokes the existing `correct_staff_clock_event` RPC; the original event table remains append-only and effective time changes live on the summary | Implemented       |
| Reason and corrected time are mandatory           | Browser inputs and the existing Zod/RPC boundaries require an offset-aware time and a trimmed 3–500 character reason                                 | Verified locally  |
| Failure remains generic and does not retry        | Focused action and service tests assert one correction call and no protected database detail in redirects                                            | Verified locally  |
| Unauthorized users receive no correction controls | Focused page tests render correction forms only when effective permissions include `attendance.staff.correct`                                        | Verified locally  |
| Read endpoint is not anonymous                    | Deployed function metadata confirms `anon` has no execute privilege and `authenticated` access remains caller-bound                                  | Verified remotely |
| No production attendance mutation occurred        | Migration verification left the preserved clock evidence unchanged and the staff correction count remains zero                                       | Verified remotely |

The full local quality gate passes 182 tests, zero-warning lint, strict
TypeScript and the production build. The Supabase security advisor reported no
new Critical or High finding. Its existing warning category for intentionally
caller-bound `security definer` RPCs remains unchanged. Production browser QA
and temporary feature enablement are not part of this implementation slice.

## M8-B4 Staff leave and permission foundation

| Requirement                                      | Evidence                                                                                                                                         | Status            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Staff/HR owns leave and permission records       | School-scoped leave-type and time-request tables are separate from Attendance and link to the reusable shared approval engine                    | Implemented       |
| Leave and short permission remain distinct       | Request kind is constrained to `leave` or `permission`; leave requires an active leave type and permission forbids one                           | Verified remotely |
| Submission is atomic and caller-bound            | One RPC validates identity, active assignment, self/manager scope, policy key and first approval step before inserting both linked records       | Implemented       |
| Approval outcomes synchronize safely             | A private trigger maps only the linked shared approval status to the Staff/HR request; the shared approval engine remains the decision owner     | Implemented       |
| Tenant and school isolation remain enforced      | Composite foreign keys, RLS, active-assignment checks and existing staff capability evaluation bind every request to its organization and school | Verified remotely |
| Direct request writes are denied                 | Authenticated clients receive SELECT only; submission uses the validated RPC and anonymous execution is revoked                                  | Verified remotely |
| Feature is disabled and production data is empty | `staff.leave_permission` defaults to disabled, has zero enabled overrides, and both new business tables contain zero rows                        | Verified remotely |
| Validation and failures remain fail-closed       | Focused tests reject invalid kind/type/range combinations, mismatched context and RPC failures without retries or protected database detail      | Verified locally  |

Attendance integration, summaries, exception tasks, configuration/request UI
and controlled production QA are intentionally outside this foundation slice.
