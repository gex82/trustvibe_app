# Production Gap Assessment

Last updated: 2026-02-11

## Summary

This document maps the previous MVP/prototype state against the productionization target (PR GTM + pricing aligned).

## Baseline vs Target

### Payments

- Baseline: mock hold/release/refund only, Stripe stub.
- Now: Stripe provider expanded (holds, releases, refunds, account onboarding, subscriptions/invoices) with simulation-safe fallback; ATH adapter stub added.
- Remaining: live webhook reconciliation persistence and provider-specific compliance hardening.

### Deposits and Scheduling Trust Controls

- Baseline: no estimate/booking deposit module.
- Now: estimate deposit lifecycle added (`create/capture/attendance/refund/apply credit`) plus booking attendance recording and no-show refund hooks.
- Remaining: richer appointment calendar UX and automated no-show adjudication playbooks.

### Fees and Monetization

- Baseline: single flat `platformFees`.
- Now: tiered fees (`platformFeesV2`) with plan overrides + server-side resolver.
- Remaining: full billing analytics and plan migration UX.

### Reliability and Ranking

- Baseline: rating-based recommendation scaffold.
- Now: reliability score model, counters, eligibility gating, and ranking signal integrated.
- Remaining: additional event sources and dashboard drill-down in admin.

### Credential Verification

- Baseline: static credentials array with unverified default.
- Now: provider adapter + deterministic PR mock fixtures + verification workflow + profile updates.
- Remaining: live DACO/perito connector integrations and fallback SLAs.

### Subscriptions and SaaS Billing

- Baseline: none.
- Now: subscription + invoice domain models, callable APIs, and admin visibility.
- Remaining: consolidated invoice exports and automated dunning states.

### High-ticket Concierge

- Baseline: none.
- Now: high-ticket case intake, bidding records, admin assignment, and fee events.
- Remaining: SLA timers and concierge operator workflow tooling.

### Growth Module Hardening

- Baseline: promo/referral application without post-close credit policy.
- Now: referral credit record created with pending/posted state based on project completion.
- Remaining: automated reversal workflow on refunds/disputes.

## Risk Notes

- Emulator integration testing could not be fully executed in this environment due Firebase CLI reporting no startable emulators.
- Stripe live operation requires credential/config rollout and legal/compliance sign-off.
