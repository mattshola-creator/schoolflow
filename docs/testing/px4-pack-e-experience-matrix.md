# PX4 Pack E — Experience System acceptance matrix

| Criterion                 | Evidence                                                                | Status                     |
| ------------------------- | ----------------------------------------------------------------------- | -------------------------- |
| Design-system reference   | Typography, actions, status, cards and responsive table                 | PASS                       |
| Branding inheritance      | Platform → organization → school effective-brand preview                | PASS                       |
| Draft/publish/rollback    | Concepts shown; publish and rollback disabled                           | PASS                       |
| Contrast safety           | Fixed semantic error/security state independent of tenant accent        | PASS                       |
| Search scope              | Authorized and restricted grouped results                               | PASS                       |
| Command authorization     | Search visibility explicitly separate from command permission           | PASS                       |
| Notifications/help        | Read/unread interaction and contextual guidance                         | PASS                       |
| Notification scope        | Academy school scope, explicit group origin and distinct platform scope | PASS — component tests     |
| Application states        | Loading, empty, error, denial, entitlement, disabled, setup and context | PASS                       |
| Reduced motion            | Loading animation disables under reduced-motion preference              | PASS — component/CSS       |
| Keyboard/touch            | Semantic controls, focus rings and 44px minimum actions                 | PASS — component tests     |
| Mobile workspace tabs     | Swipe cue, edge affordance, active-item reveal and arrow-key focus      | PASS — component tests     |
| Production isolation      | Local fixtures and disabled nonpersistent branding concepts             | PASS                       |
| Work-browser inspection   | Netlify team SSO blocked independent capture                            | NOT TESTED                 |
| Founder visual inspection | Protected preview                                                       | PENDING FOUNDER ACCEPTANCE |

Known limitations: no production branding persistence, command execution,
notification delivery or support integration; high-zoom and screen-reader visual
review remain founder/manual acceptance items.
