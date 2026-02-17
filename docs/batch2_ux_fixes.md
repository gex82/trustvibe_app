# TrustVibe Batch 2 UX Transparency Plan (Decision-Complete, iPad-First)

## Summary

- `docs/batch2_ux_fixes.md` is directionally correct and matches real code pain points.
- Current implementation issues:
1. `ProjectDetailScreen` auto-selects `quotes[0]` and shows generic alerts.
2. Agreement acceptance can happen inline without meaningful review context.
3. Deposit creation/capture flow is opaque and feels like a black box.
4. Booking can fail with generic precondition messaging.
5. Contractor identity is shown as raw IDs.
- Keep Batch 2 as a separate doc and do not append to Batch 1.

## Locked decisions

1. Actions UI: Guided mode.
2. Agreement flow: Auto-advance in demo.
3. Contractor identity: Backend enrichment.
4. Auto-advance implementation: Demo-only backend shortcut.

## Phase 0 - Plan/File Hygiene

1. Keep this file as the source of truth for Batch 2.
2. Add short pointers in `docs/demo_ready_plan.md` and `docs/manual_qa_checklist.md`.

## Phase 1 - Backend Data Enrichment

1. Update `packages/shared/src/apiContracts.ts`.
- `getProject` now returns enriched quote objects:
- `contractorName?`
- `contractorAvatarUrl?`
- `contractorRatingAvg?`
- `contractorReviewCount?`
- Add optional `agreement` and `estimateDeposit` in response.
2. Update `functions/src/http/handlers.ts` `getProjectHandler`.
- Read agreement doc by project id.
- Read estimate deposit doc by `project.estimateDepositId`.
- Enrich quotes with contractor identity/profile fields.
3. Keep all new response fields optional for backward safety.

## Phase 2 - Demo-only Agreement Auto-Advance

1. Update `packages/shared/src/apiContracts.ts`.
- `acceptAgreement` request supports optional `demoAutoAdvance?: boolean`.
2. Update `functions/src/http/handlers.ts` `acceptAgreementHandler`.
- If `demoAutoAdvance` and emulator runtime are true, set both signatures and mark ready to fund.
- Otherwise keep normal two-party acceptance.
3. Update `apps/mobile/src/services/api.ts`.
- Add typed support for `demoAutoAdvance` and preview callable.
4. Update `apps/mobile/src/screens/shared/AgreementReviewScreen.tsx`.
- Customer acceptance sends `demoAutoAdvance` in demo mode.
- Show explicit in-app note that contractor acceptance is simulated for demo.

## Phase 3 - Guided Workflow on Project Detail

1. Update `apps/mobile/src/screens/shared/ProjectDetailScreen.tsx`.
- `OPEN_FOR_QUOTES`: navigate to `QuotesCompare`.
- `CONTRACTOR_SELECTED`: navigate to `AgreementReview`.
- `AGREEMENT_ACCEPTED`: navigate to `FundEscrow`.
2. Add workflow status card:
- Human-readable state.
- Selected contractor identity.
- Selected quote amount and timeline.
- Agreement acceptance status.
3. Keep one primary next action visible.
- Move advanced/demo operations to a collapsed Developer Actions section.
4. Replace generic success popups with inline status banners for normal workflow actions.

## Phase 4 - Quotes Compare Clarity

1. Update `apps/mobile/src/screens/shared/QuotesCompareScreen.tsx`.
- Quote card shows contractor name fallback, price, timeline, scope notes, optional rating/review count.
2. Selection behavior:
- Explicit per-card action `Select this contractor`.
- On success, route to `AgreementReview`.

## Phase 5 - Agreement Review Transparency

1. Update `apps/mobile/src/screens/shared/AgreementReviewScreen.tsx`.
- Render contractor identity, scope summary, price, timeline, hold policy, fee disclosure.
2. Use scrollable details for iPad portrait.
3. Keep `Accept agreement` and `Compare quotes`.

## Phase 6 - Deposit Flow Explainability

1. Add callable `previewEstimateDeposit`.
- Request: `{ projectId, category? }`
- Response: `{ amountCents, currency, category, rationale }`
2. Implement in `functions/src/http/productionHandlers.ts`.
- Reuse pricing policy logic.
- Same auth/precondition checks as create flow.
3. Update `apps/mobile/src/services/api.ts` with wrapper.
4. Update `apps/mobile/src/screens/shared/ProjectDetailScreen.tsx`.
- Show confirm dialog before create with amount + rationale.
- Show inline deposit details card after operations.
- Disable booking until deposit status is captured/attended.

## Phase 7 - Action-specific Errors and Disabled Reasons

1. Update `apps/mobile/src/screens/shared/ProjectDetailScreen.tsx`.
- Booking without captured deposit -> explicit reason.
- Deposit without selected contractor -> explicit reason.
- Wrong state -> explicit next-step guidance.
2. Show disabled reason text below blocked advanced actions.
3. Keep global `mapApiError` fallback for unknown cases.

## Phase 8 - i18n and Demo Docs

1. Update `packages/shared/src/i18n/en.json` and `packages/shared/src/i18n/es.json`.
- Add keys for workflow card labels, deposit preview/confirm, disabled reasons, agreement auto-advance notice, contractor identity labels.
2. Update `docs/demo_script_customer.md`.
- Guided taps: compare quotes, review agreement details, confirm deposit amount before create.
3. Update `docs/manual_qa_checklist.md`.
- Add Batch 2 checks for transparency and explainable actions.

## Public API / Interface / Type Changes

1. `packages/shared/src/apiContracts.ts`:
- `getProject` response includes optional `agreement`, `estimateDeposit`, and enriched quote identity fields.
- `acceptAgreement` request supports `demoAutoAdvance?: boolean`.
- New callable `previewEstimateDeposit`.
2. `apps/mobile/src/services/api.ts`:
- New wrapper `previewEstimateDeposit`.
3. No route type changes required.

## Test scenarios

### Backend integration

1. `getProject` returns enriched contractor identity fields when available.
2. `getProject` returns agreement/deposit objects when available.
3. `previewEstimateDeposit` amount matches category policy.
4. `acceptAgreement` with `demoAutoAdvance=true` only shortcuts in emulator/demo runtime.
5. `acceptAgreement` without shortcut preserves two-party logic.

### Manual iPad flow

1. `OPEN_FOR_QUOTES` now routes to quote compare, no auto-select.
2. Quote cards display contractor identity and quote details.
3. Agreement acceptance happens from agreement review.
4. Deposit creation asks for confirmation with amount/rationale.
5. Booking action is disabled with a clear reason until deposit prerequisites are met.
6. Project detail contractor label is no longer raw-id-only.
7. Feedback is contextual and not black-box generic alerts.

## Assumptions

1. Batch 2 remains demo-focused and emulator-first.
2. Demo auto-advance is guarded to emulator/demo runtime and not production behavior.
3. If no contractor name is available, UI uses friendly fallback plus ID.
4. Deposit amounts come from backend policy, not mobile hardcoding.
