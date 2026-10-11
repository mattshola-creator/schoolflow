# PX6 Release Unit 3 — Students and Staff

## Scope

RU3 migrates the existing operational `/students`, Student 360, `/staff` and
Staff 360 experiences to the founder-accepted PX1/PX3 presentation patterns.
The routes continue to use real caller-authorized Supabase records and the M4
and M5 domain contracts. No synthetic prototype fixture is used.

## Preserved contracts

- `requireCapability`, active tenant context and Supabase RLS remain
  authoritative.
- Student and staff workspaces require a school-specific authorization
  snapshot; organization-wide or mismatched contexts fail closed.
- Student creation continues through `create_student_record`, including the
  mandatory supported gender and complete primary-guardian tuple.
- CSV import remains validation-preview only. A row may omit guardian columns
  for data-quality review, but no import commit path exists; any subsequent
  operational creation still passes the mandatory application schema and
  `create_student_record` guardian checks.
- Staff creation continues through `create_staff_record`; transfer and
  employment termination retain their existing audited RPCs.
- Student enrollment, guardian, staff employment and assignment history retain
  their existing records and server contracts.
- No schema, migration, RLS, permission, entitlement or feature change is part
  of RU3.

## Experience changes

- Responsive student and staff registers use mobile record cards and semantic
  desktop tables.
- Search accepts a name or directory number. School-scoped status, class or
  department filters and deterministic sorting retain their values across
  pagination.
- Exact server counts are separate from the bounded 20-row page. The staff
  register counts primary current/planned assignments once rather than
  presenting secondary responsibilities as duplicate staff members.
- Student 360 and Staff 360 profile loaders now require a matching record in
  the active school before loading organization-level identity details.
- Loading, empty and error states use shared PX1 components; management actions
  remain permission-aware.

## Known limitation

The current M4/M5 architecture has established server contracts for creation,
staff assignment transfer and employment termination, but no general audited
student-identity or staff-profile edit contract. RU3 does not add direct
browser table updates to imitate editing. A future edit workflow requires a
separately reviewed domain contract with authorization and audit semantics.

The CSV workflow stores validation previews only. RU3 does not add bulk import
commit or conversion; preview acceptance must not be interpreted as permission
to create a student without a primary guardian.

## Risks and controls

| Risk                                     | Control                                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Cross-school direct profile access       | School-specific enrollment or primary assignment gate before profile queries, plus RLS                     |
| Search leaking names from another tenant | Person visibility RLS plus organization-filtered profile resolution and final school-scoped register query |
| Misleading counts                        | PostgREST exact count on the same school/filter query; bounded page data remains separate                  |
| Duplicate staff rows                     | Register is limited to primary active/planned assignment records                                           |
| Context mismatch                         | Authorization snapshot and active Context Ribbon must agree before any query                               |
| Unreviewed mutation path                 | Existing RPCs retained; no new mutation or schema introduced                                               |

## Rollback

Revert the RU3 application commit. The previous Students and Staff route
presentation is restored without database rollback because RU3 has no schema,
RLS, configuration or data migration. Existing M4/M5 workflows remain intact.

## Release boundary

RU3 must remain on its dedicated branch and protected Deploy Preview until
founder visual acceptance. A production merge requires a separate controlled
release authorization. RU4 Admissions has not started.
