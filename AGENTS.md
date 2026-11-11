# Squeez engineering working agreement

Squeez is a lead-discovery and client-acquisition SaaS. This file translates the **review workflow approach** of [gstack](https://github.com/garrytan/gstack) into project-specific guardrails. It does NOT install gstack or claim its runtime browser agents are available.

## Engineering workflow (gstack-style)
1. **Product review:** Define persona, job-to-be-done, success and failure states before changes.
2. **Architecture review:** Document data ownership, trust boundaries, billing and background jobs before connecting external services.
3. **Design review:** Audit clarity, hierarchy, visual consistency, accessibility, empty/loading/error states, and mobile behavior.
4. **Security review:** Challenge tenant isolation, authorization, usage quotas, provider credentials, webhook signatures, logging and abuse.
5. **QA/release:** Build, lint, test keyboard/mobile flows, inspect deployed routes, and verify Render deploy health.
6. **Release:** Small reviewable changes; never claim a deployment is verified without checking status and the page.

## Non-negotiables
- Never claim a business lacks an online presence based only on absent search results.
- Never present sample companies or illustrative scores as real evidence.
- Never expose lead information across organization boundaries.
- All paid entitlements and search quotas must be enforced server-side.
- Outreach is human-reviewed; retain opt-outs and obey applicable rules.
- Do not add a payment route until webhook verification, idempotency and reconciliation are implemented.
- Do not commit credentials, payment secrets, private emails, or API keys.
- Keep UI accessible: keyboard operation, labels, focus indication, adequate contrast, reduced-motion support.
- Prefer existing lucide-react icon package until any external illustration asset has confirmed licensing and integration.

## Module boundaries (target architecture)
- `app/`: routes and presentation. No provider secrets in client components.
- `components/`: reusable interface modules and interaction states.
- `lib/domain/`: typed lead, scoring and opportunity logic, independent of UI.
- `lib/server/`: authorized server operations and integrations.
- `db/`: schema, tenant RLS policies and migrations.
- `tests/`: unit, integration, security and end-to-end tests.

## Current maturity
Only marketing pages and a browser-state CRM demo exist. Data is fictional and resets on refresh. Auth, persistence, billing and live discovery are not yet implemented.
