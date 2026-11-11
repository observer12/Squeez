# LeadAtlas implementation plan

## Product
A paid web application for discovering businesses with limited discoverable online presence and managing permission-conscious sales outreach. An absence of search results is **not** proof that a business has no website or social accounts.

## Modules
1. Business discovery by location and industry, with source evidence and review flags.
2. CRM: private tenant-scoped leads, notes, pipeline stages, tasks and follow-ups.
3. Explainable lead scoring (presence gap, reachability, fit, data confidence).
4. Editable personalized outreach drafts with human approval and opt-out tracking.
5. Subscriptions with provider-verified webhooks, entitlements and server-enforced quotas.
6. International and Bangladesh market support, with payment processor availability verified before activation.

## Proposed stack
Next.js + TypeScript; Supabase Auth/PostgreSQL with row-level security; approved payment processor; commercial places and web search APIs; CI and deployment to a managed host.

## Security and launch gates
- Per-organization authorization on every API route and database query.
- Never trust a browser claim of paid subscription or remaining quota.
- Webhook signature verification, event idempotency and subscription reconciliation.
- Rate limiting and search provider cost limits.
- Secret management, audit logging and dependency scanning.
- Data minimization, deletion workflow, privacy policy, and outreach compliance review.
- Staging environment and integration tests before production.

## Next engineering milestone
Scaffold application and schema on a feature branch, test, and review before merging or deployment. This document does not represent a launched service.
