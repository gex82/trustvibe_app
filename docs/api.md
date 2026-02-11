# Cloud Functions API

Last updated: 2026-02-11

All endpoints are Firebase callable functions in region `us-central1`.

## Project + Quote

- `createProject`
  - role: `customer`
  - input: `category,title,description,photos,municipality,desiredTimeline,budget*`
- `listProjects`
  - role: all
  - input: filters + `limit`
- `getProject`
  - role: project-scoped or open-project contractor/admin
  - input: `projectId`
- `submitQuote`
  - role: `contractor`
  - input: `projectId,priceCents,timelineDays,scopeNotes,lineItems?`
- `listQuotes`
  - role: project-scoped
  - input: `projectId`
- `selectContractor`
  - role: `customer` owner
  - input: `projectId,quoteId`

## Messaging (MVP)

- `listMessages`
  - role: project parties/admin
  - input: `projectId,limit?`
- `sendMessage`
  - role: project parties/admin
  - input: `projectId,body,attachments?`

## Agreement + Hold

- `acceptAgreement`
  - role: customer/contractor party
  - input: `agreementId`
- `fundHold`
  - role: `customer` owner
  - input: `projectId,paymentMethodId?`
- `requestCompletion`
  - role: selected contractor
  - input: `projectId,proofPhotoUrls?,note?`
- `approveRelease`
  - role: `customer` owner
  - input: `projectId`
- `raiseIssueHold`
  - role: `customer` owner
  - input: `projectId,reason`

## Resolution Flows

- `proposeJointRelease`
  - role: project parties
  - input: `projectId,releaseToContractorCents,refundToCustomerCents`
- `signJointRelease`
  - role: project parties
  - input: `projectId,proposalId`
- `uploadResolutionDocument`
  - role: project parties
  - input: `projectId,documentUrl,resolutionType,summary`
- `adminExecuteOutcome`
  - role: `admin`
  - input: `projectId,caseId,outcomeType,release/refund amounts,docReference`

## Reviews + Config

- `submitReview`
  - role: customer owner after final state
- `flagReview`
  - role: authenticated user
- `adminModerateReview`
  - role: admin
- `adminSetConfig`
  - role: admin
  - allows updating `platformFees`, `holdPolicy`, `featureFlags`
- `getCurrentConfig`
  - role: authenticated
- `getAdminSession`
  - role: `admin`
  - verifies admin claim enforcement from token
- `adminSetUserRole`
  - role: `admin`
  - input: `userId,role,disabled?`
  - updates both `users/{id}` and Firebase custom claims

## Phase 2 (Feature Flagged)

- `createMilestones`
  - role: customer owner
  - flag: `milestonePaymentsEnabled`
  - input: `projectId,milestones[]`
- `approveMilestone`
  - role: customer owner
  - flag: `milestonePaymentsEnabled`
  - input: `projectId,milestoneId`
- `proposeChangeOrder`
  - role: project parties
  - flag: `changeOrdersEnabled`
  - input: `projectId,scopeSummary,amountDeltaCents,timelineDeltaDays`
- `acceptChangeOrder`
  - role: opposite project party
  - flag: `changeOrdersEnabled`
  - input: `projectId,changeOrderId,accept`
- `createBookingRequest`
  - role: customer owner
  - flag: `schedulingEnabled`
  - input: `projectId,startAt,endAt,note?`
- `respondBookingRequest`
  - role: selected contractor
  - flag: `schedulingEnabled`
  - input: `projectId,bookingRequestId,response`
- `getRecommendations`
  - role: authenticated
  - flag: `recommendationsEnabled`
  - input: `target?,municipality?,category?,limit?`
- `adminSetPromotion`
  - role: admin
  - flag: `growthEnabled`
  - input: `code,type,discount/featured fields,active`
- `applyReferralCode`
  - role: customer/contractor
  - flag: `growthEnabled`
  - input: `code,projectId?`
- `listFeaturedListings`
  - role: authenticated
  - flag: `growthEnabled`
  - input: `limit?`

## Scheduled Jobs

- `checkAutoRelease` (every 24 hours, America/Puerto_Rico)
- `sendIssueReminders` (every 24 hours, America/Puerto_Rico)

## Validation + RBAC

- Input validation: zod schemas from `packages/shared/src/schemas.ts`.
- Access control: role + project party checks.
- Money actions: ledger and audit entries.

## Error Model

Functions throw `HttpsError` with canonical codes:

- `unauthenticated`
- `permission-denied`
- `invalid-argument`
- `failed-precondition`
- `not-found`
