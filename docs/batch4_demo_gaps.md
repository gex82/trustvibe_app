# TrustVibe Batch 4 Demo Gap Closure

Last updated: 2026-02-19
Purpose: Close demo-illusion gaps discovered after Batch 1/2/3 completion, with demo-critical work first.

---

## Scope

1. Contractor quote submission UI from project detail.
2. Message sender display names instead of raw IDs.
3. Review submission handoff after release action.
4. Role-aware home summary and first-use guidance card.
5. FundEscrow milestone success feedback as inline status (no blocking alert).
6. Remove hardcoded English badge on contractor cards.
7. Keep all changes additive and compatible with existing callables/types.

---

## Status

| Item | Status | Notes |
| --- | --- | --- |
| Contractor submit quote screen | Implemented | New `SubmitQuote` screen, route, and contractor CTA in `ProjectDetail` |
| Messages sender identity | Implemented | `senderName?` added to message type and enriched in backend `listMessages` |
| Review handoff after release | Implemented | Customer release CTA now routes to `ReviewSubmission` on success |
| Home role differentiation | Implemented | Role-specific summary strip + CTA |
| First-use guidance card | Implemented | Role-specific guidance card when no actionable project state |
| FundEscrow milestone inline feedback | Implemented | Inline status banner replaces success alert |
| Contractor badge localization | Implemented | `ContractorCard` now uses `t('contractor.verifiedPro')` |

---

## Acceptance Criteria

1. Contractor can submit quote from `OPEN_FOR_QUOTES` project state.
2. Contractor cannot silently duplicate quote; existing quote is shown as submitted.
3. Messages display sender names for seeded personas (with friendly fallback labels).
4. Customer release flow opens review submission screen directly after successful release.
5. Home clearly differs for customer vs contractor personas.
6. First-time user sees explicit next-step guidance on Home.
7. No hardcoded English `Verified Pro` badge remains in contractor cards.

---

## Verification Checklist

1. Run `npm run test:unit`.
2. Run `npm run test:integration:local`.
3. Run `npm run build -w @trustvibe/mobile`.
4. Run `npm run pass:web:demo`.
5. Validate iPad flow:
   - Contractor quote submit path.
   - Message sender names.
   - Release -> review submission handoff.
   - Home role summary and guidance card.
