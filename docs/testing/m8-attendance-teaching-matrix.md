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
