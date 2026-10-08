# M13 dependency security assessment — 2026-10-08

## Decision

The production-path Next.js, Sharp and source-map-js advisories are release
blockers for PX1 and must be remediated before its production merge. This
focused hardening change upgrades Next.js and its lint integration to 16.3.8
and constrains transitive Sharp and source-map-js resolution to their patched
versions. It does not change application behavior or weaken the audit gate.

One development-only `braces` advisory remains. No patched npm release exists
as of this assessment. It is not included in a production dependency path and
SchoolFlow does not provide attacker-controlled glob patterns to its lint
toolchain. The audit must continue reporting it until an upstream patch or a
separately approved security exception is available.

## Findings

| Advisory              | Severity | Installed before      | Path and exposure                                                                                                         | Patched version        | Assessment and action                                                                                                                                                                                             |
| --------------------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GHSA-cjq9-62q9-8jv4` | High     | `next@16.3.6`         | Direct production dependency; Image Optimization SSRF                                                                     | `next>=16.3.8`         | Potentially reachable in a deployed Next.js server even though the repository currently has no `next/image` or remote-image configuration. Upgrade to 16.3.8 and regression-test routes/build.                    |
| `GHSA-wq5f-xc86-pv6w` | High     | `sharp@0.35.4`        | Optional production dependency under Next.js; librsvg memory-safety flaw                                                  | `sharp>=0.35.5`        | Image-processing exposure is low in the current application but the native package is installed in the production dependency graph. Override to 0.35.5 and verify install/build.                                  |
| `GHSA-68fv-2mgg-jv7q` | High     | `source-map-js@1.2.1` | Transitive through Next.js/PostCSS and development tooling; event-loop denial of service on malicious indexed source maps | `source-map-js>=1.2.2` | No SchoolFlow endpoint parses user-supplied source maps, so runtime exploitability is low; production path still exists. Override to 1.2.2 and run the full gate.                                                 |
| `GHSA-vfj7-8cjw-p6xm` | High     | `braces@3.0.3`        | Development-only: `eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces`                   | None published         | Not shipped as an application runtime dependency. Exploitation requires deeply nested attacker-controlled glob input during lint/tool execution. Retain as a visible residual finding; do not suppress the audit. |
| `GHSA-3w37-wq28-93x7` | Moderate | `next@16.3.6`         | Direct production dependency; Draft Mode / `use cache` content leak                                                       | `next>=16.3.8`         | Repository search found no `use cache` directive, reducing present reachability. Upgrade with the Next.js patch and regression-test authenticated rendering.                                                      |
| `GHSA-4jqv-mc3x-m676` | Moderate | `next@16.3.6`         | Direct production dependency; self-hosted SSG/ISR cache poisoning                                                         | `next>=16.3.8`         | Netlify deployment reduces the advisory's self-hosted preconditions, but the vulnerable framework is production code. Upgrade.                                                                                    |
| `GHSA-f87g-xv8r-7p7x` | Moderate | `next@16.3.6`         | Direct production dependency; App Router metadata image disclosure                                                        | `next>=16.3.8`         | No matching dynamic metadata-image route was identified, but the framework defect is present. Upgrade.                                                                                                            |
| `GHSA-mcj8-r9mp-w47p` | Moderate | `next@16.3.6`         | Direct production dependency; SSG/ISR cross-user substitution / persistent denial of service                              | `next>=16.3.8`         | SchoolFlow relies heavily on dynamic authenticated server rendering, which reduces current exposure; patch remains mandatory.                                                                                     |
| `GHSA-39w2-rjm5-chcv` | Low      | `next@16.3.6`         | Development server MCP endpoint only                                                                                      | `next>=16.3.8`         | Not exposed by the Netlify production runtime. Resolved by the same framework upgrade.                                                                                                                            |

## Regression requirements

- frozen-lockfile install;
- formatting and zero-warning lint;
- strict TypeScript;
- full automated test suite;
- clean production build;
- dependency-tree verification for exact patched versions;
- dependency audit showing only the documented development-only `braces`
  advisory;
- tracked-secret scan; and
- a Netlify Deploy Preview of the hardening branch before any production
  release.

PX1 remains unmerged. The hardening PR must land first, then PX1 must be updated
onto the hardened `main`, re-run its full quality gate, and receive explicit
production-merge authorization.
