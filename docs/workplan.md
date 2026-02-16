# TrustVibe Workplan

Last updated: 2026-02-11 (productionization pass)

## Scope Strategy

MVP first with operational reliability and strict neutral execution rules.
Phase 2 modules stay behind feature flags to avoid destabilizing MVP.

## Current Delivery Snapshot

### Completed scaffold

- Monorepo + Firebase emulator setup.
- Shared domain package (types/schemas/state machine/fees/policy/i18n).
- Core callable backend for project->quote->agreement->hold->release.
- Issue hold, joint release, external resolution intake, admin execution.
- Ledger and audit trails for money-related events.
- Scheduled hold policy jobs.
- Mobile app shell (auth, project list/create/detail, action buttons, settings language toggle).
- Admin console shell (users/projects/cases/reviews/config).
- Deterministic demo data, seed script, and repeatable scenario scripts.
- Unit + integration test scaffolding for required logic flows.

### In progress

- Final pass on bilingual UX copy consistency for newly added productionization flows.
- Emulator-enabled integration validation in this environment (CLI currently reports no startable emulators).

## Build Sequence (Execution)

1. Foundation + shared package: complete.
2. Auth/RBAC baseline: complete.
3. Project/quote/agreement: complete baseline.
4. Hold/ledger/release + issue paths: complete baseline.
5. Admin + docs + demo scripts: complete baseline.
6. QA hardening + UI coverage + notification wiring: in progress.
7. Phase 2 modules behind flags: callable implementation complete.

## Near-Term Iterations

### Iteration A (stabilize productionization changes)

- Execute emulator-backed integration runs for new deposit/subscription/concierge/credential paths.
- Add webhook reconciliation persistence for Stripe event replay hardening.
- Add referral-credit settlement job for post-close posting/reversal automation.

### Iteration B (release readiness)

- FCM/APNs + email template parity for new lifecycle events.
- TestFlight dry run via EAS preview then production profile.
- Add municipality-by-municipality progressive rollout KPI dashboard.

## Risks to Track

- Emulator-to-physical-device network misconfiguration on Windows.
- Role-claim drift between auth token and `users` fallback data.
- Legal/compliance dependency before real payments and held-funds operation at scale.
