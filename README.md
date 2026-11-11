# Squeez

**Find the businesses everyone else misses.**

Responsive marketing website and interactive CRM prototype for a future paid business-discovery SaaS.

## Current release

- Responsive public landing page with a Liniqo map illustration
- London discovery demo at `/explore` with tilted, flat and list views
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
4. Wait for the build and health check to succeed; test `/`, `/explore` and `/dashboard` on the Render URL.
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

## London discovery demo

The explorer lets freelancers and agencies try location-first research. Each location links to its Wikidata coordinates and any website-status evidence. Coverage is curated and lead suitability is unassessed. Green means the official website was reachable at the last check. Gold requires affirmative evidence that the business has no official website. Unchecked, inconclusive and unreachable cases stay unknown. The CRM uses a separate fictional dataset.

- MapLibre GL JS renders OpenFreeMap's Liberty style with 3D building extrusions at street zoom without a key. The renderer loads on the explorer only. The map opens flat for reduced-motion users, and the list remains usable without WebGL or a working basemap.
- To change basemaps, set `NEXT_PUBLIC_MAP_STYLE_URL` to the HTTPS style URL on Render and rebuild. This setting is public. Choose a style with a fill-extrusion layer for 3D buildings. Keep the provider attribution and use a browser-restricted public token if the provider requires one.
- To connect real discovery, add a server-side provider adapter behind authentication and organization-scoped authorization. Keep provider secrets server-side and enforce quotas there. Return permitted fields, source links and provider-sourced coordinates. Skip map pins for locations without coordinates. Record the source and date of any website review, and keep inconclusive searches distinct from confirmed findings.
- The landing uses Liniqo's City map with pin under its [asset license](https://liniqo.com/license/). Interface controls use Lucide.

### Smoke checks

1. Follow **Explore London**. Check that tiles and pins load. Select a pin and check its matching card.
2. Switch between 3D, 2D and List. Check that 3D buildings disappear in 2D and that website status filters match the pins and cards. Test category and name searches, clear an empty search and open a location source.
3. Tab through controls at a narrow viewport. Check reduced motion and the list fallback with WebGL disabled.
4. Open `/dashboard` and check the fictional CRM.
