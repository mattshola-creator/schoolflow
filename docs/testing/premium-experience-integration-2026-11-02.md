# Premium operational UI candidate

This draft refines existing SchoolFlow presentation components without changing domain services or data.

## Implemented

- Royal Emerald Executive, Ocean Intelligence and Midnight appearances retain existing theme identifiers.
- The twelve-theme catalogue and legacy light appearance remain available.
- Owner, Leadership, Finance and Teacher use a shared task-list presentation with caller-supplied permitted destinations.
- Teacher work areas and Finance tasks appear before summaries.
- Shared headers, cards, forms and tables inherit scoped appearance styling.
- Overflowing shared tables provide a named keyboard-focusable scroll region while retaining table semantics.

## Validation

746 application tests passed. Formatting, lint, TypeScript, application build and showroom isolation build passed. This is automated evidence, not authenticated visual acceptance.

## Acceptance still required

Review three appearances using identical permitted data, keyboard and mobile interactions, existing task links and published appearance after refresh. Concept images are references only. No new screenshots are presented as live acceptance.

## Reversibility

Close this draft or revert the UI change to restore the prior presentation. No database rollback is required. Existing release restrictions remain in force.

## Approved concept alignment

The executive header now includes an original decorative campus illustration,
with compact metric cards and task rows across the existing operational dashboards.
Owner summaries use four columns when desktop space permits. Ocean and Midnight
retain distinct surface treatments, while narrow screens preserve full-width text.
The illustration is decorative, has no external image dependency and is omitted
from print. No invented trends, records, permission changes or domain mutations
are introduced by this presentation slice. Live visual acceptance remains separate
from automated verification.
