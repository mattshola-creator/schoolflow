# PX0 current-state UX inventory

**Program:** SchoolFlow Product Experience 2.0  
**Phase:** PX0 — Experience Specification & Baseline  
**Inspection revision:** `b4e8b942397e4f8449e942533b9b06d3013be7cd`  
**Inspection method:** repository implementation and accepted architecture; no production mutations

## 1. Audit boundary

This inventory describes the UI that actually exists. A route name is not
treated as evidence of a complete experience. The M0–M13 authorization, RLS,
entitlement, audit, financial, assessment, and tenant-isolation architecture is
preserved. PX0 adds no routes, schema, privileges, fixtures, or UI migration.

Recommendation terms:

- **Retain:** sound implementation can remain with limited token adoption.
- **Restyle:** interaction is sound; primarily visual/system alignment needed.
- **Refactor:** interaction or composition needs material restructuring while
  retaining underlying behavior.
- **Replace presentation:** preserve services/business rules but replace the
  page-level experience.
- **New UI required:** backend capability exists or requirement is approved,
  but no adequate user-facing surface exists.

## 2. Surface inventory

| Experience / current route or component   | Intended actors                                              | Current implementation and reusable assets                                                     | Main limitations                                                                                                                                                    | Authorization / entitlement dependency                           | Responsive status                                                     | PX2.0 target and action                                                                  |
| ----------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Public root `/`                           | Prospects, unauthenticated visitors                          | Responsive hero, product sentence, signup/sign-in CTAs, health card                            | Operational landing page rather than commercial SaaS hub; exposes technical health CTA; no modules, plans, demo, trust/resources, product imagery                   | Public; environment status only                                  | Mobile-first grid works                                               | Public SaaS Hub; **replace presentation** in Pack A                                      |
| Login `/login`                            | All identities                                               | `AuthCard`, labeled fields, recovery/signup links, server action errors                        | No tenant brand, support, product reassurance, invitation/recovery context, or password visibility affordance                                                       | Supabase Auth                                                    | Strong single-column mobile baseline                                  | Unified authentication family; **restyle/refactor**                                      |
| Signup `/sign-up`                         | Prospective organization creator                             | Secure account form and onboarding handoff                                                     | No plan/module discovery, consent/legal context, onboarding expectations, or school-structure discovery                                                             | Supabase Auth; email confirmation                                | Usable mobile card                                                    | Commercial onboarding entry; **refactor** after Pack A decisions                         |
| Forgot/update password                    | Existing users                                               | Production recovery flow, accessible fields/errors                                             | Visually minimal; limited recovery guidance/status continuity                                                                                                       | Supabase Auth callback/session                                   | Usable mobile card                                                    | Shared recovery journey; **restyle**                                                     |
| Invitation `/accept-invitation`           | Invited staff/admin                                          | Token/email-bound membership acceptance                                                        | Not integrated with branded auth journey; limited invitation context                                                                                                | Authenticated identity, invitation validation                    | Responsive panel                                                      | Auth journey state; **restyle/refactor**                                                 |
| Organization onboarding `/onboarding`     | New organization owner                                       | Atomic organization, location, first-school setup                                              | Single form; no progress, preview, recommended setup sequence, plan/module explanation                                                                              | Authenticated user, onboarding RPC                               | Responsive but basic                                                  | Guided onboarding wizard; **replace presentation** while retaining mutation              |
| Authenticated shell `(app)/layout.tsx`    | Staff, owners, families                                      | Auth guard, desktop sidebar, mobile modal, logout, permission/entitlement-aware navigation     | Fixed 13rem sidebar; no Context Ribbon, academic period, notifications, help, search, command entry, profile menu, collapse, tenant brand, or family-specific shell | `requireUser`, `get_my_authorization`, context cookies           | Mobile dialog has focus trap/Escape/body lock; desktop starts at `md` | PX1 shell; **replace presentation** while preserving guards/evaluator                    |
| Navigation `WorkspaceNavigation`          | Authenticated users                                          | Grouped links; unavailable reasons; current-route state; tested focus behavior                 | Four coarse groups; no hierarchy/subnavigation/icons/favorites; unavailable reasons lack remediation; same shell for family users                                   | Permission + module + feature through shared evaluator           | Good drawer baseline                                                  | Work-oriented nav + mobile navigation; **refactor**                                      |
| Context selection `/dashboard`            | Multi-school members                                         | Active organization/school card and allowlisted server-set cookies                             | Selector appears only on dashboard; no session/term; organization-wide scope not continuously visible; switch returns to dashboard                                  | Active membership and accessible schools                         | Mobile form works                                                     | Persistent Context Ribbon; **new shared UI required**                                    |
| Dashboard `/dashboard`                    | Owners/staff; redirects portal-only identities               | Membership cards, module cards, unavailable explanations                                       | Module directory rather than personalized home; no KPI/action/exception/recent work; no role adaptation or My Day                                                   | Effective authorization; portal relationship fallback            | Responsive card grids                                                 | Personalized Home; **replace presentation**                                              |
| Administration `/administration`          | Organization owners/admins                                   | Read-only active context, permission count, module access statuses                             | No editable organization/school/location/users/invitations/memberships/roles/effective-access/groups/modules/branding/settings; operator-assisted note only         | `organization.view` + foundation feature                         | Responsive cards                                                      | Administration Center; **new UI required**, reuse authorization snapshot                 |
| Academic setup `/academic-setup`          | Academic admins                                              | Comprehensive settings, sessions/periods, levels, arms, subjects, locks                        | 700-line monolithic page; long forms; no step progress, subnavigation, history/impact preview, or persistent context                                                | Academic setup permissions/features and active school            | Stacks well but long on mobile                                        | Configuration pattern/wizard; **refactor**                                               |
| Students `/students`                      | Registrars/admins                                            | Search, pagination, responsive directory, create/import links, empty state                     | Limited filter/sort/columns/bulk actions/saved view; sparse row context                                                                                             | Students view feature + school context                           | Card-like rows and controls usable                                    | Standard register; **refactor**                                                          |
| Student create/import                     | Registrars/admins                                            | Validated forms and import preview                                                             | No step grouping, draft, unsaved protection, mapping wizard, or reusable import progress                                                                            | Create/import permissions, setup prerequisites                   | Usable but form-heavy                                                 | Standard form/import wizard; **refactor**                                                |
| Student 360 `/students/[studentId]`       | Authorized staff                                             | Profile, guardians, enrollment/class history                                                   | Not a true tabbed 360; attendance/finance/results/documents/history not composed; no contextual actions                                                             | Student view plus RLS/school scope                               | Responsive detail cards                                               | Student 360 tabs; **replace presentation**, compose existing read models                 |
| Staff `/staff`                            | Staff admins/management                                      | Search, pagination, new/setup/time-off links                                                   | Same register limitations; limited role/responsibility summary                                                                                                      | Staff view feature + active school                               | Responsive baseline                                                   | Standard register; **refactor**                                                          |
| Staff detail/setup/time-off               | Staff admins, managers, staff                                | Profile/employment/history, transfer/end actions, departments/positions, leave setup/request   | Capabilities split across long pages; no Staff 360 tabs; access/teaching/documents/activity not composed                                                            | Granular staff permissions/features and school context           | Responsive panels; dense actions                                      | Staff 360 + configuration patterns; **replace presentation/refactor**                    |
| Admissions `/admissions`                  | Admissions staff/management                                  | Search/status filter, application list, create, policy link, empty state                       | List rather than pipeline; limited exception/next-action visibility                                                                                                 | Admissions permission/feature and school context                 | Responsive list baseline                                              | Pipeline/register toggle; **replace presentation**                                       |
| Applicant detail                          | Admissions staff/management                                  | Application, checklist, documents, assessments, decisions, offer/conversion                    | Very long page; stage/status relationships require interpretation; actions dispersed                                                                                | Granular admissions guards/RLS                                   | Stacks but high mobile effort                                         | Admissions 360 with stage rail/action summary; **replace presentation**                  |
| Attendance `/attendance`                  | Teachers/attendance officers                                 | Scope/date selection, roster, status inputs, submit/correction                                 | Dense multi-form page; normal mobile flow requires excessive scanning; no sticky completion/action controls                                                         | Student attendance permissions, feature, teacher/school scope    | Responsive but operationally heavy                                    | Fast attendance workspace; **replace presentation**                                      |
| Staff attendance/setup                    | Staff/admin/attendance managers                              | Clocking, summaries, corrections, policies                                                     | Multiple concerns on large pages; weak today/exception emphasis                                                                                                     | Staff attendance permissions/features                            | Responsive panels                                                     | Today + exceptions + setup separation; **refactor**                                      |
| Teaching `/teaching`                      | Academic admins/teachers                                     | Assignment creation/list; links to timetable, curriculum, lessons                              | Administration-first; no teacher My Teaching/My Day landing; weak class/subject continuity                                                                          | Teacher assignment/management permissions and active school      | Responsive panels                                                     | My Teaching plus admin configuration; **replace presentation**                           |
| Timetable/curriculum/lessons              | Teachers, academic leads                                     | Validated server workflows for schedule, coverage, lesson plans/delivery/homework              | Large independent pages, repeated panels/forms, limited cross-linking and today-first focus                                                                         | Granular teaching permissions, assignment restrictions, feature  | Usable but lengthy on phones                                          | Class/subject workspaces and reusable workflow panels; **refactor/replace presentation** |
| Finance `/finance`                        | Bursar/finance admins                                        | Fee categories, structures, activation, billing preview/run                                    | Configuration and operations intermixed; no Finance overview/navigation; dense long page                                                                            | Finance permissions, six features, school context                | Responsive forms, limited dense-data optimization                     | Professional Finance workspace; **replace presentation**                                 |
| Collections `/finance/payments`           | Cashiers/verifiers/bursars                                   | Cashier session, recording, verification, allocation, receipts, reversal, handover             | Many high-impact workflows on one page; state/segregation of duties hard to scan                                                                                    | Granular finance permissions/RPCs/RLS                            | Functional but operationally dense                                    | Collections workspace with task/state panels; **replace presentation**                   |
| Expenses and reports                      | Finance roles/management                                     | Expense lifecycle, other income, reconciliation, summaries                                     | Long forms/registers; inconsistent navigation/filtering; `Number()` formatting should remain presentation-only over exact server values                             | Finance permission/features and exact server calculations        | Basic responsive panels                                               | Finance subnavigation and standard registers/KPIs; **refactor**                          |
| Assessment `/assessments`                 | Exams officers/admins/reviewers                              | Schemes/components/grades, batch creation/workflow                                             | Configuration and workflow crowded into 483-line page; blockers/completion not visually prioritized                                                                 | Assessment permissions, five features, locks                     | Responsive but dense                                                  | Assessment workspace by responsibility; **replace presentation**                         |
| Score sheet `/assessments/[batchId]`      | Assigned teachers/authorized scorers                         | Server-loaded sheet, component inputs, validation/save                                         | Form rows rather than efficient spreadsheet interaction; limited save-state/unsaved feedback                                                                        | Assignment restriction, permission, enrollment validation, locks | Usable but not optimized for mobile/tablet                            | Keyboard-efficient score grid; **replace presentation**                                  |
| Report cards                              | Authorized staff                                             | Immutable published snapshot rendering                                                         | Minimal print/report experience; limited school brand and navigation                                                                                                | Published snapshot access only                                   | Printable/simple                                                      | Branded report view; **restyle/refactor**                                                |
| Communication `/communication`            | Communication staff                                          | Notice creation/publication and recent notices                                                 | Information-center subset dominates; messaging/preferences/attachments lack coherent UI                                                                             | Communication permissions, five features, audience RLS           | Responsive forms                                                      | Communication center; **replace presentation**                                           |
| Family/student portal `/portal`           | Guardians/students                                           | Relationship-scoped learner switch, results count, attendance, finance balance, notices        | One shared administrative shell; shallow content; no parent Home/For You/family finance/messages/docs/profile; student experience not age-adapted                   | Guardian relationship/student self + portal features + RLS       | Card-based and mobile-friendly baseline                               | Dedicated family/student experience layer; **replace presentation**                      |
| Management `/management`                  | Authorized management                                        | Scoped filters, KPIs, school summaries, global search, CSV/print, close/rollover               | Single long page; limited visualization/drill-down/saved filters; operational close mixed with reporting                                                            | Reporting permissions/features and management scope              | Responsive grids; dense page                                          | Insights workspace + separate administration workflow; **refactor**                      |
| Documents `/documents`                    | Authorized staff/portal participants through protected links | Upload/register/download with private storage                                                  | Basic list, limited metadata/filter/preview/version context                                                                                                         | Document permission, RLS, signed access                          | Responsive baseline                                                   | Shared document center; **refactor**                                                     |
| Audit `/audit`                            | Authorized auditors/admins                                   | Protected audit event list                                                                     | Minimal filters, actor/resource exploration, export or investigation workflow                                                                                       | `shared.audit.view`, RLS                                         | Responsive text cards                                                 | Audit explorer; **refactor**                                                             |
| Action Center `/action-center`            | Staff/approvers                                              | Tasks, approval policy/request/decision, notifications                                         | Creation/configuration/inbox/notifications combined; no personalized priority queue or cross-module exception model                                                 | Shared-services permissions/features                             | Responsive but very long                                              | Action Center + My Day work queue; **replace presentation**                              |
| Capability state `/capabilities/[module]` | Authenticated users                                          | Server evaluation and distinct denial explanations                                             | Generic fallback; not integrated into module-specific setup/upgrade/remediation                                                                                     | Shared evaluator                                                 | Responsive                                                            | Shared access-state pattern; **retain/refactor**                                         |
| API health `/api/health`                  | Operators/monitoring                                         | Minimal application/dependency state                                                           | Correctly not an end-user operations dashboard                                                                                                                      | Public safe health contract                                      | N/A                                                                   | Retain API; surface operator diagnostics privately                                       |
| Platform administration                   | Platform operators                                           | Data model, plan/module/feature catalogs, protected operator-managed writes, audit foundations | No Platform Console, Tenant 360, plan/entitlement/rollout/support UI; no established interactive operator identity surface                                          | Platform-owned data; ordinary authenticated writes revoked       | None                                                                  | Pack D/PX8 Platform Console; **new UI required**                                         |
| Branding/customization                    | Platform/tenant admins                                       | Static SchoolFlow identity and CSS variables only                                              | No persisted organization/school brand, inheritance, preview/publish/version/rollback, entitlement or accessibility validation                                      | Future platform policy + entitlement + scoped admin              | None                                                                  | Branding Studio; **new UI required**                                                     |
| Demo/training                             | Prospects/trainers                                           | Preserved milestone QA fixtures only; not a coherent demo product                              | No isolated synthetic organization/personas/reset/tours/Switch Perspective                                                                                          | Must be isolated and never bypass auth                           | None                                                                  | PX7 demo environment; **new UI required**                                                |

## 3. Design-system baseline

| Concern          | Current state                                                                                                | Reuse decision for Design System v2                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Styling          | Tailwind CSS 4 utility classes plus `src/app/globals.css`                                                    | Retain Tailwind; formalize semantic component/token layers                                      |
| Tokens           | Eleven root variables for background, foreground, surfaces, muted text, border, brand and focus              | Retain semantic idea; supersede with documented scales and tenant-accent boundaries             |
| Typography       | Geist Sans/Mono; ad hoc Tailwind sizes/weights                                                               | Retain fonts initially; introduce named type scale and density rules                            |
| Spacing          | Tailwind spacing used directly; repeated page/panel strings                                                  | Introduce layout, section, field and density tokens                                             |
| Color            | Emerald brand plus slate/amber/red utilities                                                                 | Preserve semantic intent; centralize success/warning/error/info and contrast contracts          |
| Radius/shadow    | Mostly `rounded-lg/xl/2xl`, `shadow-sm`; no formal elevation scale                                           | Standardize radius/elevation tokens                                                             |
| Icons            | `lucide-react`, inconsistently present                                                                       | Retain library; define module/action/status icon map                                            |
| Buttons          | `Button`, `ButtonLink`, three variants, two sizes, 44–48px targets                                           | Retain/refine into v2 primitive with loading/destructive/icon states                            |
| Fields           | Shared `fieldClass` imported from `AuthCard` plus many page-local variants                                   | Replace with field/select/textarea/label/error primitives                                       |
| Tables/registers | Mostly page-local div/list/table patterns                                                                    | New register/data-table pattern required                                                        |
| Status           | `StatusBadge` has neutral/success/warning; `StatusNotice` success/error                                      | Extend to complete lifecycle/access/loading states                                              |
| Cards/panels     | Repeated page-local class constants                                                                          | Create Card, KPI, section, detail and action-panel patterns                                     |
| Navigation       | Tested desktop links and accessible mobile modal                                                             | Reuse behavioral tests/focus logic; replace information architecture/presentation               |
| Breakpoints      | Tailwind defaults, predominantly `sm`, `md`, `lg`, `xl`                                                      | Retain breakpoints initially; document container and responsive component rules                 |
| Dark mode        | None                                                                                                         | Future architecture; do not block launch                                                        |
| Tenant branding  | None beyond static variables/logo treatment                                                                  | New controlled inheritance architecture required; no arbitrary CSS/JS                           |
| Accessibility    | Skip link, focus-visible styles, labels, semantic headings, live status/alert, 44px controls, reduced motion | Retain as minimum; add dialog/forms/tables/charts/high-zoom/contrast/visual-regression coverage |
| Loading states   | Almost no route-level `loading.tsx` or skeleton system                                                       | New shared skeleton/progressive-loading patterns required                                       |
| Error states     | Page-local catches and messages; no route-level error boundary inventory                                     | New consistent error/access/retry patterns required                                             |

## 4. Reuse opportunities

1. Keep App Router, Server Components/Actions, Supabase clients, route guards,
   service boundaries and server-authoritative mutations.
2. Keep `get_my_authorization`, the typed evaluator, navigation catalog concept,
   tenant-context allowlist, and distinct access reasons.
3. Keep verified domain services and compose them into new presentation/read
   models rather than duplicating logic.
4. Keep private document delivery, audit events, Action Center foundations,
   notification records, exact Finance calculations and immutable published
   result snapshots.
5. Keep the accessible interaction tests for skip links, status announcements,
   mobile-navigation focus and control target sizes as baseline regression tests.
6. Generalize `PageHeader`, Button, badges/notices, directory search and detail
   lists into Design System v2 instead of discarding working semantics.

## 5. Major missing UX surfaces backed by existing capability

- Organization profile, schools, locations/campuses and management groups.
- Users, invitations, memberships, roles, permissions and effective-access
  explanation.
- Tenant module/feature status and ordinary module configuration workflows.
- Platform Console, Tenant 360, plan/module/entitlement and rollout controls.
- Personalized Home, My Day and an exception-led Action Center.
- Persistent organization/school/session/term Context Ribbon.
- Standard registers, 360 profiles, configuration pages, workflows and states.
- Professional Finance, teacher-focused Teaching and responsibility-specific
  Assessment workspaces.
- Dedicated parent and student shells and deeper self-service flows.
- Branding inheritance, preview, publish, versioning and rollback.
- Coherent isolated demo/training organization and persona experience.

## 6. Role-experience matrix

Roles below describe experience priorities, not new authorization roles. Access
continues to derive from identity, membership, scope, assignments,
relationships, permissions, entitlements, feature state and context.

| Persona                         | Likely landing / primary navigation                     | My Day and Action Center priorities                        | Principal workflows / modules                            | Existing derivation                                                                   | Main missing UX                                                          |
| ------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Platform Super Admin            | Platform Dashboard; Tenants, Plans, Rollout, Operations | tenant incidents, provisioning, rollout approvals          | Tenant 360, entitlements, status, support audit          | Platform-owned tables and revoked tenant writes; no operator UI identity contract yet | Entire Platform Console and explicit operator authorization              |
| Organization Owner/Director     | Cross-school Home; Insights; Administration             | exceptions, approvals, finance/result/attendance summaries | schools, access, modules, management reports             | organization membership, organization-scoped role, all-school/management scope        | editable Administration, delegated admin, personalized cross-school home |
| Principal/Head Teacher          | School Home; Academics, People, Operations, Insights    | attendance, teaching, admissions, result approvals         | daily school operations and review                       | school-scoped assignments/permissions                                                 | school executive dashboard/My Day                                        |
| Deputy/Vice Principal           | School Home; Academics, Operations                      | delegated approvals and exceptions                         | attendance, teaching, discipline-adjacent tasks, results | scoped role/permission assignments                                                    | delegated-responsibility home                                            |
| HOD                             | Academic Home; Teaching, Assessment                     | missing plans/scores, review queue                         | subject/department teaching and results                  | teaching assignments plus permissions                                                 | department/subject workspace                                             |
| Teacher                         | My Day; My Teaching, Attendance, Assessment             | today's classes, attendance, lessons, score sheets         | lesson delivery, homework, score entry                   | teacher assignments, permissions, academic context                                    | My Teaching and class/subject continuity                                 |
| Class Teacher                   | Class Home; Attendance, Students, Results               | class attendance, learner exceptions, remarks              | class register, attendance, reports                      | class responsibility/assignment plus permissions                                      | class workspace and roster quick actions                                 |
| Subject Teacher                 | Subject Home; Teaching, Assessment                      | lessons and score sheets for assigned subjects             | plans, delivery, score entry                             | subject/class teaching assignment                                                     | subject workspace and efficient score grid                               |
| Bursar                          | Finance Home; Billing, Collections, Expenses, Reports   | verification, approvals, reconciliation exceptions         | finance lifecycle and reports                            | granular finance permissions/features                                                 | professional Finance navigation and exception dashboard                  |
| Cashier                         | Collections Home                                        | open session, payments, handover                           | record payment, receipt, close/handover                  | cashier/payment permissions and server controls                                       | focused cashier mode                                                     |
| Admissions Officer              | Admissions pipeline                                     | applications needing documents/decision/placement          | application-to-enrollment workflow                       | admissions permissions/features                                                       | pipeline and next-action view                                            |
| Registrar/Student Administrator | People/Students                                         | incomplete profiles, imports, transfers                    | student register/360/enrollment                          | student permissions and school context                                                | full Student 360 and bulk workflows                                      |
| Assessment/Examination Officer  | Assessment workflow                                     | incomplete score sheets, review/publication blockers       | schemes, batches, approval/publication, reports          | assessment permissions/features/locks                                                 | role-specific workflow dashboard                                         |
| Management/read-oriented user   | Insights                                                | anomalies and scheduled summaries                          | scoped dashboards, search, export/print                  | reporting scope/permissions/features                                                  | saved filters, comparisons and drill-down                                |
| Parent/Guardian                 | Parent Home / Children / For You                        | fees due, new results, notices, requested action           | learner results, attendance, finance, communication      | explicit guardian-student relationships + portal features/RLS                         | consumer shell, family overview, deeper actions                          |
| Student                         | Student Home                                            | today's school information, result/notice updates          | self-scoped attendance/results/communication             | authenticated student-person relationship + RLS                                       | age-appropriate shell and My Day                                         |

## 7. Platform boundary

Current production correctly treats plans, module entitlements and feature
rollout as platform-owned configuration. Ordinary authenticated users cannot
write them. Organization Owner is not Platform Super Admin.

Future Platform Console authorization should:

1. use a separately modeled platform-operator identity/assignment;
2. default to no tenant access and require explicit platform capability;
3. keep tenant impersonation out of the initial design; support audited support
   diagnostics instead;
4. put high-impact plan, entitlement, rollout, suspension and branding actions
   behind server-side functions with explicit caller checks, confirmations,
   reason capture and audit evidence;
5. avoid using tenant roles, user metadata, UI route hiding or service-role keys
   in the browser as authority;
6. preserve RLS and limit any SECURITY DEFINER function to a constrained,
   caller-authorized contract with safe search path and revoked PUBLIC execute.

## 8. Branding baseline

Current UI uses a fixed SchoolFlow mark, Geist and emerald/slate tokens. No
tenant branding persistence or inheritance was found.

Future inheritance is:

`Platform Policy → Plan/Entitlement → Organization Brand → School Override → User Preference`

Likely future configuration includes asset references, display names, approved
semantic color inputs, approved typography/theme identifiers, attribution and
document/login options. Draft, preview, accessibility validation, publish,
version history and rollback are required. Arbitrary CSS or JavaScript is
excluded. PX0 creates no branding schema.

## 9. Scope classification

### Launch Required

- Design System v2 foundations and accessible shared states.
- Responsive shell, work-oriented navigation and persistent Context Ribbon.
- Product-facing homepage, module/solution explanation, demo entry, signup and
  authentication reference experience.
- Personalized Home/My Day/Action Center foundations.
- Owner/school Administration for ordinary operations: organization/school
  identity, users/invitations/memberships, effective access and module status.
- Reference operational patterns for Students, Admissions, Teaching,
  Attendance, Finance and Assessment.
- Dedicated parent/student reference experiences.
- Safe Platform Console reference with Tenant 360 and rollout clarity.
- Mobile/tablet and accessibility acceptance for reference packs.
- Explicit unavailable/setup/error/loading states.

### Post-Pilot Enhancement

- Saved views, deeper dashboard personalization and favorites/recent work.
- Advanced visualizations and comparison presets.
- Expanded guided tours and training journeys.
- Richer Branding Studio options within approved constraints.
- Additional communication delivery channels after consent/provider decisions.
- Broader self-service support diagnostics and knowledge content.

### Future Architecture

- Custom tenant domains.
- Theme Gallery marketplace.
- Deep white-label packages.
- Arbitrary tenant typography/theme combinations beyond curated options.
- Advanced individual layout personalization.
- Unrestricted real-time chat or unapproved external communication providers.
- Any platform impersonation capability; if ever approved it requires a
  separate high-assurance design.

## 10. PX0 conclusion

SchoolFlow has mature, tested business capability and a small but sound
accessible UI foundation. Its dominant experience problem is not missing
domain logic; it is page-level composition, discoverability, consistency,
role focus, administration coverage and commercial presentation. PX1 should
therefore establish tokens, primitives, shell, Context Ribbon and shared states
before any broad page migration.
