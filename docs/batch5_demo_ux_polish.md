# TrustVibe Batch 5: Demo UX Polish + MVP Hooks

Last updated: 2026-02-19  
Purpose: Make existing screens feel trustworthy, guided, and polished for demo — while laying minimal foundation for MVP.

---

## Approach: Demo-First with Thin MVP Hooks

**Why this approach**: The codebase already follows this pattern well. Feature flags, provider abstractions, and adapter interfaces are already scaffolded. Every UI component built here will be the same component used in MVP. We are NOT building throwaway demo code — we are building the real UI with demo-compatible data.

**Rules for this batch**:
1. All UI must work with current demo/seed data.
2. All new i18n keys must have EN + ES translations.
3. No new backend callables required — reuse existing data and state.
4. New components go in `apps/mobile/src/components/`.
5. All changes are additive. Do not refactor existing working flows.
6. Use the existing `ProgressBar`, `StatusIndicator`, `Card`, `Badge`, and `FinancialCard` components where possible.

---

## Scope (6 Items)

### Item 1: Project Progress Stepper on ProjectDetailScreen

**What**: Add a visual progress indicator at the top of `ProjectDetailScreen` showing where the project is in its lifecycle.

**Where**: `apps/mobile/src/screens/shared/ProjectDetailScreen.tsx`

**How**:
- Create a new component `apps/mobile/src/components/ProjectStepper.tsx`.
- The component receives the current `escrowState` string and maps it to a step number + label.
- Step mapping (in order):
  1. `OPEN_FOR_QUOTES` → "Quotes" (≈15%)
  2. `CONTRACTOR_SELECTED` → "Contractor Selected" (≈30%)
  3. `AGREEMENT_ACCEPTED` → "Agreement Signed" (≈45%)
  4. `FUNDED_HELD` → "Escrow Funded" (≈60%)
  5. `COMPLETION_REQUESTED` → "Work Done" (≈80%)
  6. `RELEASED` → "Complete" (100%)
  7. Any issue/hold states (`ISSUE_RAISED_HOLD`, `JOINT_RELEASE_PROPOSED`, `JOINT_RELEASE_SIGNED`, `EXTERNAL_RESOLUTION_SUBMITTED`) → show at 80% with a warning-colored indicator.
- Visual: Use the existing `ProgressBar` component for the bar. Below it, show a row of `StatusIndicator` dots for each step (completed = green checkmark, current = blue clock, future = gray, issue = yellow lock).
- Include a single-line `Text` label below the bar: e.g., "Step 4 of 6 — Escrow Funded" (localized via i18n).
- Add the stepper above the workflow status card in `ProjectDetailScreen`.

**i18n keys** (add to both EN and ES):
- `project.stepOf`: "Step {{current}} of {{total}}" / "Paso {{current}} de {{total}}"
- `project.step.quotes`: "Quotes" / "Cotizaciones"
- `project.step.contractorSelected`: "Contractor Selected" / "Contratista Seleccionado"
- `project.step.agreementSigned`: "Agreement Signed" / "Acuerdo Firmado"
- `project.step.escrowFunded`: "Escrow Funded" / "Fideicomiso Fondeado"
- `project.step.workDone`: "Work Completed" / "Trabajo Completado"
- `project.step.complete`: "Complete" / "Completo"
- `project.step.issueRaised`: "Issue Under Review" / "Problema en Revisión"

**Acceptance criteria**:
- Progress bar fills proportionally to the step number.
- All 7+ escrow states render correctly.
- Labels are bilingual.
- No layout shift on existing `ProjectDetailScreen` content.

---

### Item 2: Trust Callouts on FundEscrowScreen

**What**: Add a "Your money is protected" trust explanation card on `FundEscrowScreen` between the amount display and the "Fund Escrow" button.

**Where**: `apps/mobile/src/screens/shared/FundEscrowScreen.tsx`

**How**:
- Create a new component `apps/mobile/src/components/TrustCallout.tsx`.
- Props: `title: string`, `bullets: string[]`, `iconName?: string` (default `shield-checkmark-outline`).
- Visual: A `Card` with a shield icon, a bold title, and 3 bullet points using `Ionicons` checkmark circles for each.
- Default styling: Use `colors.success` for the shield and bullet icons, `colors.bgCard` background.
- In `FundEscrowScreen`, insert `<TrustCallout>` between the amount display and the Fund button.
- Bullet content (from i18n keys, not hardcoded):
  1. "Your money is held securely until you approve the work."
  2. "If there's a problem, payment pauses automatically."
  3. "TrustVibe never releases funds without your approval."

**i18n keys**:
- `escrow.trustTitle`: "Your Money is Protected" / "Tu Dinero Está Protegido"
- `escrow.trustBullet1`: "Your money is held securely until you approve the work." / "Tu dinero se guarda de forma segura hasta que apruebes el trabajo."
- `escrow.trustBullet2`: "If there's a problem, payment pauses automatically." / "Si hay un problema, el pago se pausa automáticamente."
- `escrow.trustBullet3`: "TrustVibe never releases funds without your approval." / "TrustVibe nunca libera fondos sin tu aprobación."

**Acceptance criteria**:
- Callout renders between amount and Fund button.
- Shield icon visible. Bullets readable.
- Bilingual.
- `TrustCallout` component is reusable (could be placed elsewhere later).

---

### Item 3: Contextual Guidance Hints on ProjectDetailScreen

**What**: Show a context-aware guidance text below the progress stepper, telling the user what to expect or do next.

**Where**: `apps/mobile/src/screens/shared/ProjectDetailScreen.tsx`

**How**:
- Below the `ProjectStepper` (Item 1), add a `Text` element styled as a subtle info hint (use `colors.textSecondary`, italic, font size 13).
- The text maps from `escrowState`:
  - `OPEN_FOR_QUOTES` with 0 quotes → "Contractors are reviewing your project. Most quotes arrive within 24 hours."
  - `OPEN_FOR_QUOTES` with quotes → "You have {{count}} quotes! Compare them and pick your contractor."
  - `CONTRACTOR_SELECTED` → "Great! Now review the agreement to move forward."
  - `AGREEMENT_ACCEPTED` → "Almost there! Fund the escrow to start the project."
  - `FUNDED_HELD` → "Your contractor is working. You can message them anytime."
  - `COMPLETION_REQUESTED` → "Take a look at the completed work. Approve or raise any concerns."
  - `RELEASED` → "Project complete! Consider leaving a review."
  - Issue states → "An issue has been raised. Work with your contractor to reach a resolution."
- For contractor role, adjust the messages (e.g., `FUNDED_HELD` → "The customer has funded the escrow. Start working on the project!").

**i18n keys**: Add all hint variants for both EN and ES, keyed as `project.hint.<state>` and `project.hint.<state>.contractor`.

**Acceptance criteria**:
- Hint text renders below stepper.
- Correct text for each escrow state.
- Different text for customer vs contractor role.
- Bilingual.

---

### Item 4: Star Rating Component for ReviewSubmissionScreen

**What**: Replace the numbered `[1] [2] [3] [4] [5]` buttons with a visual star rating component.

**Where**:
- New: `apps/mobile/src/components/StarRating.tsx`
- Modify: `apps/mobile/src/screens/shared/ReviewSubmissionScreen.tsx`

**How**:
- Create `StarRating` component with props: `value: number` (1-5), `onChange: (rating: number) => void`, `size?: number` (default 32).
- Render 5 `Ionicons` icons: filled star (`star`) for values ≤ current rating, outline star (`star-outline`) for values > current rating.
- Star color: `colors.warning` (gold/amber) for filled, `colors.textSecondary` for outline.
- Each star is a `Pressable` that calls `onChange(starIndex)`.
- In `ReviewSubmissionScreen`, replace the current `View` with mapped `PrimaryButton`s with `<StarRating value={rating} onChange={setRating} />`.
- Add `testID="review-star-{n}"` to each star Pressable for testing.

**Acceptance criteria**:
- Tapping a star sets the rating to that value.
- Filled stars render gold, unfilled stars render gray.
- Accessible (each star has a meaningful testID).
- No layout shift compared to previous button row.

---

### Item 5: Enriched Success Messages (Micro-Copy Upgrade)

**What**: Replace generic success/status messages with context-rich, trust-building copy throughout the app.

**Where**: i18n translation files only (EN + ES). No code changes needed beyond what already references these keys.

**How**: Update the following existing i18n keys (or add new ones if the current key is too generic to overwrite):

| Context | Current key / text | New EN text | New ES text |
|---------|-------------------|-------------|-------------|
| Escrow funded success | (navigation back to ProjectDetail) | "Your money is now protected. It will only be released when you approve the completed work." | "Tu dinero ahora está protegido. Solo se liberará cuando apruebes el trabajo completado." |
| Contractor selected | (navigation) | "Great choice! The contractor has been notified and will review your project details." | "¡Buena elección! El contratista ha sido notificado y revisará los detalles de tu proyecto." |
| Completion requested | (status banner) | "The contractor says the work is done. Take a look and approve when you're satisfied." | "El contratista dice que el trabajo está hecho. Revisa y aprueba cuando estés satisfecho." |
| Funds released | (Alert or banner) | "Payment sent! Consider leaving a review to help other homeowners." | "¡Pago enviado! Considera dejar una reseña para ayudar a otros propietarios." |
| Issue raised | (status banner) | "Payment is paused. Work with your contractor to resolve the issue." | "El pago está pausado. Trabaja con tu contratista para resolver el problema." |
| Review submitted | `phase2.reviewSubmitted` | "Thanks! Your review helps other homeowners make better decisions." | "¡Gracias! Tu reseña ayuda a otros propietarios a tomar mejores decisiones." |

**Note**: If the current code uses an `Alert.alert()` for any of these, convert to the inline status banner pattern used by the rest of the app (set a `statusBanner` state, render as a `Card` with `colors.success` background). This preserves the Batch 2/3 pattern.

**Acceptance criteria**:
- All 6 messages are updated in both EN and ES.
- Any remaining `Alert.alert()` for success messages is converted to inline banners.

---

### Item 6: Search Filter Chips on SearchScreen

**What**: Add horizontal filter chips above the contractor list for category, municipality, and minimum rating.

**Where**: `apps/mobile/src/screens/customer/SearchScreen.tsx`

**How**:
- Create `apps/mobile/src/components/FilterChips.tsx`:
  - Props: `filters: { label: string; value: string; active: boolean }[]`, `onToggle: (value: string) => void`.
  - Renders a horizontal `ScrollView` with `Pressable` chips.
  - Active chip: `colors.navyLight` background, white text.
  - Inactive chip: `colors.surface` background, `colors.textSecondary` text.
  - Border radius: `radii.full` (pill shape).
- In `SearchScreen`, add three filter groups:
  1. **Category filters** (reuse the same category keys from `CreateProjectScreen`: plumbing, electrical, painting, carpentry, roofing, general). Use i18n keys `project.categories.<key>`.
  2. **Municipality quick filters** (top 5: San Juan, Bayamón, Carolina, Ponce, Caguas).
  3. **Rating minimum** (4+ stars, 3+ stars).
- Filter logic: filter `filteredRecommendationItems` by the active chips. For demo, this is client-side filtering of the already-loaded recommendations list.
- **MVP hook**: The filter values should be stored in a `filters` state object shaped as `{ category?: string; municipality?: string; minRating?: number }`. When MVP backend filtering is added, this object can be passed directly to the `getRecommendations` callable.

**i18n keys**: Reuse existing category keys. Add:
- `search.filters`: "Filters" / "Filtros"
- `search.minRating`: "{{stars}}+ Stars" / "{{stars}}+ Estrellas"

**Acceptance criteria**:
- Tapping a chip filters the visible contractor list.
- Tapping an active chip deselects it (shows all again).
- Chips scroll horizontally if they overflow.
- Filter state object exists and is shaped for future backend pass-through.

---

## Verification Checklist

1. `npm run test:unit` — all existing tests pass.
2. `npm run test:integration:local` — all existing integration tests pass.
3. `npm run build -w @trustvibe/mobile` — build succeeds.
4. Visual spot-check (browser or device):
   a. Navigate to any project → progress stepper visible with correct step.
   b. Navigate to Fund Escrow → trust callout visible with 3 bullets.
   c. Navigate to Review Submission → star rating interactive.
   d. Navigate to Search → filter chips visible, filtering works.
   e. Toggle language EN ↔ ES → all new elements translate.
5. Verify no `Alert.alert` remains for success messages in any modified screen.

---

## What This Batch Does NOT Include (Deferred to MVP)

- Push notifications (Iteration B)
- Backend search filtering (MVP callable enhancement)
- Availability calendar (MVP)
- Social login (MVP)
- Message attachments (MVP)
- Analytics charts (post-MVP)
- Celebration animations (post-MVP)
