# TrustVibe Architecture

Last updated: 2026-02-11 (productionization pass)

## Product Boundary

TrustVibe is neutral payment-hold infrastructure. It does not judge quality or arbitrate disputes.

Funds execution is allowed only by:

1. Customer approval in-app.
2. Fully signed joint release instruction.
3. External final resolution document with explicit outcome, executed by admin.

## Monorepo Layout

- `apps/mobile`: Expo React Native client (iOS-first, Windows-friendly workflow).
- `apps/admin`: Next.js admin console.
- `functions`: Firebase callable/scheduled backend.
- `packages/shared`: shared domain types, zod schemas, fee/reliability/deposit utilities, i18n.
- `scripts`: emulator seeding + deterministic scenarios.
- `data/demo`: deterministic PR sample data.
- `docs`: runbooks, architecture/API/state machine/policy docs.

## Runtime Components

### Mobile App

- React Native + Expo + TypeScript
- React Navigation + React Query + Zustand
- i18next with shared EN/ES keys
- Firebase Auth + callable Cloud Functions

### Admin Console

- Next.js App Router + Firebase Auth
- Admin guarded routes with claim verification
- Operations views for users/projects/cases/reviews/config plus deposits/reliability/subscriptions/concierge

### Backend

- Firebase Auth for identity + roles
- Firestore for domain records
- Cloud Functions for callable APIs + schedulers
- Payment provider abstraction:
  - `StripeConnectProvider` (live + simulation mode)
  - `MockPaymentProvider` (local prototyping)
  - `AthMovilProvider` stub adapter (`not enabled`)
- Credential verification provider abstraction:
  - deterministic PR mock provider for DACO/perito
- Reliability scoring engine:
  - event-driven updates
  - scheduled recomputation
  - eligibility gating

## Data Model

Core collections:

- `users/{id}`
- `customerProfiles/{id}`
- `contractorProfiles/{id}`
- `projects/{projectId}`
- `projects/{projectId}/quotes/{quoteId}`
- `projects/{projectId}/bookingRequests/{bookingRequestId}`
- `agreements/{agreementId}`
- `agreements/{agreementId}/milestones/{milestoneId}`
- `ledgers/{projectId}/events/{eventId}`
- `messages/{projectId}/items/{messageId}`
- `cases/{caseId}`
- `reviews/{reviewId}`
- `audit/adminActions/items/{actionId}`

Productionization additions:

- `estimateDeposits/{depositId}`
- `paymentAccounts/{userId}`
- `credentialVerifications/{verificationId}`
- `reliabilityScores/{contractorId}`
- `reliabilityScores/{contractorId}/history/{historyId}`
- `subscriptions/{subscriptionId}`
- `billingInvoices/{invoiceId}`
- `highTicketCases/{caseId}`
- `highTicketCases/{caseId}/bids/{bidId}`
- `referralCredits/{creditId}`

Config docs:

- `config/platformFees`
- `config/platformFeesV2`
- `config/depositPolicies`
- `config/subscriptionPlans`
- `config/reliabilityWeights`
- `config/highTicketPolicy`
- `config/holdPolicy`
- `config/featureFlags`

## Policy and Pricing Control

- No fee/deposit logic is hardcoded in client business flow.
- Tiered fee evaluation uses `platformFeesV2` and optional plan overrides.
- Deposit amount is category-driven from `depositPolicies`.
- High-ticket concierge threshold/fees are driven by `highTicketPolicy`.

## Reliability Model

Score inputs:

- show-up rate
- response-time score
- dispute frequency
- proof completeness
- on-time completion

Outputs:

- search/recommendation ranking weight
- auto-release eligibility
- large-job eligibility
- high-ticket eligibility

## Security and Audit

- Callable handlers enforce RBAC and project-party checks.
- Firestore Rules provide least-privilege read boundaries.
- Money/case/config/moderation actions write audit logs.
- Ledger is the money event timeline of record.

## Schedulers

- `checkAutoRelease`: applies hold-policy deadlines and reliability eligibility.
- `sendIssueReminders`: escalates unresolved issue cases to admin attention.
- `recomputeReliabilityScores`: periodic score refresh from accumulated counters.

## Internal Disclaimer

Live payment handling (including held-funds operations) requires provider compliance review and legal counsel before production enablement.
