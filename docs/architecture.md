# TrustVibe Architecture

Last updated: 2026-02-11

## Product Boundary

TrustVibe is neutral infrastructure for held funds execution.
TrustVibe does not mediate, arbitrate, or evaluate workmanship quality.
Execution only occurs when one of these applies:

1. Customer approves completion in-app.
2. Both parties sign a joint release instruction in-app.
3. Admin receives final external resolution document and executes exactly that outcome.

## Monorepo

- `apps/mobile`: Expo React Native app (iOS-first).
- `apps/admin`: Next.js admin operations console.
- `functions`: Firebase Cloud Functions (callable + schedulers).
- `packages/shared`: shared types, zod schemas, state machine, i18n resources.
- `scripts`: seeding and deterministic scenario scripts.
- `data/demo`: deterministic Puerto Rico demo datasets.

## Runtime Architecture

### Mobile

- React Native + Expo + TypeScript.
- React Navigation (auth flow + tab flow).
- React Query for server state.
- Zustand for app state (role/language/auth projection).
- i18next resources from `@trustvibe/shared`.
- Firebase Auth + callable Functions + Firestore listeners.

### Admin Web

- Next.js App Router + Firebase client SDK.
- Admin pages for users, projects, cases, reviews, and config.
- Outcome execution via callable `adminExecuteOutcome`.

### Backend

- Firebase Auth for identity.
- Firestore for domain data.
- Cloud Functions with zod payload validation.
- PaymentProvider abstraction:
  - `MockPaymentProvider` active for MVP.
  - `StripeConnectProvider` still stubbed behind feature flag.
- Ledger events at `ledgers/{projectId}/events/{eventId}` as money-source-of-truth.
- Scheduled jobs:
  - `checkAutoRelease` for approval timeout auto-release policy.
  - `sendIssueReminders` for admin-attention threshold tracking.
- Phase 2 callable modules (flag-gated):
  - milestones and partial milestone release.
  - change orders with agreement version bumping.
  - scheduling requests/confirmations.
  - rules-based recommendations.
  - growth endpoints for promotions/referrals/featured listings.

## Data Model

Top-level collections:

- `users/{id}`
- `contractorProfiles/{id}`
- `customerProfiles/{id}`
- `projects/{projectId}`
- `projects/{projectId}/quotes/{quoteId}`
- `agreements/{agreementId}`
- `ledgers/{projectId}/events/{eventId}`
- `messages/{projectId}/items/{messageId}`
- `cases/{caseId}`
- `cases/{caseId}/jointReleaseProposals/{proposalId}`
- `reviews/{reviewId}`
- `config/platformFees`
- `config/holdPolicy`
- `config/featureFlags`
- `audit/adminActions/items/{actionId}`

## Security Model

- Role gates in callable handlers (`customer`, `contractor`, `admin`).
- Firestore Rules baseline least-privilege by user/project scope.
- Storage Rules scoped by user/project/resolution paths.
- Audit records for money/config moderation operations.

## Escrow Hold Policy

- `N` (default 7 days): Customer response window after completion request.
- `M` (default 30 days): case age threshold for `ADMIN_ATTENTION_REQUIRED` marker.
- Auto-release executes only when enabled in config.

## Feature Flags (Phase 2)

`config/featureFlags`:

- `stripeConnectEnabled`
- `milestonePaymentsEnabled`
- `changeOrdersEnabled`
- `credentialVerificationEnabled`
- `schedulingEnabled`
- `recommendationsEnabled`
- `growthEnabled`

## Important Internal Disclaimer

MVP uses mock payments only. Production payment operations require payment-provider compliance review and legal counsel (including money transmission analysis).
