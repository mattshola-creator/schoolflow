# SchoolFlow Product Experience 2.0 Specification v1.0

**Status:** Approved Product Direction  
**Program:** SchoolFlow Product Experience 2.0  
**Execution Structure:** PX0–PX10  
**Relationship to Roadmap:** Separate modernization program; not M14  
**Foundation:** Existing SchoolFlow M0–M13 architecture and verified business capabilities

---

## Authority and conflict handling

The existing SchoolFlow Master PRD, Technical Design, accepted architecture
decisions, database/RLS model, and verified M0–M13 behavior remain
authoritative for underlying product, business, data-integrity, authorization,
security, audit, tenancy, and operational requirements.

This Product Experience 2.0 specification is authoritative for presentation,
navigation, experience architecture, role-focused UX, public SaaS UX,
Platform Console UX, branding, and the PX0–PX10 modernization program.

If an apparent conflict affects security or validated business behavior, the
existing secure/business architecture must be preserved and the conflict must
be surfaced for an explicit decision. It must never be silently overridden by
presentation work.

---

# 1. PURPOSE

SchoolFlow Product Experience 2.0 transforms SchoolFlow from a functionally mature school-management platform into a modern, commercially deployable, intuitive multi-school SaaS product.

The program shall modernize:

- public SaaS presentation;
- onboarding and subscription discovery;
- authenticated application navigation;
- dashboards and daily workflows;
- organization and school administration;
- role-specific experiences;
- parent and student experiences;
- Platform Super Administration;
- tenant branding and customization;
- demo/training capabilities;
- responsive/mobile UX;
- accessibility;
- design consistency;
- operational discoverability.

The program shall NOT replace the validated SchoolFlow domain architecture.

---

# 2. NON-NEGOTIABLE FOUNDATION

Product Experience 2.0 shall preserve the existing SchoolFlow foundations, including:

- multi-organization and multi-school tenancy;
- Supabase authentication;
- row-level security;
- centralized authorization;
- roles and permissions;
- school and organization scopes;
- SaaS plans and entitlements;
- module and feature gates;
- server-authoritative business rules;
- academic structures;
- student and staff foundations;
- shared services;
- admissions workflows;
- attendance and teaching;
- finance integrity controls;
- assessment/results computation and workflows;
- communication capabilities;
- management/reporting capabilities;
- auditability;
- private document storage;
- existing production migrations and historical data.

UI visibility shall never substitute for authorization.

No redesign may weaken RLS, cross-tenant isolation, server validation, auditability, financial integrity or assessment/result integrity.

---

# 3. EXPERIENCE ARCHITECTURE

SchoolFlow shall operate as one coherent product ecosystem with three major authenticated experience layers plus a public commercial layer.

## 3.1 Public SchoolFlow SaaS Hub

A modern public website shall serve as SchoolFlow's commercial front door.

It shall support:

- product positioning;
- module discovery;
- solution discovery;
- plan comparison;
- subscription exploration;
- demo access;
- signup/onboarding;
- sign-in;
- support/resources;
- security/trust communication.

The public website shall not simply redirect visitors to a login screen.

## 3.2 SchoolFlow Application

The authenticated application shall serve:

- organization owners;
- proprietors/directors;
- principals/head teachers;
- deputies;
- HODs;
- teachers;
- class teachers;
- subject teachers;
- bursars;
- cashiers;
- admissions officers;
- assessment/examination officers;
- registrars/student administrators;
- staff administrators;
- management users;
- parents/guardians;
- students;
- other authorized institutional actors.

One identity may hold multiple responsibilities.

The application shall construct the experience from:

**Identity + Organization + School + Relationship + Responsibilities + Permissions + Entitlements + Feature Availability + Current Context**

rather than merely from a single role name.

## 3.3 SchoolFlow Platform Console

Platform administration shall be distinct from organization ownership.

Platform operators may manage appropriate SaaS-level concerns including:

- tenants;
- schools;
- plans;
- subscriptions;
- module availability;
- entitlements;
- controlled feature rollout;
- tenant status;
- platform announcements;
- branding privileges;
- operational visibility;
- support diagnostics;
- platform audit evidence.

An Organization Owner is not automatically a SchoolFlow Platform Super Administrator.

## 3.4 Parent and Student Experience

Parents and students shall receive a deliberately simplified, consumer-style experience rather than the full administrative application.

---

# 4. PUBLIC SAAS HUB

The SchoolFlow homepage shall include:

- strong hero proposition;
- product explanation;
- actual product previews;
- modules;
- supported school structures;
- plans;
- demo invitation;
- security/trust information;
- calls to action;
- support/resources;
- sign-in;
- onboarding entry.

The experience shall be fully responsive and mobile-first.

SchoolFlow shall support modular commercial positioning rather than presenting the platform as one undifferentiated package.

A prospective organization shall be able to understand:

- what each module does;
- what is included in different plans;
- which capabilities may be optional;
- what SchoolFlow recommends for its operating structure.

Final prices and commercial plan names are not fixed by this specification.

---

# 5. INTERACTIVE DEMO & TRAINING ENVIRONMENT

SchoolFlow shall include a dedicated synthetic **Demo & Training Organization**.

It shall contain multiple fictional schools, including at minimum representative Nursery/Primary and Secondary operations.

It shall contain substantial coherent synthetic data covering:

- students/pupils;
- guardians;
- staff;
- management;
- teachers;
- classes;
- subjects;
- academic periods;
- admissions;
- attendance;
- teaching;
- finance;
- assessments;
- published results;
- documents;
- communications;
- reporting.

No real tenant or production personal data shall be used.

## Demo Personas

Visitors shall be able to experience SchoolFlow from representative perspectives including:

- Director/Organization Owner;
- Principal/Head Teacher;
- Teacher;
- Bursar;
- Admissions Officer;
- Parent;
- Student.

A demo-only **Switch Perspective** feature may allow visitors to move among these personas without repeatedly authenticating.

This capability must never become an authorization bypass for real users.

## Demo Integrity

The demo shall:

- be isolated from real tenants;
- support controlled interaction;
- restrict dangerous actions;
- reset to a canonical state;
- maintain cross-module consistency;
- support guided product tours;
- support sales demonstrations;
- support staff training;
- support regression/UX testing.

---

# 6. APPLICATION SHELL

The authenticated SchoolFlow shell shall provide:

- tenant/school identity;
- Context Ribbon;
- organization/school selector where appropriate;
- academic session/term context;
- collapsible desktop navigation;
- purpose-built mobile navigation;
- global search entry;
- command palette entry;
- notifications;
- help/support;
- user profile/account controls.

## SchoolFlow Context Ribbon

A recognizable SchoolFlow visual signature shall continuously communicate important operating context, for example:

**Organization → School → Session/Term**

The Context Ribbon shall reduce wrong-school/wrong-period operational mistakes.

It shall compress intelligently on mobile.

---

# 7. NAVIGATION MODEL

Navigation shall follow user work rather than database structure.

Recommended major groupings include:

- Home
- People
- Academics
- Operations
- Communication
- Insights
- Administration

Users shall only see areas relevant to their authorized responsibilities.

Authorized but unavailable capabilities shall receive meaningful explanations rather than disappearing without context where appropriate.

SchoolFlow shall distinguish:

- unauthorized;
- not included in plan;
- feature disabled;
- controlled rollout;
- setup required;
- invalid context;
- temporary/system error.

---

# 8. HOME, MY DAY & ACTION CENTER

## Personalized Home

The dashboard shall adapt to the user.

It shall prioritize:

- relevant KPIs;
- current work;
- exceptions;
- approvals;
- tasks;
- important alerts;
- shortcuts;
- recent activity.

It shall answer:

**What needs my attention now?**

## My Day

SchoolFlow shall provide a personalized daily operational surface.

Examples include:

- today's classes;
- attendance requirements;
- score sheets;
- approvals;
- payment verification;
- reconciliation items;
- management exceptions;
- parent actions;
- school events.

## Action Center

The existing Action Center foundation shall evolve into a major cross-module work queue.

It may surface actions such as:

- admission approval;
- payment verification;
- document review;
- attendance completion;
- assessment review;
- result approval/publication;
- administrative tasks.

---

# 9. UNIVERSAL SEARCH & COMMAND CENTER

Authorized users shall be able to search across relevant SchoolFlow entities.

Examples:

- student;
- staff;
- guardian;
- application;
- payment;
- invoice;
- receipt;
- class;
- subject;
- document.

Search results must remain permission-, tenant- and context-aware.

SchoolFlow should support a keyboard-accessible command experience such as Ctrl/Cmd+K for appropriate operations including:

- find student;
- switch school;
- add student;
- record payment;
- take attendance;
- enter scores;
- invite staff.

---

# 10. ORGANIZATION & SCHOOL ADMINISTRATION

SchoolFlow shall provide a dedicated Administration Center.

It shall ultimately cover:

- organization profile;
- schools;
- locations/campuses;
- users;
- invitations;
- memberships;
- roles;
- permissions;
- effective access;
- management groups;
- academic setup;
- modules;
- branding;
- administrative settings;
- audit history.

Organization administration must be understandable without exposing database terminology.

## Effective Access

Administrators shall be able to understand why a user can or cannot perform an operation based on:

- membership;
- role;
- permission;
- scope;
- entitlement;
- feature availability;
- context.

Permissions shall be grouped into human-readable capabilities rather than presented as an intimidating undifferentiated permission list.

## Delegated Administration

Organization Owners shall be able to delegate appropriate administrative responsibilities without granting unrestricted ownership.

---

# 11. MODULE AVAILABILITY UX

SchoolFlow shall clearly distinguish:

- capability exists in product;
- included in subscription plan;
- tenant entitled;
- tenant enabled/configured;
- controlled rollout;
- unavailable;
- setup incomplete.

Important modules shall not silently disappear without appropriate explanation.

---

# 12. STUDENT EXPERIENCE FOR STAFF

Students shall use a common register pattern and Student 360.

Student 360 may include:

- Overview
- Guardians
- Academics
- Attendance
- Finance
- Results
- Documents
- History

Visibility shall remain permission-aware.

---

# 13. STAFF EXPERIENCE

Staff shall use a Staff Register and Staff 360.

Potential areas include:

- Overview
- Employment
- Schools
- Roles & Access
- Teaching
- Attendance
- Documents
- Activity

One person may hold responsibilities across multiple schools and roles without duplicate identities.

---

# 14. ADMISSIONS EXPERIENCE

Admissions shall become a visually understandable workflow/pipeline.

The interface shall expose appropriate stages from application through enrollment while preserving the validated admissions state machine and business rules.

Applicant detail shall function as an Admissions 360 view.

---

# 15. TEACHING EXPERIENCE

Teachers shall receive a focused **My Teaching** workspace.

Primary concerns include:

- today's teaching;
- classes;
- subjects;
- attendance;
- assessments;
- student academic context;
- announcements;
- tasks.

Class/subject workspaces shall minimize navigation overhead.

---

# 16. ATTENDANCE EXPERIENCE

Attendance shall be optimized for speed, particularly on mobile/tablet.

The normal workflow should require minimal interaction:

**Class → Date → Students → Status → Save**

Productivity capabilities may include:

- mark all present;
- change exceptions;
- unsaved-change protection;
- completion indicators;
- previous attendance reference.

---

# 17. FINANCE EXPERIENCE

Finance shall receive a professional operational workspace covering:

- billing;
- payments;
- independent verification;
- allocations;
- receipts;
- reversals/corrections;
- expenses;
- other income;
- cashier controls;
- handovers;
- reconciliation;
- reports.

Dashboards shall emphasize meaningful financial indicators and exceptions.

Existing M9 financial integrity controls remain authoritative.

Student 360 shall provide authorized financial context without duplicating accounting logic.

---

# 18. ASSESSMENT & RESULTS EXPERIENCE

Assessment shall provide separate experiences for teachers, reviewers, approvers and management.

The workspace shall support:

- assessment schemes;
- score entry;
- draft state;
- submission;
- review;
- approval;
- publication;
- report cards;
- promotion.

## Score Entry

Score entry shall use a spreadsheet-like experience where appropriate, including:

- keyboard efficiency;
- inline validation;
- draft state;
- clear submission state;
- protection against accidental loss.

Server computation remains authoritative.

## Completion & Publication

Management shall be able to identify incomplete score sheets and publication blockers.

Publication shall be visually consequential and require appropriate authorization and confirmation.

---

# 19. MANAGEMENT & REPORTING

Management dashboards shall provide cross-module intelligence covering areas such as:

- enrollment;
- admissions;
- attendance;
- finance;
- academics;
- staff;
- assessment;
- operational exceptions.

Charts shall answer real management questions.

Authorized users shall be able to drill from aggregate indicators into underlying records.

---

# 20. ROLE-SPECIFIC EXPERIENCE

SchoolFlow shall provide distinct experience priorities for:

- Organization Owner/Director;
- Principal/Head Teacher;
- Deputy/Vice Principal;
- HOD/Academic Lead;
- Teacher;
- Class Teacher;
- Subject Teacher;
- Bursar;
- Cashier;
- Admissions Officer;
- Registrar/Student Administrator;
- Assessment/Examination Officer;
- Staff Administrator;
- Reception/Front Office;
- Management/read-oriented users.

The interface shall adapt dashboards, My Day, shortcuts, navigation priority, notifications and workflows.

Users shall not generally need to manually switch roles.

---

# 21. PARENT EXPERIENCE

Parents shall receive a mobile-first simplified interface centered on their children.

Major areas include:

- Home;
- Children;
- Fees/Payments;
- Results;
- Attendance;
- Announcements;
- Messages;
- Documents;
- Profile;
- For You.

## Multiple Children

One parent account shall support multiple authorized children.

SchoolFlow shall provide:

- child-specific views;
- All Children/family overview;
- family financial overview where appropriate;
- child switcher.

Underlying student ledgers remain separate.

## Parent “For You”

A simplified parent Action Center shall surface relevant items such as:

- balance due;
- new result;
- requested document;
- acknowledgement/consent;
- unread announcement.

---

# 22. STUDENT EXPERIENCE

Student interfaces shall be simplified and age-appropriate.

Potential capabilities include:

- today's classes;
- attendance;
- published results;
- announcements;
- messages;
- future learning activities.

Organizations may determine which age/level groups receive direct student accounts.

Nursery pupils, for example, may rely entirely on guardian access.

---

# 23. GUARDIAN PRIVACY

Guardian access shall respect authorized relationships.

SchoolFlow shall not assume all guardians can see each other's information.

The architecture shall support differentiated relationships such as:

- Primary Guardian;
- Parent;
- Authorized Guardian;
- Emergency Contact;
- Financially Responsible Guardian.

Sensitive family situations must not be undermined by simplistic guardian visibility rules.

---

# 24. BRANDING & EXPERIENCE STUDIO

SchoolFlow shall provide a controlled Branding & Experience Studio.

Customization hierarchy:

**SchoolFlow Platform Policy → Plan/Entitlement → Organization → School → Individual Preference**

Possible tenant-configurable elements include:

- logo;
- display identity;
- primary/secondary/accent colors;
- approved themes;
- approved typography options;
- login branding;
- dashboard presentation;
- document branding;
- email branding;
- selected navigation presentation.

Arbitrary tenant CSS and JavaScript shall not be permitted.

Security-critical UX cannot be removed or disguised.

## Branding Workflow

Brand changes shall support:

**Draft → Preview → Publish**

with:

- accessibility validation;
- preview personas;
- device previews;
- version history;
- rollback;
- safe fallback.

---

# 25. WHITE LABEL & FUTURE THEMES

White-label depth shall be controlled commercially through platform entitlements.

SchoolFlow attribution should remain visible by default.

Deeper white-label capability may become a premium feature.

The architecture shall support a future curated **SchoolFlow Theme Gallery**, but the Theme Gallery does not need to block initial pilot deployment.

---

# 26. DESIGN SYSTEM

SchoolFlow shall maintain a formal design system covering:

- typography;
- colors;
- spacing;
- radius;
- borders;
- surfaces;
- shadows;
- motion;
- breakpoints;
- semantic states;
- tenant accent behavior.

## Visual Character

SchoolFlow shall feel:

**Modern · Professional · Calm · Trustworthy · Human**

It shall avoid both generic admin-template appearance and overly playful school-themed decoration.

## Contextual Accent Signature

Tenant colors shall be applied strategically to areas such as:

- Context Ribbon;
- selected navigation;
- primary actions;
- selected highlights;
- branded documents.

Neutral surfaces shall preserve readability and professionalism.

---

# 27. COMPONENT & PATTERN LIBRARIES

SchoolFlow shall maintain reusable components for:

- buttons;
- fields;
- cards;
- badges;
- tables;
- tabs;
- dialogs;
- drawers;
- navigation;
- KPIs;
- filters;
- pagination;
- alerts;
- loading states;
- empty states;
- permission states.

It shall also maintain reusable interaction patterns including:

- registers;
- 360 profiles;
- approval flows;
- configuration pages;
- dashboards;
- wizards;
- Action Center;
- My Day;
- score-entry grids.

---

# 28. RESPONSIVE & MOBILE DESIGN

SchoolFlow shall be deliberately responsive.

Desktop shall support:

- dense data;
- tables;
- bulk operations;
- side panels;
- complex administration.

Mobile shall prioritize:

- essential information;
- large touch targets;
- common actions;
- simplified navigation;
- cards/priority views where tables are inappropriate.

Tablet layouts shall be deliberately considered, particularly for teaching, attendance and score entry.

Parent UX shall treat mobile as a primary platform.

---

# 29. ACCESSIBILITY

Accessibility shall be part of the design system.

Important requirements include:

- keyboard navigation;
- visible focus;
- semantic markup;
- strong contrast;
- accessible forms;
- meaningful labels;
- screen-reader considerations;
- adequate touch targets;
- reduced-motion support.

Color shall never be the only indicator of status.

---

# 30. PERFORMANCE & CONNECTIVITY

Performance is part of UX.

SchoolFlow shall:

- avoid unnecessary heavy assets;
- optimize branding images;
- paginate/virtualize large datasets where appropriate;
- avoid loading unused modules;
- remain practical on slower mobile connections;
- use sensible progressive loading/caching strategies.

The initial operating environment shall receive excellent support for NGN, local school structures, printable documents and mobile-heavy use while preserving international extensibility.

---

# 31. TABLE & FORM STANDARDS

Data-heavy screens shall follow common patterns for:

- search;
- filters;
- filter chips;
- sorting;
- columns;
- selection;
- pagination;
- bulk actions;
- saved views;
- export where permitted.

Forms shall use:

- logical grouping;
- clear labels;
- inline validation;
- appropriate defaults;
- required-field clarity;
- sensible field widths;
- keyboard usability;
- mobile responsiveness.

---

# 32. STATUS, EMPTY & ERROR STATES

SchoolFlow shall have shared patterns for:

- Draft;
- Pending;
- In Review;
- Approved;
- Published;
- Completed;
- Rejected;
- Cancelled;
- Loading;
- Empty;
- Error;
- Unauthorized;
- Not entitled;
- Disabled;
- Setup required.

Empty states shall guide users toward appropriate next actions rather than merely stating “No records found.”

---

# 33. NOTIFICATIONS & COMMUNICATION

Notifications shall be responsibility-aware.

They should be actionable where appropriate and route users to the relevant authorized record.

Parents and students shall only receive information appropriate to their relationships.

Future communication channels may include:

- in-app;
- email;
- SMS;
- WhatsApp;

subject to product scope, consent and commercial decisions.

---

# 34. PLATFORM SUPER ADMIN

The Platform Console shall provide appropriate SaaS-level management.

Major surfaces shall include:

- Platform Dashboard;
- Organizations;
- Tenant 360;
- Plans;
- Modules;
- Entitlements;
- Feature Rollout;
- Tenant Status;
- Branding Privileges;
- Platform Users/Operators;
- Announcements;
- Audit;
- Operational/Support visibility.

Tenant 360 should expose:

- overview;
- schools;
- subscription;
- modules;
- entitlements;
- features;
- branding;
- operational status;
- audit evidence.

High-impact platform actions require strong confirmation and auditing.

---

# 35. PROTOTYPE APPROVAL STRATEGY

Before mass migration, SchoolFlow shall build production-quality reference experiences grouped into five review packs.

## Pack A — Public Product

- Homepage
- Plans/modules
- Demo entry
- Authentication

## Pack B — School Operations

- Owner dashboard
- School dashboard
- Administration
- Students
- Student 360
- Admissions
- Teacher/My Day
- Attendance
- Finance
- Assessment/Results

## Pack C — Families

- Parent Home
- Child switching
- Family finance
- Results
- Student Home
- For You

## Pack D — SaaS Platform

- Platform dashboard
- Tenant 360
- Plans/modules/entitlements
- Feature rollout

## Pack E — Experience System

- Branding Studio
- Search/command center
- Notifications
- Help
- responsive states
- loading/error/access states
- design-system reference

Mass migration shall not begin until founder visual acceptance of the reference experience.

---

# 36. IMPLEMENTATION PRINCIPLES

The redesign shall:

- reuse the current application;
- avoid a clean rewrite;
- preserve authoritative backend logic;
- minimize unnecessary schema changes;
- build design foundations before page-by-page migration;
- use reusable components/patterns;
- implement incrementally;
- maintain rollback capability;
- avoid indefinite dual-UI maintenance.

Recommended migration order:

1. Application shell
2. Home/My Day/Action Center
3. Administration
4. Students/Staff
5. Admissions
6. Teaching/Attendance
7. Finance
8. Assessment/Results
9. Communication/Parent/Student
10. Management/Reporting
11. Documents/Audit/shared services

---

# 37. TESTING

Existing SchoolFlow automated/security verification remains a regression gate.

Product Experience 2.0 shall add appropriate testing for:

- design-system components;
- navigation visibility;
- representative roles;
- mobile/responsive behavior;
- accessibility;
- demo environment;
- Platform Console authorization;
- branding inheritance;
- branding entitlements;
- visual regression;
- cross-tenant denial;
- performance.

Finance integrity and Assessment/Results integrity tests remain mandatory.

Quality gates shall continue to include appropriate:

- formatting;
- lint;
- strict TypeScript;
- production build;
- dependency/security review;
- secret review.

---

# 38. HUMAN UAT

Broad representative human UAT shall occur after Product Experience 2.0 implementation and technical verification.

UAT shall test complete workflows rather than merely page rendering.

Representative actors shall include:

- Organization Owner;
- Principal;
- Teacher;
- Bursar;
- Admissions Officer;
- Assessment Officer;
- Parent;
- Student;
- Platform Administrator where appropriate.

Mobile UAT shall receive particular emphasis for teachers and parents.

Explicit UAT signoff is required before pilot readiness.

---

# 39. BACKUP/RESTORE REQUIREMENT

Product Experience 2.0 does not remove the outstanding M13 operational backup requirement.

Before final pilot acceptance, SchoolFlow still requires verified evidence for:

**Production Database Export → Production Storage Export → Checksums → Encrypted Off-Site Copy → Disposable Non-Production Restore → Verification**

The current operator walkthrough is paused after backup setup Step 17 and will resume separately.

---

# 40. SCOPE CLASSIFICATION

Every PX requirement shall be classified as:

## Launch Required

Required for a coherent controlled pilot and full Product Experience 2.0 rollout.

## Post-Pilot Enhancement

Valuable but not required to start the controlled pilot.

## Future Architecture

Architecturally anticipated but deliberately deferred.

Likely future/deferred examples include, subject to PX0 validation:

- custom tenant domains;
- full Theme Gallery marketplace;
- advanced white-label offerings;
- selected advanced communication channels;
- some advanced demo/guided-tour capabilities;
- selected sophisticated personalization.

Deferral must not result in architectural dead ends.

---

# 41. EXECUTION PROGRAM

Product Experience 2.0 shall use the following durable execution structure.

## PX0 — Experience Specification & Baseline

Establish this specification as authority, inspect the existing implementation, map current UI against the target experience, classify scope, identify reuse opportunities and produce the implementation baseline.

## PX1 — Design System & Application Shell

Implement design tokens, components, responsive shell, Context Ribbon, navigation foundations and common states.

## PX2 — Prototype Pack A

Implement the Public Product reference experience.

## PX3 — Prototype Pack B

Implement representative School Operations reference experiences.

## PX4 — Prototype Packs C–E

Implement Families, Platform and Experience System reference experiences.

## PX5 — Founder Visual Acceptance

Founder reviews the five prototype packs.

No full-system migration without approval.

## PX6 — Full Operational Migration

Propagate approved patterns across the complete authenticated application.

## PX7 — Demo & Training Environment

Implement the coherent synthetic demo organization, personas, reset capability and appropriate guided/demo experiences.

## PX8 — Platform & Branding Administration

Complete Platform Super Admin and Branding & Experience administration.

## PX9 — Regression, Accessibility & Performance

Run comprehensive technical, security, responsive, accessibility, visual and performance verification.

## PX10 — Human UAT & Pilot Readiness

Run representative human UAT, resolve defects, obtain signoff and make final pilot-readiness determination.

---

# 42. CHATGPT WORK EXECUTION RULES

Work shall:

- use bounded PX phases;
- create durable checkpoints;
- preserve test/deployment evidence;
- reuse approved components;
- avoid rediscovering settled requirements;
- distinguish design approval from mass migration;
- avoid feature creep;
- stop for destructive or security-impacting ambiguity;
- avoid changing validated backend behavior merely to simplify frontend implementation;
- never expose secrets;
- preserve production tenant data and historical QA evidence;
- use synthetic data for demo/prototype requirements;
- respect founder approval gates.

---

# 43. PRODUCT EXPERIENCE SUCCESS CRITERIA

SchoolFlow Product Experience 2.0 succeeds when:

1. A prospective school can understand SchoolFlow without logging in.
2. A prospect can experience a realistic interactive demo.
3. A new organization can understand how to begin onboarding.
4. An owner can discover and administer authorized capabilities without backend intervention for ordinary operations.
5. Staff see interfaces appropriate to their actual responsibilities.
6. Teachers can complete routine classroom tasks quickly on mobile/tablet.
7. Finance workflows remain secure while becoming easier to operate.
8. Assessment workflows become efficient and understandable.
9. Parents can understand children, fees, attendance and results from a phone.
10. Students receive an age-appropriate experience.
11. Platform operators can diagnose plan/entitlement/feature availability.
12. Schools can safely express their identity through controlled branding.
13. SchoolFlow remains visually coherent across tenants and modules.
14. Existing security, tenancy and business integrity remain intact.
15. Human UAT validates real end-to-end workflows.
16. Backup/restore readiness and operational evidence are complete before final pilot acceptance.

---

# 44. GOVERNING PRINCIPLE

SchoolFlow Product Experience 2.0 shall make the platform substantially easier, clearer, more attractive and more commercially compelling **without sacrificing the secure architecture and operational integrity already established**.

The target is not merely a better-looking SchoolFlow.

The target is a SchoolFlow that feels like a mature, integrated, trustworthy SaaS operating system for schools.
