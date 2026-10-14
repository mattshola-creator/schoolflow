# PX6 RU8 — Communication and Families acceptance matrix

## Scope

Responsive migration of the existing school information center and linked family portal. The new portal inbox reads existing M11 communication tables under their current RLS policies and replies through the existing `send_communication_message` RPC. No schema, RLS, permission, entitlement, authentication, notification-delivery or message mutation contract is changed.

## Evidence

| Area                              | Evidence                                                                                              | Result                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Family identity and learner scope | Inbox calls `portal_context`; thread queries are restricted to its school and linked learner IDs      | Automated/source verified                                                         |
| Message access                    | Existing participant-scoped table RLS is unchanged and remains authoritative                          | Existing M11 regression evidence; RU8 integration not independently authenticated |
| Reply behavior                    | Existing send RPC, request UUID idempotency, 1–5000 character validation and in-app notification path | Source and focused tests; live send NOT TESTED                                    |
| Notices                           | Existing targeted notice publishing service and server-side audience evaluation unchanged             | Existing M11 tests; live publish NOT TESTED                                       |
| Family portal                     | Existing published-only results and linked learner switching retained; inbox link added               | Source verified; browser NOT TESTED                                               |
| Responsive/accessibility          | Mobile-first message cards, labeled reply controls, readable closed-thread state                      | Component/source checks; browser NOT TESTED                                       |
| Production data                   | No production or shared-tenant records changed                                                        | PASS                                                                              |

## Required founder/UAT review

- [ ] Guardian sees only threads for linked learners and their active participation.
- [ ] Student sees only self-authorized conversations.
- [ ] Nonparticipant and cross-school thread access is denied.
- [ ] Reply to an open thread uses the existing RPC and creates at most one message for a repeated request ID.
- [ ] Closed and archived threads do not offer a reply control.
- [ ] Targeted notices remain limited to their evaluated audience.
- [ ] Mobile and desktop inbox states are reviewed in an authenticated protected preview.
