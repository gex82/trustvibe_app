# TrustVibe

Bilingual (EN/ES) iOS-first marketplace for Puerto Rico with escrow-style hold flows.

## Monorepo

- `apps/mobile`: Expo React Native app (iOS-first)
- `apps/admin`: Next.js admin console
- `apps/demo-web`: Vite phone-mimic web demo (customer/contractor + `/admin`)
- `functions`: Firebase Cloud Functions
- `packages/shared`: shared types/schemas/i18n/constants
- `scripts`: seeding and flow scenario scripts
- `data/demo`: deterministic demo datasets

## Quick Start (Windows)

1. Install Node.js LTS 20+, Firebase CLI, Expo CLI, EAS CLI.
2. Run `npm install` at repo root.
3. Start emulators: `npm run emulators`.
4. Start mobile app: `npm run dev -w @trustvibe/mobile`.
5. Open Expo QR on physical iPhone.
6. Start admin app: `npm run dev -w @trustvibe/admin`.
7. Start demo-web app: `npm run dev:demo-web`.

## Status

This repo implements MVP + productionization scaffolding:

- estimate deposits with booking/no-show hooks
- tiered fees and subscription pricing config
- reliability scoring and eligibility gating
- credential verification workflow (PR mock provider)
- Stripe-first payment-provider abstraction with onboarding/subscriptions
- high-ticket concierge workflows
- admin operations pages for deposits/reliability/subscriptions/concierge

See docs:
- `docs/architecture.md`
- `docs/api.md`
- `docs/windows_runbook.md`
- `docs/escrow_hold_state_machine.md`
- `docs/translation_glossary.md`
