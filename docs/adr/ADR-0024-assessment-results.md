# ADR-0024: Assessment and Results

## Status

Accepted for M10 implementation.

## Decision

Assessment schemes are school-, session-, period-, and level-scoped, with optional subject applicability. Draft schemes contain weighted components and contiguous grade bands; activation is server-authorized and requires weights totaling 100 and grade coverage from 0 through 100.

Score sheets are result batches scoped to a subject and class. Score writes are RPC-controlled, bounded by the configured component, restricted to active class membership, teacher assignment aware, and blocked by academic locks. The database computes authoritative weighted totals and grades before submission.

The lifecycle is `draft/reopened → submitted → reviewed → approved → published`. Published data is copied to an immutable snapshot. Corrections create a linked new batch version instead of changing published evidence. Ranking is excluded because M10 does not authorize a ranking policy.

Promotion is an idempotent transaction requiring published result evidence. It creates future enrollment and class membership without overwriting prior history. Browser print uses published snapshots; no external document service is introduced.

Five features are disabled by default: configuration, score entry, result workflow, report cards, and promotion. All mutations use centralized permissions, school membership, academic entitlement, and feature checks.
