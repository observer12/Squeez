# Squeez

**Find the businesses everyone else misses.**

Responsive marketing website and interactive CRM prototype for a future paid business-discovery SaaS.

## Current release

- Responsive public landing page
- Product positioning, features, and proposed subscription plans
- Interactive dashboard with fictional sample businesses
- Search/filter sample leads, view explainable sample scores and update pipeline stages in browser state
- Editable, copyable outreach drafts (human-reviewed)
- Deployable Next.js App Router project

**Not implemented yet:** real business search, authentication, saved CRM records, payment checkout, customer entitlements, or live outreach. Do not sell subscriptions or advertise the demo records as verified leads.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000 and navigate to `/dashboard` for the prototype.

Check the production build with:

```bash
npm run build
```

## Deploy to Render

The repository contains a [Render Blueprint](render.yaml) for a Singapore-region Node web service on the paid Starter plan. This is a public preview, **not a working paid SaaS**.

1. Connect your GitHub account to Render and grant access to `observer12/Squeez`.
2. In Render, select **New → Blueprint**, choose this repository and its `main` branch.
3. Review the Blueprint and its projected hosting charges, then approve creation.
4. Wait for the build and health check to succeed; test `/` and `/dashboard` on the Render URL.
5. Do not add real billing or business discovery credentials until authentication, data isolation, and server-side entitlement checks are implemented and tested.

The configuration uses `npm run build`, `npm run start`, and Render's injected `PORT`. No secrets are needed for the preview. **Deploy status has not been verified in this conversation.**

## Roadmap for production

- Supabase Auth, Postgres, row-level security, organization-scoped API authorization
- Contract-compliant business/place discovery API with source evidence and confidence flags
- Persisted CRM, lead notes, reminders and audit trail
- Verified payment subscription webhooks, idempotency, credits, reconciliation, abuse prevention
- Regional billing availability (Bangladesh/international), legal terms, privacy compliance
- Unit/integration/e2e testing, accessibility, error monitoring, cost controls

Avoid committing `.env` files or credentials. Real billing requires an eligible merchant account.

See [implementation plan](docs/LEADATLAS_PLAN.md).
