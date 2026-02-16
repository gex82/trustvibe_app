# API Baseline (2026-02-11)

This file freezes the callable surface before productionization additions, for migration diff tracking.

## Baseline Callables

- `createProject`
- `listProjects`
- `getProject`
- `submitQuote`
- `listQuotes`
- `selectContractor`
- `acceptAgreement`
- `fundHold`
- `requestCompletion`
- `approveRelease`
- `raiseIssueHold`
- `proposeJointRelease`
- `signJointRelease`
- `uploadResolutionDocument`
- `adminExecuteOutcome`
- `submitReview`
- `flagReview`
- `adminModerateReview`
- `listMessages`
- `sendMessage`
- `adminSetConfig`
- `getCurrentConfig`
- `getAdminSession`
- `adminSetUserRole`

### Phase 2 (baseline feature-flagged)

- `createMilestones`
- `approveMilestone`
- `proposeChangeOrder`
- `acceptChangeOrder`
- `createBookingRequest`
- `respondBookingRequest`
- `getRecommendations`
- `adminSetPromotion`
- `applyReferralCode`
- `listFeaturedListings`

## Scheduled Jobs

- `checkAutoRelease`
- `sendIssueReminders`

## Migration Notes

- All new productionization callables were added without removing baseline endpoints.
- Backward compatibility retained for existing payloads where possible (`adminSetConfig` now accepts additional optional documents).
