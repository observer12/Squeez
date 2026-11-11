# Squeez design system

Product: a trustworthy B2B lead qualification and CRM workspace.

## Experience principles (informed by gstack design review)
- **Evidence over hype:** show why a lead was flagged, whether research is verified, and how confident the conclusion is.
- **One obvious next action:** discover → review → shortlist → draft → follow up.
- **Useful motion:** transitions clarify the action; never make dashboard controls dependent on animation.
- **Honest states:** demos are clearly marked, and unavailable paid or live features are not disguised as working.
- **Accessible by default:** visible focus, keyboard and screen-reader labels, 44px touch targets where possible, responsive content.

## Tokens
| Token | Value | Purpose |
| --- | --- | --- |
| ink | #161d19 | Main text |
| dark | #19241e | Navigation/strong emphasis |
| muted | #566558 | Secondary information |
| accent | #baff55 | Sparse, high-salience actions |
| accent-deep | #356d3b | Accessible accent text |
| surface | #f7f8f4 | Panels |
| line | #e4e8e0 | Dividers |
| radius-card | 12–15px | Data containers |
| max-width | 1200px | Marketing layout |

Typography: clean native sans-serif stack until final brand-font approval. Headings should have distinct sizes and restrained tracking. Data metrics should use tabular figures.

## Icon and illustration policy
Current functional icons: `lucide-react` already in the project. Keep 18–24px icons consistent with line stroke style. Do not claim or copy paid Liniqo assets. Liniqo integration requires an accessible MCP server or legitimately licensed assets; their public site describes illustrations, not a confirmed connected icon source.

## Screens to review
1. Marketing page: positioning, call to action, nav, product screenshot truthfulness, mobile scaling.
2. Lead explorer: search and filters, score explanation, confidence, review and empty states.
3. CRM: state updates, notes, history and persistence (future).
4. Billing: transparent pricing, no active checkout until provider verified (future).
5. Onboarding: first verified lead and clear source citations (future).

## Acceptance checklist
- 320–1440px viewport range
- Keyboard-only navigation and accessible control names
- Focus styles and reduced motion
- Explanation attached to every score
- Demo/paid/live states distinguishable
- No fabricated data presented as production records
