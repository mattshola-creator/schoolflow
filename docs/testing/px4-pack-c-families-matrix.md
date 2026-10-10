# PX4 Pack C — Families acceptance matrix

| Criterion                 | Evidence                                                                             | Status                     |
| ------------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| Parent Home and For You   | Prioritized attendance, Finance, result and notice cards                             | PASS                       |
| Two linked learners       | Amara and Musa selector with different schools/classes                               | PASS                       |
| Unrelated learner denied  | Explicit relationship and cross-tenant denial                                        | PASS                       |
| Child switching integrity | Identity, attendance, Finance, result, notice and document fixtures change together  | PASS                       |
| Learner-specific Finance  | Separate bills, payments, balances and receipts                                      | PASS                       |
| Guardian relationship     | Ada explicitly identified as guardian of both cross-school linked learners           | PASS — component tests     |
| Student Finance boundary  | Summary-only balance; no receipt/history; payment responsibility stays with guardian | PASS — component tests     |
| Published-only results    | Published snapshot shown; unpublished assessment explicitly denied                   | PASS                       |
| Student self-only         | Learner selector disabled and guardian boundary explained                            | PASS                       |
| Communication/documents   | Targeted message and authorized/restricted document states                           | PASS                       |
| Production isolation      | Local fixtures; no API, Supabase or mutation path                                    | PASS                       |
| Mobile-first behavior     | Contained horizontal workspace navigation and responsive cards                       | PASS — automated/component |
| Work-browser inspection   | Netlify team SSO blocked independent capture                                         | NOT TESTED                 |
| Founder visual inspection | Protected preview                                                                    | PENDING FOUNDER ACCEPTANCE |

Known limitations: synthetic/nonpersistent content; family payments and message
replies are not operational; production M11 relationship/RLS contracts remain
authoritative and unchanged. Founder approval is still required to choose no
student access, summary-only access or authorized detailed access for a future
production policy.
