# PX5 cross-persona journey verification matrix

These are prototype-direction checks, not claims that PX6 operational migration
has occurred.

| Journey                                            | Accepted reference | Result / migration note                                |
| -------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| Prospect → modules → plan → onboarding             | Pack A             | PASS; pricing remains non-binding                      |
| Owner → group overview → school scope              | Pack B             | PASS; authoritative context unchanged                  |
| Principal → exceptions → approvals                 | Pack B             | PASS; production actions remain service-authorized     |
| Teacher → class → attendance                       | Pack B             | PASS; prototype submission disabled                    |
| Admissions officer → applicant → readiness         | Pack B             | PASS; M7 state machine preserved                       |
| Bursar → collections → verification                | Pack B             | PASS; M9 exact-decimal and segregation rules preserved |
| Assessment officer → draft → publication readiness | Pack B             | PASS; M10 server computation preserved                 |
| Registrar → student → enrollment history           | Pack B             | PASS; scoped synthetic 360 reference                   |
| Guardian → linked learner → fees/results           | Pack C             | PASS; sibling records remain isolated                  |
| Student → self → published result/Finance summary  | Pack C             | PASS as prototype; Finance policy unresolved           |
| Support Viewer → case → safe diagnostics           | Pack D             | PASS; privileged controls absent                       |
| Authorized user → scoped search/notification       | Pack E             | PASS; execution remains independently authorized       |

Northgate remains inaccessible in Pack B. Organization Owner remains distinct
from Platform Super Admin. Persona selectors alter presentation only.
