# TrustVibe Workplan

Last updated: 2026-02-11

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

- Mobile UX polish pass (copy consistency + i18n completeness + visual refinements).
- Add CI quality gates for lint/type checks once lint rules are enabled.

## Build Sequence (Execution)

1. Foundation + shared package: complete.
2. Auth/RBAC baseline: complete.
3. Project/quote/agreement: complete baseline.
4. Hold/ledger/release + issue paths: complete baseline.
5. Admin + docs + demo scripts: complete baseline.
6. QA hardening + UI coverage + notification wiring: in progress.
7. Phase 2 modules behind flags: callable implementation complete.

## Near-Term Iterations

### Iteration A (stabilize MVP)

- Push/email trigger hooks for message/review notifications.
- Add stricter lint and typed API response contracts.
- Add admin case execution presets for partial outcomes.

### Iteration B (release readiness)

- CI test pipeline and rule tests.
- FCM/APNs setup and notification template parity EN/ES.
- TestFlight dry run via EAS preview then production profile.

### Iteration C (Phase 2 activation prep)

- Stripe Connect live implementation under `stripeConnectEnabled`.
- Promotion analytics and referral attribution reporting.
- Scheduling reminders and notification fan-out.

## Risks to Track

- Emulator-to-physical-device network misconfiguration on Windows.
- Role-claim drift between auth token and `users` fallback data.
- Legal/compliance dependency before real payments.
