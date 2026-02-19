# Manual QA Checklist (Demo-Critical)

Last updated: 2026-02-19

Batch streams:
- Batch 1: `docs/batch1_ux_fixes.md`
- Batch 2: `docs/batch2_ux_fixes.md`
- Batch 3: `docs/batch3_ux_fixes.md`
- Batch 4: `docs/batch4_demo_gaps.md`
- Batch 5: `docs/batch5_demo_ux_polish.md`

## Environment + Startup

- [x] Run `npm run bootstrap:demo` successfully.
- [x] `scripts/check_local_demo_env.ps1` returns pass state.
- [x] Emulators listening on `4000`, `5001`, `8080`, `9099`, `9199`.
- [ ] Mobile app launches on physical iPhone with LAN emulator host.
- [x] Admin app launches at `http://localhost:3000`.

## Auth Reliability

- [x] Register flow works without `auth/network-request-failed`.
- [x] Login flow works for seeded personas.
- [x] Back navigation is available on Login and Register screens.
- [x] Forgot password action triggers reset email call path.
- [x] Home quick logout returns to auth stack cleanly.
- [x] Profile logout returns to auth stack cleanly.

## Role + Config Hydration

- [x] After login, role is hydrated from `users/{uid}` document.
- [x] Feature flags are loaded at app init/login.
- [ ] When a feature is disabled, UI hides/disables action and avoids failed call attempts.

## Customer Demo Path (Maria)

- [x] Home screen shows search, financial card, active projects.
- [x] Search screen lists contractors and opens contractor profile.
- [x] Contractor profile renders verified layout and project gallery.
- [x] Project detail screen renders milestone ledger structure.
- [x] Completion review path supports approve and issue flows.
- [x] Resolution submission supports document upload + summary submit.
- [x] Recommendations and referral interactions load without hard failures.

## Contractor Demo Path (Juan)

- [x] Project list/detail flows render with current status.
- [x] Messages screen can send and list project messages.
- [ ] Completion request supports proof photo upload to storage emulator.
- [x] Profile edit supports avatar upload and save.
- [x] Documents screen supports credential doc upload and list rendering.
- [x] Earnings/history/settings screens are visually consistent and functional.

## Upload Flows

- [x] Avatar upload stores a real URL in Firestore user doc.
- [x] Document upload stores a real URL in Firestore user doc.
- [ ] Completion proof upload stores URL and submission succeeds.
- [ ] Resolution file upload stores URL and callable succeeds.

## Admin Smoke (Minimal)

- [x] Admin login works.
- [x] Feature flags are visible and editable.
- [x] Credential verification status is visible for demo contractor.
- [x] Dispute/case outcome updates are visible after issue path actions.

## Error-Path Quality

- [ ] Emulator offline shows user-safe network guidance.
- [x] Auth failures show user-safe messages (not raw stack traces).
- [ ] Disabled-feature actions do not surface precondition exceptions to users.

## Batch 1 UX (iPad / iPhone)

- [x] Register password fields expose eye toggle and can show/hide password.
- [x] Terms link opens scrollable modal and in-modal EN/ES switch works.
- [x] Register submit is blocked until modal "I Agree / Acepto" acceptance.
- [ ] Messages project selector cards keep uniform dimensions across labels.
- [ ] Create Project Category/Municipality/Timeline fields use picker menus.
- [ ] Picker "Other (custom)" flow works and submits successfully.
- [ ] Handled auth failures show friendly messages without raw debug payload bars.

## Batch 2 UX Transparency (iPad / iPhone)

- [x] Project detail `Select contractor` routes to `QuotesCompare` (no auto-select).
- [x] Quote cards show contractor identity, price, timeline, and scope notes.
- [x] Agreement acceptance happens from `AgreementReview`, with visible scope/policy/fee details.
- [ ] Estimate deposit creation shows amount/rationale confirmation before execution.
- [ ] Booking request action is disabled until deposit is captured, with inline reason shown.
- [x] Project detail contractor identity shows friendly name/fallback, not raw ID alone.
- [x] Workflow and advanced actions display contextual status/error guidance (no black-box generic flow).

## Batch 3 UX Interaction + Feedback (iPad / iPhone)

- [ ] Messages input and send controls remain visible above iPad keyboard.
- [x] Home Recent Activity rows are tappable and open the correct project detail.
- [x] Search recommendation cards show press feedback and open contractor profile.
- [x] Recommendations rows are tappable and route by item type (contractor -> profile, project -> detail).
- [ ] Recommendation rows with no destination show disabled reason instead of silent no-op.
- [x] Contractor Profile request-quote action opens Create Project without status popup.
- [x] Contractor Profile shows explicit unavailable banner when selected contractor profile data is missing.

## Batch 4 UX Demo Gaps (iPad / iPhone)

- [ ] Contractor can open an `OPEN_FOR_QUOTES` project and submit a quote from mobile UI.
- [ ] Contractor with an existing quote sees read-only submitted summary (no duplicate-submit confusion).
- [ ] Messages display sender names (or friendly fallback labels) instead of raw UID-only values.
- [ ] Customer `Review and Release` action routes to `ReviewSubmission` on success.
- [ ] `ReviewSubmission` returns user to `ProjectDetail` after submit.
- [ ] Home summary content differs by role (customer vs contractor).
- [ ] First-use guidance card appears when user has no actionable project state.
- [ ] FundEscrow milestone creation uses inline status feedback, not blocking success alert.
- [ ] Contractor badge label is localized in EN/ES on search/recommendation cards.

## Batch 5 UX Demo Polish (iPad / iPhone)

- [ ] Project detail shows progress stepper with correct step label for each escrow state.
- [ ] Project detail contextual hint changes by escrow state and role (customer vs contractor).
- [ ] Fund Escrow shows trust callout card with 3 protection bullets.
- [ ] Fund Escrow success message uses trust-focused inline copy before navigation.
- [ ] Review submission uses star rating component (no numeric button row).
- [ ] Review submission success uses inline banner (no blocking success alert).
- [ ] Search shows category/municipality/min-rating filter chips.
- [ ] Search `Clear filters` resets chip state and restores list.
- [ ] Batch 5 strings are fully localized in EN/ES.

## Batch 5.1 UX Consistency (iPad / iPhone)

- [ ] FundEscrow fund action errors render inline banner (no blocking alert modal).
- [ ] Review submission shows selectable tags (quality/communication/timeliness).
- [ ] Review submit blocks when zero tags are selected and shows inline error.

## Laptop Browser Spot-Check (Chrome + Edge)

- [x] Chrome: customer login -> key navigation path -> home quick logout.
- [x] Chrome: contractor login -> messages input/send -> profile/documents -> logout.
- [x] Chrome: Home activity row tap opens correct project detail.
- [x] Chrome: Search and Recommendations rows show clear tap feedback and route correctly.
- [x] Chrome: Agreement/deposit transparency checkpoints render correctly.
- [x] Edge: customer login -> key navigation path -> home quick logout.
- [x] Edge: contractor login -> messages input/send -> profile/documents -> logout.
- [x] Edge: Home activity row tap opens correct project detail.
- [x] Edge: Search and Recommendations rows show clear tap feedback and route correctly.
- [x] Edge: Agreement/deposit transparency checkpoints render correctly.

## Automation Parity

- [x] `npm run test:unit` passes.
- [x] `npm run test:integration` passes with emulator env vars set.
