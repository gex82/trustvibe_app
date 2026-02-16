# TrustVibe Task Board

Last updated: 2026-02-11 (productionization pass)
Legend: `[ ]` todo, `[/]` in progress, `[x]` scaffolded/implemented

## 1) Foundation

- [x] Monorepo scaffold (`apps/mobile`, `apps/admin`, `functions`, `packages/shared`, `scripts`, `data/demo`)
- [x] Root Firebase config (`firebase.json`, `.firebaserc`, rules)
- [x] Shared types, zod schemas, state machine, fee + hold policy modules
- [x] Shared EN/ES i18n JSON resources

## 2) Auth + RBAC

- [x] Auth wiring in mobile/admin clients
- [x] Role-gated callable handlers
- [x] Firestore rules baseline (least privilege foundation)
- [x] Custom claims automation (`adminSetUserRole` updates custom claims + user profile)

## 3) Marketplace Core

- [x] `createProject`, `listProjects`, `getProject`
- [x] `submitQuote`, `listQuotes`, `selectContractor`
- [x] Agreement snapshot generation on contractor selection
- [x] Dual agreement acceptance (`acceptAgreement`)

## 4) Hold + Ledger (MVP)

- [x] PaymentProvider abstraction
- [x] Mock payment provider implementation
- [x] StripeConnect provider stub (Phase 2)
- [x] `fundHold`, `requestCompletion`, `approveRelease`
- [x] Ledger event writing for money actions
- [x] Audit logs for admin/money actions

## 5) Issue + Resolution (MVP)

- [x] `raiseIssueHold`
- [x] `proposeJointRelease`, `signJointRelease`
- [x] `uploadResolutionDocument`
- [x] `adminExecuteOutcome`
- [x] Scheduled jobs for auto-release + admin-attention thresholds

## 6) Messaging + Reviews

- [x] Messaging UI/API (`listMessages`, `sendMessage`) with project-scoped access
- [x] `submitReview`, `flagReview`, `adminModerateReview`

## 7) Admin Console

- [x] Next.js admin shell + navigation
- [x] Users/projects/cases/reviews/config pages baseline
- [x] Full auth guard + server-verified admin claims (`getAdminSession` gate + client guard)

## 8) Data + Scenarios

- [x] Deterministic demo JSON datasets (`/data/demo`)
- [x] Seed script (`/scripts/seed.ts`)
- [x] Scenario scripts for required flows

## 9) Testing

- [x] Unit tests (state transitions, fees, hold policy)
- [x] Integration tests against emulator handlers for 5 flows (MVP + messaging + Phase 2)
- [x] CI pipeline (`.github/workflows/ci.yml`)

## 10) Documentation

- [x] `docs/architecture.md`
- [x] `docs/escrow_hold_state_machine.md`
- [x] `docs/api.md`
- [x] `docs/windows_runbook.md`
- [x] `docs/translation_glossary.md`
- [x] `docs/manual_qa_checklist.md`

## 11) Productionization Modules

- [x] Estimate deposit domain model + callables + ledger/audit wiring
- [x] Tiered fee config (`platformFeesV2`) + tier-aware fee calculation
- [x] Reliability scoring module + scheduled recomputation + ranking hooks
- [x] Credential verification adapter + deterministic PR mock fixtures
- [x] Stripe-first provider expansion + payment account onboarding callables
- [x] Subscription + invoice models + callable APIs
- [x] High-ticket concierge case model + bidding/admin assignment callables
- [x] Admin console updates (config JSON editors, deposits/reliability/subscriptions/concierge views)
- [x] Mobile action-surface updates for deposits, onboarding, credentials, reliability, concierge

## 12) Documentation and Baselines

- [x] `docs/business_plan_pr.md` extracted from source PDF
- [x] `docs/production_gap_assessment.md`
- [x] `docs/api_baseline_2026_02.md`
- [x] `docs/api.md` and `docs/architecture.md` refresh for productionized surface
