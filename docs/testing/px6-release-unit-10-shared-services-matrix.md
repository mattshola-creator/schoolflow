# PX6 RU10 — Documents, Audit and Shared Services acceptance matrix

## Scope

Responsive migration of existing M6 school documents, append-only audit history, Action Center tasks/approvals and in-app notifications. RU10 makes notification read/unread state and the empty state explicit; it does not add a notification mutation or alter delivery.

## Evidence

| Area              | Evidence                                                                                                            | Result                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Documents         | Existing private storage, permission-scoped metadata, MIME/size validation and authorized download action unchanged | Existing M6 matrix; upload/download browser flow NOT TESTED |
| Audit             | Existing school-scoped read-only event list and immutable audit contract unchanged                                  | Existing M6 matrix; populated browser view NOT TESTED       |
| Action Center     | Existing task/approval forms and server actions unchanged                                                           | Existing M6 matrix; approval mutation NOT TESTED            |
| Notifications     | Read/unread badges, unread count and explicit empty state use the existing recipient-scoped rows                    | Component tests; authenticated browser NOT TESTED           |
| Authorization/RLS | Existing feature, permission, RLS and server context checks unchanged                                               | Existing M6 matrix and RU10 source review                   |
| Production data   | No production or shared-tenant records changed                                                                      | PASS                                                        |

## Required founder/UAT review

- [ ] A recipient sees only their own notifications; unread/read labels match `read_at`.
- [ ] Empty notification state is clear on desktop and mobile.
- [ ] Task ownership, assigned approval steps and role denial remain enforced.
- [ ] Documents remain private, and direct/cross-school object access is denied.
- [ ] Audit entries remain append-only; no edit/delete controls are presented.
- [ ] Mobile task, approval and document forms remain usable without horizontal scrolling.
