# ADR-0023: Finance ledger foundation

## Status

Accepted for M9.

## Decision

School Finance remains a school-scoped operational ledger under the existing
organization tenant boundary. Authoritative money uses PostgreSQL
`numeric(14,2)` with an explicit ISO currency code; NGN is the initial school
default. Fee catalogue entries, effective-dated fee-structure versions and the
student charges generated from them are distinct records. Activated policy and
posted financial history are not edited through ordinary table access.

All Finance access passes the existing membership, permission, module
entitlement and feature checks. High-integrity multi-row mutations are exposed
as caller-bound transactional RPCs with a fixed empty search path and explicit
authenticated-only execution grants. Finance reuses shared audit, document and
approval records rather than creating parallel infrastructure.

## Boundaries

M9 includes operational billing, manual collections, allocations, receipts,
other income, expenses, advances/petty cash, cashier close/handover, manual
reconciliation and standard Finance reports. Payroll, general ledger,
procurement, online gateways, bank APIs, automated bank reconciliation, tax
engines and external accounting integrations remain outside M9.
