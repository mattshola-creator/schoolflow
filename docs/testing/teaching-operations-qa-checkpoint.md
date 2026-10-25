# Teaching operations QA checkpoint

## Implemented correction

Teaching, class workspace, curriculum, timetable and lessons pages now render unavailable sections only for typed authorization denials. Unexpected source failures propagate to the existing error boundary. Lesson-workspace permission fallback retries only genuine denials and never conceals an unexpected failure.

Lesson creation, review and delivery failures expose only fixed safe categories. Raw database messages, SQL, identifiers, credentials and payloads are not exposed or logged. No database policy, grant, role, entitlement or schema changes.

## Read-only findings

The restricted Assessment Teacher retains exactly five approved permissions. No other active operational Teacher role exists to reuse. Employment, school assignment and two teaching assignments are active. There are no timetable entries, plans or deliveries attached to those assignments. Academics/Attendance plan entitlements and the relevant features are enabled; the role's missing Teaching/Attendance permissions are the access blocker.

Principal Review and Bursar Recorder remain at their approved13/4permission boundaries with one pending, unexpired, school-scoped invitation each and no active role assignment. No identities or invitations were recreated. Independent own-identity browser acceptance is not claimed; existing Owner and Teacher sessions are preserved.

## Live workflow status

An actual authorized Owner submitted a controlled lesson-draft fixture. The application returned failure and read-only inspection confirmed zero matching rows. Its live root category is pending the safe diagnostic build; do not attribute it to a historical trigger defect already corrected in QA. This is not Teacher acceptance and no lesson completion is claimed.

Timetable/attendance/lesson Teacher-positive acceptance remains blocked by the current role contract and missing fixtures. Existing school-management permission sets must not simply be delegated as an assignment-scoped Teacher role. A separately reviewed authorization contract must define own active assignment, school/session/date bounds, class attendance responsibility, draft ownership, workflow transitions, academic locks, actor audit, management access preservation, direct-table denial and cross-school/tenant tests before any security-sensitive expansion.

## Remaining gates

Private premium-image fixture, genuine Finance/Studio overlap, academic locks and history, full privileged-function review and leaked-password configuration remain open. This checkpoint does not mark them passed. Requested real mobile widths remain unsupported in the available cloud browser. Detailed sensitive diagnostics are not published here.

## Recovery

Revert the application-only error-handling slice if needed. No database recovery is required. Keep the QA integration PR draft/unmerged and production unchanged. Preserve the12submitted scores and original actor.
