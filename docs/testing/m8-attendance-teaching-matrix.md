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
