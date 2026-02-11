# Escrow Hold State Machine

Last updated: 2026-02-09

## States

- `DRAFT`
- `OPEN_FOR_QUOTES`
- `CONTRACTOR_SELECTED`
- `AGREEMENT_ACCEPTED`
- `FUNDED_HELD`
- `IN_PROGRESS`
- `COMPLETION_REQUESTED`
- `APPROVED_FOR_RELEASE`
- `RELEASED_PAID`
- `ISSUE_RAISED_HOLD`
- `RESOLUTION_PENDING_EXTERNAL`
- `RESOLUTION_SUBMITTED`
- `EXECUTED_RELEASE_FULL`
- `EXECUTED_RELEASE_PARTIAL`
- `EXECUTED_REFUND_PARTIAL`
- `EXECUTED_REFUND_FULL`
- `CLOSED`
- `CANCELLED`

## Primary Transitions

- `DRAFT -> OPEN_FOR_QUOTES`
- `OPEN_FOR_QUOTES -> CONTRACTOR_SELECTED`
- `CONTRACTOR_SELECTED -> AGREEMENT_ACCEPTED`
- `AGREEMENT_ACCEPTED -> FUNDED_HELD`
- `FUNDED_HELD -> IN_PROGRESS`
- `IN_PROGRESS -> COMPLETION_REQUESTED`
- `COMPLETION_REQUESTED -> APPROVED_FOR_RELEASE`
- `APPROVED_FOR_RELEASE -> RELEASED_PAID`
- `COMPLETION_REQUESTED -> ISSUE_RAISED_HOLD`
- `ISSUE_RAISED_HOLD -> RESOLUTION_PENDING_EXTERNAL`
- `ISSUE_RAISED_HOLD -> RESOLUTION_SUBMITTED`
- `RESOLUTION_SUBMITTED -> EXECUTED_RELEASE_FULL|EXECUTED_RELEASE_PARTIAL|EXECUTED_REFUND_PARTIAL|EXECUTED_REFUND_FULL`
- `EXECUTED_* -> CLOSED`

## Policy Logic

### Completion Request Window (N days)

- Trigger: contractor calls `requestCompletion`.
- Customer action options until deadline:
  - Approve completion (`approveRelease`).
  - Report issue (`raiseIssueHold`).
- If no customer action and auto-release enabled:
  - Scheduler `checkAutoRelease` executes release.

### Issue Hold Window (M days)

- Trigger: customer reports issue.
- Funds remain locked until:
  - Both parties sign joint release; or
  - external final document uploaded and admin executes.
- After M days without closure:
  - case flagged `ADMIN_ATTENTION_REQUIRED` by scheduler.
  - admin still does not mediate quality; admin only executes document/signed outcome.

## Execution Preconditions

Money execution requires one of:

1. Customer completion approval.
2. Fully signed joint release proposal.
3. Final external resolution document reference.

All money execution writes ledger + audit entries.
