# Manual QA Checklist (Demo-Critical)

Last updated: 2026-02-17

## Environment + Startup

- [x] Run `npm run bootstrap:demo` successfully.
- [x] `scripts/check_local_demo_env.ps1` returns pass state.
- [x] Emulators listening on `4000`, `5001`, `8080`, `9099`, `9199`.
- [ ] Mobile app launches on physical iPhone with LAN emulator host.
- [ ] Admin app launches at `http://localhost:3000`.

## Auth Reliability

- [ ] Register flow works without `auth/network-request-failed`.
- [x] Login flow works for seeded personas.
- [ ] Back navigation is available on Login and Register screens.
- [ ] Forgot password action triggers reset email call path.
- [ ] Home quick logout returns to auth stack cleanly.
- [ ] Profile logout returns to auth stack cleanly.

## Role + Config Hydration

- [ ] After login, role is hydrated from `users/{uid}` document.
- [ ] Feature flags are loaded at app init/login.
- [ ] When a feature is disabled, UI hides/disables action and avoids failed call attempts.

## Customer Demo Path (Maria)

- [ ] Home screen shows search, financial card, active projects.
- [ ] Search screen lists contractors and opens contractor profile.
- [ ] Contractor profile renders verified layout and project gallery.
- [ ] Project detail screen renders milestone ledger structure.
- [ ] Completion review path supports approve and issue flows.
- [ ] Resolution submission supports document upload + summary submit.
- [ ] Recommendations and referral interactions load without hard failures.

## Contractor Demo Path (Juan)

- [ ] Project list/detail flows render with current status.
- [ ] Messages screen can send and list project messages.
- [ ] Completion request supports proof photo upload to storage emulator.
- [ ] Profile edit supports avatar upload and save.
- [ ] Documents screen supports credential doc upload and list rendering.
- [ ] Earnings/history/settings screens are visually consistent and functional.

## Upload Flows

- [ ] Avatar upload stores a real URL in Firestore user doc.
- [ ] Document upload stores a real URL in Firestore user doc.
- [ ] Completion proof upload stores URL and submission succeeds.
- [ ] Resolution file upload stores URL and callable succeeds.

## Admin Smoke (Minimal)

- [ ] Admin login works.
- [ ] Feature flags are visible and editable.
- [ ] Credential verification status is visible for demo contractor.
- [ ] Dispute/case outcome updates are visible after issue path actions.

## Error-Path Quality

- [ ] Emulator offline shows user-safe network guidance.
- [ ] Auth failures show user-safe messages (not raw stack traces).
- [ ] Disabled-feature actions do not surface precondition exceptions to users.

## Batch 1 UX (iPad / iPhone)

- [ ] Register password fields expose eye toggle and can show/hide password.
- [ ] Terms link opens scrollable modal and in-modal EN/ES switch works.
- [ ] Register submit is blocked until modal "I Agree / Acepto" acceptance.
- [ ] Messages project selector cards keep uniform dimensions across labels.
- [ ] Create Project Category/Municipality/Timeline fields use picker menus.
- [ ] Picker "Other (custom)" flow works and submits successfully.
- [ ] Handled auth failures show friendly messages without raw debug payload bars.

## Batch 2 UX Transparency (iPad / iPhone)

- [ ] Project detail `Select contractor` routes to `QuotesCompare` (no auto-select).
- [ ] Quote cards show contractor identity, price, timeline, and scope notes.
- [ ] Agreement acceptance happens from `AgreementReview`, with visible scope/policy/fee details.
- [ ] Estimate deposit creation shows amount/rationale confirmation before execution.
- [ ] Booking request action is disabled until deposit is captured, with inline reason shown.
- [ ] Project detail contractor identity shows friendly name/fallback, not raw ID alone.
- [ ] Workflow and advanced actions display contextual status/error guidance (no black-box generic flow).

## Batch 3 UX Interaction + Feedback (iPad / iPhone)

- [ ] Messages input and send controls remain visible above iPad keyboard.
- [ ] Home Recent Activity rows are tappable and open the correct project detail.
- [ ] Search recommendation cards show press feedback and open contractor profile.
- [ ] Recommendations rows are tappable and route by item type (contractor -> profile, project -> detail).
- [ ] Recommendation rows with no destination show disabled reason instead of silent no-op.
- [ ] Contractor Profile request-quote action opens Create Project without status popup.
- [ ] Contractor Profile shows explicit unavailable banner when selected contractor profile data is missing.

## Automation Parity

- [x] `npm run test:unit` passes.
- [x] `npm run test:integration` passes with emulator env vars set.
