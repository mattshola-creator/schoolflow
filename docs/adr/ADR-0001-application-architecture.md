# ADR 0001 Application Architecture

- Status: Accepted
- Date: 12 September 2026

## Context

The PRD defines a modular multi-school SaaS product. The older technical plan proposed Next.js, NestJS and Prisma. The latest approved instruction requires Next.js and Supabase for backend, PostgreSQL, authentication, storage and RLS.

## Decision

SchoolFlow uses a feature-oriented Next.js App Router application with Supabase. Migrations and RLS policies are version controlled under `supabase/`. Server Actions and Route Handlers own privileged or multi-step workflows. Browser data access is permitted only when protected by tested RLS. Organization is the tenant boundary.

## Consequences

- NestJS and Prisma are not baseline dependencies.
- Supabase Auth replaces custom password/session code.
- RLS starts with the first tenant-owned schema.
- Next.js deploys through GitHub to Netlify without a second API deployment.
