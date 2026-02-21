# Demo-Web Localization Contract

Last updated: 2026-02-21

## Scope

This contract applies to `apps/demo-web` only for this batch.

## Zero-Leak Rule (ES Mode)

When language is Spanish (`es`):

1. All platform UI copy must be Spanish.
2. All demo-seeded mock content shown in UI must be Spanish.
3. Live-mode adapters must select Spanish fields first (`*Es`) with safe fallback.
4. Currency/date/time/relative formatting must use locale `es-PR`.

## Must-Localize Domains

1. Labels, headings, buttons, placeholders, alerts, banners, empty states.
2. Project titles/descriptions and quote notes/timelines in mock data.
3. Message bodies and thread/project labels in mock data.
4. Review text and review tags in mock data.
5. Contractor specialty/badges/bio/response-time in mock data.
6. Earnings and admin collection labels shown to users.

## Allowed Exceptions

1. Proper nouns and identities: person/business/place names.
2. Emails, IDs, URLs, document references.
3. Brand name `TrustVibe`.

## Enforcement Gates

1. `npm run check:demo-web:localization`
- Static source leak gate: `scripts/check_demo_web_localization.ts`
- Localized data shape gate: `scripts/check_demo_web_localized_data.ts`
2. Unit/integration localization tests in `apps/demo-web/src/**/__tests__`.
3. E2E parity checks in `e2e/browser-demo-web/localization-parity.spec.ts`.

## Failure Policy

Any localization gate failure blocks `pass:demo-web` and is treated as a release blocker for demo-web.
