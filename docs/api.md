# Cloud Functions API

Last updated: 2026-02-11 (productionization pass)

All endpoints are Firebase callable functions in region `us-central1` unless noted.

## Core Marketplace

- `createProject` (customer)
- `listProjects` (all roles)
- `getProject` (project parties/open project contractor/admin)
- `submitQuote` (contractor)
- `listQuotes` (project-scoped)
- `selectContractor` (customer owner)
- `acceptAgreement` (customer/contractor)

## Funds Hold and Resolution

- `fundHold` (customer owner)
  - applies estimate-deposit credit if present
  - returns tiered fee preview
- `requestCompletion` (selected contractor)
- `approveRelease` (customer owner)
- `raiseIssueHold` (customer owner)
- `proposeJointRelease` (project parties)
- `signJointRelease` (project parties)
- `uploadResolutionDocument` (project parties)
- `adminExecuteOutcome` (admin)

## Estimate Deposits (Feature Flag: `estimateDepositsEnabled`)

- `createEstimateDeposit` (customer owner)
- `captureEstimateDeposit` (customer owner)
- `markEstimateAttendance` (project parties/admin)
- `refundEstimateDeposit` (customer owner/admin)
- `applyEstimateDepositToJob` (customer owner)

## Scheduling and Attendance (Feature Flag: `schedulingEnabled`)

- `createBookingRequest` (customer owner)
- `respondBookingRequest` (selected contractor)
- `recordBookingAttendance` (project parties/admin)

## Milestones and Change Orders

- `createMilestones` (customer, `milestonePaymentsEnabled`)
- `approveMilestone` (customer, `milestonePaymentsEnabled`)
- `proposeChangeOrder` (project parties, `changeOrdersEnabled`)
- `acceptChangeOrder` (opposite party, `changeOrdersEnabled`)

## Messaging and Reviews

- `listMessages` (project parties/admin)
- `sendMessage` (project parties/admin)
- `submitReview` (customer owner after final state)
- `flagReview` (authenticated)
- `adminModerateReview` (admin)

## Payments and Accounts

- `createConnectedPaymentAccount` (contractor/admin, `stripeConnectEnabled`)
- `getPaymentOnboardingLink` (contractor/admin, `stripeConnectEnabled`)

## Reliability

- `getReliabilityScore` (authenticated)

## Credential Verification (Feature Flag: `credentialVerificationEnabled`)

- `submitCredentialForVerification` (contractor)
- `verifyCredential` (admin)

## Subscriptions and Billing (Feature Flag: `subscriptionsEnabled`)

- `createSubscription` (customer/contractor/admin)
- `updateSubscription` (owner/admin)
- `cancelSubscription` (owner/admin)
- `listInvoices` (owner/admin)

## High-ticket Concierge (Feature Flag: `highTicketConciergeEnabled`)

- `createHighTicketCase` (customer owner)
- `submitConciergeBid` (contractor/admin)
- `assignConciergeManager` (admin)

## Recommendations and Growth

- `getRecommendations` (`recommendationsEnabled`)
- `adminSetPromotion` (`growthEnabled`, admin)
- `applyReferralCode` (`growthEnabled`, customer/contractor)
- `listFeaturedListings` (`growthEnabled`)

## Config and Admin Session

- `adminSetConfig` (admin)
  - supports:
    - `platformFees`
    - `platformFeesV2`
    - `depositPolicies`
    - `subscriptionPlans`
    - `reliabilityWeights`
    - `highTicketPolicy`
    - `holdPolicy`
    - partial `featureFlags`
- `getCurrentConfig` (authenticated)
- `getAdminSession` (admin with verified claims)
- `adminSetUserRole` (admin)

## Scheduled Jobs

- `checkAutoRelease` (24h, America/Puerto_Rico)
- `sendIssueReminders` (24h, America/Puerto_Rico)
- `recomputeReliabilityScores` (24h, America/Puerto_Rico)

## Validation, RBAC, Audit

- All callable payloads are validated with zod schemas from `packages/shared/src/schemas.ts`.
- RBAC is enforced through auth token + profile role checks.
- Money and case operations write ledger and/or audit entries.

## Error Model

Functions throw `HttpsError` codes:

- `unauthenticated`
- `permission-denied`
- `invalid-argument`
- `failed-precondition`
- `not-found`
