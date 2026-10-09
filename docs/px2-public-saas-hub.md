# PX2 — Public SaaS Hub / Prototype Pack A

## Status

Founder-review prototype. The implementation must remain on its dedicated
feature branch and draft pull request until explicit visual acceptance.

## Experience delivered

PX2 introduces a bounded public product experience at these routes:

- `/` — commercial homepage and synthetic organization preview;
- `/product` — product narrative and operating model;
- `/solutions` — single-school and multi-school use cases;
- `/modules` — implemented capability catalogue;
- `/plans` — non-binding packaging prototype;
- `/demo` — synthetic guided-tour entry and persona explanation;
- `/security` — security and trust overview;
- `/support` — prototype help, FAQ and legal placeholders;
- `/get-started` — non-persistent onboarding walkthrough.

The existing `/login` and `/sign-up` routes remain the only real authentication
entry points. PX2 does not create credentials, impersonate users, activate
entitlements or write onboarding data.

## Reuse and boundaries

- Reuses PX1 typography, spacing, semantic colors, tenant accent, focus,
  radius, shadow and motion tokens.
- Reuses the PX1 buttons, form fields and skip-link primitives.
- Adds a public-only responsive header/footer and public navigation.
- Presents implemented M0–M13 capabilities without changing their routes,
  permissions, entitlements, RLS or business services.
- Keeps Platform Super Admin separate from Organization Owner. Platform console
  functionality is not represented as an organization-owner capability.
- Uses fictional `Unity Learning Group` content only. No production tenant or
  database record is used by the prototype.
- Shows plan names and capability groupings for review, but no price, limit,
  discount or contractual commitment.
- Provides demo-persona explanation only. A resettable Demo & Training
  Organization and live perspective switching remain deferred to PX7.

## Accessibility and responsive behavior

The public shell includes a skip link, labelled navigation, a keyboard-native
mobile disclosure, visible focus inherited from PX1 controls, minimum 44px
primary controls and reduced-motion behavior inherited from Design System v2.
Layouts use deliberate one-, two- and three-column breakpoints rather than
page-level horizontal scrolling.

## Rollback

PX2 is isolated to application and documentation files. Before merge, rollback
is deletion of the feature branch/PR. If a later approved production release
must be withdrawn, revert the PX2 merge commit and allow Git continuous
deployment to publish the corrective revision. No database rollback is needed.

## Deferred decisions

- final plan names, prices, included limits and commercial terms;
- conversion analytics and consent approach;
- final legal documents and support ownership;
- production onboarding persistence and billing integration;
- PX7 demo credentials, reset lifecycle and perspective switching;
- public content-management/branding administration.
