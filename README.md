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

## Deploy to Vercel

1. Connect your GitHub account to Vercel.
2. Select repository `observer12/Squeez` and import it as a new project.
3. Choose framework **Next.js** and root directory `./`.
4. Leave environment variables blank for this public demo.
5. Deploy and verify `/` and `/dashboard` on the generated preview URL.

No Vercel account has been connected or deployment verified from this chat yet.

## Roadmap for production

- Supabase Auth, Postgres, row-level security, organization-scoped API authorization
- Contract-compliant business/place discovery API with source evidence and confidence flags
- Persisted CRM, lead notes, reminders and audit trail
- Verified payment subscription webhooks, idempotency, credits, reconciliation, abuse prevention
- Regional billing availability (Bangladesh/international), legal terms, privacy compliance
- Unit/integration/e2e testing, accessibility, error monitoring, cost controls

Avoid committing `.env` files or credentials. Real billing requires an eligible merchant account.

See [implementation plan](docs/LEADATLAS_PLAN.md).
