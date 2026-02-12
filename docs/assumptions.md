# TrustVibe Assumptions

Last updated: 2026-02-11 (productionization pass)

## Confirmed Assumptions Used in Code

### Product and policy

- TrustVibe remains neutral and does not mediate workmanship quality.
- Hold execution requires one of: customer approval, fully signed joint release, or external final document.
- Default hold-policy values for MVP config:
  - `N` approval window = 7 days
  - `M` admin attention threshold = 30 days
  - auto-release enabled = true

### Market and locale

- Launch market is Puerto Rico only.
- Time zone is `America/Puerto_Rico`.
- Currency is USD.
- Bilingual support starts at MVP (EN/ES) via shared i18n resources.

### Development constraints

- Development is Windows-first.
- iOS testing uses physical iPhone + Expo dev workflow.
- iOS cloud builds/submission use EAS (`development`, `preview`, `production` profiles).
- Backend local validation uses Firebase Emulator Suite.

### Payments

- Provider selection is environment-driven:
  - local prototype can use `PAYMENT_PROVIDER=mock`.
  - staging/production default behavior is Stripe-first (`stripeConnectEnabled` and provider selection logic).
  - ATH Movil is kept as a pluggable stub (`not enabled`) adapter.
- Fee configuration remains server-side only:
  - legacy: `config/platformFees`
  - tiered: `config/platformFeesV2`
- Estimate deposits are policy-driven from `config/depositPolicies` (no client-side hardcoded fee logic).

### Identity and RBAC

- Roles: `customer`, `contractor`, `admin`.
- Admin actions require verified admin custom claim in auth token.
- Emulator fallback allows admin profile role when claim has not yet propagated.

### Phase 2 rollout

- New production feature surfaces are implemented and gated by `config/featureFlags`:
  - estimate deposits
  - credential verification
  - reliability scoring
  - subscriptions
  - high-ticket concierge
- Credential verification uses deterministic mock provider fixtures now, with a provider interface ready for live connectors.
- Stripe implementation is functional in simulation/test mode and requires real Stripe credentials for live processing.

### Reliability and trust policy

- Reliability score controls:
  - ranking signal in recommendations
  - auto-release eligibility
  - large-job/high-ticket eligibility thresholds
- No-show penalties reduce contractor reliability and trigger estimate deposit refund when applicable.

## Open Assumptions to Validate Before Production

- Legal/compliance requirements for held funds in Puerto Rico and broader US jurisdiction.
- Stripe Connect capability and account model for Puerto Rico launch.
- External resolution document authenticity procedure at scale.
- Push/email deliverability hardening (APNs keys, SPF/DKIM/DMARC, provider SLAs).

## Internal Disclaimer (non user-facing)

Live payment handling and held-funds operations require legal review and payment-provider compliance approval before production activation.
