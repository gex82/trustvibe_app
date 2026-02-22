# TrustVibe Batch 3 UX Plan (Demo-First, Corrected, MVP-Hook Ready)

## Summary
- Keep Batch 3 as a standalone stream in this file.
- Correct scope for screenshot-reported issues:
  - Recommendation tap failures include `RecommendationsScreen`, not only `SearchScreen`.
  - Disruptive status alert source is `ContractorProfileScreen` request-quote flow, not create-project success flow.
- Prioritize demo-critical UX fixes first, then add minimal MVP-ready placeholders.

## Scope
1. Fix keyboard/input visibility on iPad for messaging.
2. Fix tappable-but-no-action rows and add clear press feedback.
3. Remove misleading modal status alerts in normal flow.
4. Add minimal recommendation payload placeholders for future live integrations.
5. Keep changes isolated to Batch 3 surfaces.

## Changes Implemented

### 1) iPad keyboard/input visibility
- `apps/mobile/src/screens/shared/MessagesScreen.tsx`
  - Added `KeyboardAvoidingView`.
  - Uses iOS `padding` behavior and header-aware `keyboardVerticalOffset`.
  - Keeps composer section anchored below messages and above keyboard.
  - Added `keyboardDismissMode="interactive"` and `keyboardShouldPersistTaps="handled"` on lists.
  - Increased bottom padding for message list content.

### 2) Tap targets and press feedback
- `apps/mobile/src/screens/customer/HomeScreen.tsx`
  - Converted Recent Activity rows to `Pressable`.
  - Added navigation to `ProjectDetail` by `projectId`.
  - Added pressed-state feedback.
- `apps/mobile/src/components/ContractorCard.tsx`
  - Added pressed visual feedback (opacity).
- `apps/mobile/src/screens/customer/SearchScreen.tsx`
  - Uses enriched recommendation display fields when available.
  - Falls back to friendly contractor label format (`Contractor #001` / `Contratista #001`).
- `apps/mobile/src/screens/shared/RecommendationsScreen.tsx`
  - Recommendation rows are now interactive.
  - Contractor recommendation -> `ContractorProfile`.
  - Project recommendation -> `ProjectDetail`.
  - Rows with no valid destination are disabled and show explicit copy.
  - Featured listing rows navigate to contractor profile when contractor id exists.

### 3) Remove black-box alert and improve profile clarity
- `apps/mobile/src/screens/contractor/ContractorProfileScreen.tsx`
  - Removed modal status alert from request-quote action.
  - Request quote now navigates directly to `CreateProject`.
  - Added explicit "profile unavailable" banner for missing contractor docs.
  - Avoids silently presenting unrelated profile data without context.

### 4) Minimal MVP recommendation placeholders
- `packages/shared/src/types.ts`
  - Extended `RecommendationItem` with optional fields:
    - `contractorName?`
    - `contractorAvatarUrl?`
    - `contractorRatingAvg?`
    - `contractorReviewCount?`
    - `projectTitle?`
- `functions/src/http/handlers.ts`
  - `getRecommendationsHandler` now enriches customer-target recommendations with optional contractor display data from user/profile docs.
  - Contractor-target recommendation items now include optional `projectTitle`.

### 5) Localization updates
- `packages/shared/src/i18n/en.json`
- `packages/shared/src/i18n/es.json`
  - Added copy for:
    - Contractor fallback names
    - Profile-unavailable state
    - Recommendation row actions and disabled state
    - Unknown project label

## Demo Validation Checklist (Batch 3)
1. Messages input and send button remain visible when iPad keyboard is open.
2. Home Recent Activity rows navigate to project detail on tap.
3. Search recommendation cards show press feedback and open contractor profile.
4. Recommendations rows route to contractor/profile detail (or show clear disabled reason).
5. Request Quote in contractor profile navigates without disruptive status popup.
6. Missing contractor profile data shows explicit unavailable context (no silent mismatch).
7. EN/ES copy renders correctly on all modified surfaces.

