# M2 authorization and entitlement matrix

| Case                                            | Expected result            | Verification layer |
| ----------------------------------------------- | -------------------------- | ------------------ |
| Unauthenticated inspection                      | Deny                       | API and RPC        |
| Active member, valid school, scoped permission  | Allow                      | RPC and evaluator  |
| Non-member or inactive member                   | Deny                       | RPC                |
| Organization role in organization context       | Allow assigned permissions | RPC                |
| School role in another school                   | Exclude permission         | RPC                |
| Management-group role outside mapped school     | Exclude permission         | RPC                |
| Cross-tenant organization or school ID          | Deny                       | RPC/RLS            |
| Entitled module, permitted user, enabled state  | Allow                      | Evaluator          |
| Entitled module, missing permission             | Deny `permission_denied`   | Evaluator          |
| Non-entitled module, permitted user             | Deny `not_entitled`        | Evaluator          |
| Disabled module                                 | Deny `module_disabled`     | Evaluator          |
| Disabled feature                                | Deny `feature_disabled`    | Evaluator          |
| Ordinary user mutates plan, entitlement or flag | Deny                       | Grants/RLS         |
| Caller supplies another user for inspection     | Not possible               | API/RPC contract   |

The remote verification transaction creates disposable identities and tenant records, exercises both allow and deny cases under the `authenticated` database role, and rolls back all fixtures.
