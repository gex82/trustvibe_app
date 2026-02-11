# TrustVibe Assumptions

Last updated: 2026-02-11

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

- MVP uses `MockPaymentProvider` only.
- `StripeConnectProvider` remains stubbed and disabled behind feature flag.
- Fee config is server-side only (`config/platformFees`) and never hardcoded in client business logic.

### Identity and RBAC

- Roles: `customer`, `contractor`, `admin`.
- Admin actions require verified admin custom claim in auth token.
- Emulator fallback allows admin profile role when claim has not yet propagated.

### Phase 2 rollout

- Phase 2 callable endpoints are implemented but remain gated by `config/featureFlags`.
- Stripe Connect provider is still intentionally non-live and must stay disabled until compliance + provider setup is complete.

## Open Assumptions to Validate Before Production

- Legal/compliance requirements for held funds in Puerto Rico and broader US jurisdiction.
- Stripe Connect capability and account model for Puerto Rico launch.
- External resolution document authenticity procedure at scale.
- Push/email deliverability hardening (APNs keys, SPF/DKIM/DMARC, provider SLAs).

## Internal Disclaimer (non user-facing)

MVP payment flows are mock implementations only. Live production payment handling requires legal review and payment-provider compliance approval.
