# TrustVibe

Bilingual (EN/ES) iOS-first marketplace for Puerto Rico with escrow-style hold flows.

## Monorepo

- `apps/mobile`: Expo React Native app (iOS-first)
- `apps/admin`: Next.js admin console
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

## Status

This repo implements MVP core backend flow with mock payments, plus Phase 2 callable features behind flags
(milestones, change orders, scheduling, recommendations, growth tooling).

See docs:
- `docs/architecture.md`
- `docs/api.md`
- `docs/windows_runbook.md`
- `docs/escrow_hold_state_machine.md`
- `docs/translation_glossary.md`
