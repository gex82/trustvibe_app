# TrustVibe Demo-Ready Execution Plan (v2, Demo-Critical First)

## Summary
- Align with the target outcome: customer/contractor demos that are reliable, visually polished, and operationally believable.
- Correct current `docs/demo_ready_plan.md` details that are inaccurate before execution.
- Batch 2 UX transparency workstream is tracked separately in `docs/batch2_ux_fixes.md`.
- Batch 3 UX interaction and feedback workstream is tracked separately in `docs/batch3_ux_fixes.md`.
- This plan is optimized for:
  - Demo-critical first
  - Feature-flag UI gating
  - Replacing the current plan doc
  - Synthetic demo asset pack
  - Minimal admin smoke coverage

## Critical Corrections to Current Plan
- Emulator host binding must be configured in `firebase.json` (`emulators.*.host`), not `firebase emulators:start --host`.
- Host binding truth: for this repo and installed Firebase CLI, keep host configuration in `firebase.json`; do not add `--host` flags to `npm run emulators`.
- Translation source of truth is `packages/shared/src/i18n/en.json` and `packages/shared/src/i18n/es.json`.
- Backend callable surface is broad; main gaps are mobile UX, role-aware flow control, and feature-flag-aware UI.
- Integration baseline must be green (`npm run test:integration`).

## Scope (In/Out)
### In Scope
- Auth reliability and navigation fixes
- Mobile redesign for key demo screens from mockups
- Role-aware and flag-aware functional flows
- Profile/photo/document upload flows
- Deterministic demo data + media pack + demo scripts
- Minimal admin smoke path for config/dispute/verification

### Out of Scope (This Cycle)
- Full admin UI redesign
- Full notification center implementation
- Full payment-method management UX
- Production/legal payment compliance expansion beyond current stubs

## Phase 0: Corrective Baseline and Plan Rewrite
- Replace `docs/demo_ready_plan.md` with this v2 spec.
- Update emulator host binding in `firebase.json`:
  - `emulators.auth.host = 0.0.0.0`
  - `emulators.firestore.host = 0.0.0.0`
  - `emulators.functions.host = 0.0.0.0`
  - `emulators.storage.host = 0.0.0.0`
  - `emulators.ui.host = 0.0.0.0`
- Keep root `package.json` emulator script simple (no CLI `--host` argument).
- Update `docs/windows_runbook.md` with one canonical startup flow and firewall checklist.
- Add `scripts/check_local_demo_env.ps1` to verify:
  - Required ports listening as expected
  - `apps/mobile/.env.local` has LAN IP for `EXPO_PUBLIC_EMULATOR_HOST`
  - Emulator + seed + mobile boot preconditions

### Exit Criteria
- Register/login works from physical iPhone without `auth/network-request-failed`.
- Startup docs are deterministic and correct.

## Phase 1: Flow Hardening (Functional Defects First)
- Implement role hydration on auth:
  - On auth change, read `users/{uid}` and set role in `apps/mobile/src/store/appStore.ts`.
- Add robust mobile error mapping:
  - Map Firebase auth/network/callable errors to user-safe messages.
- Fix auth navigation UX:
  - Enable back navigation on Login/Register in `apps/mobile/src/navigation/RootNavigator.tsx`.
  - Add Forgot Password action using `resetPassword`.
- Add feature-flag-aware UI gating:
  - Fetch `getCurrentConfig` at app init/login.
  - Store feature flags in app state.
  - Hide/disable Phase-2 actions when flags are off.
  - Apply to `ProjectDetail`, `FundEscrow`, `Recommendations`, and advanced actions.
- Fix empty-state semantics:
  - Replace loading placeholders with explicit empty states + CTA.

### Exit Criteria
- No user-facing flow throws avoidable precondition errors from disabled flags.
- Core role flows no longer depend on manual role selection state.

## Phase 2: Design System + Navigation Refactor (Mockup-Aligned)
- Rewrite `apps/mobile/src/theme/tokens.ts` to a light mockup-aligned system.
- Add reusable components in `apps/mobile/src/components`:
  - `Card`, `Badge`, `Avatar`, `SearchBar`, `ProgressBar`, `MilestoneRow`, `FinancialCard`, `ProjectCard`, `ContractorCard`, `SectionHeader`, `EmptyState`, `CTAButton`, `FormInput`, `TabBarIcon`.
- Update navigation in `apps/mobile/src/navigation/RootNavigator.tsx`:
  - Tabs: `Home`, `Search`, `Projects`, `Profile`.
- Update `apps/mobile/src/navigation/types.ts` with new routes/params.
- Update status bar style in `apps/mobile/App.tsx` for light UI.

### Exit Criteria
- Shared design primitives are used by all demo-critical screens.
- Navigation matches intended IA from mockups.

## Phase 3: Demo-Critical Screen Rebuilds
- Rebuild auth screens:
  - `RoleSelectScreen`, `LoginScreen`, `RegisterScreen`
- Rebuild dashboard:
  - `HomeScreen` with search, financial card, active project cards, recent activity
- Rebuild digital contract/milestone view:
  - `ProjectDetailScreen` as structured ledger + conditional CTA
- Build discovery + portfolio:
  - `SearchScreen`
  - `ContractorProfileScreen` (Verified Portfolio)
- Build profile surfaces:
  - `ProfileScreen`, `EditProfileScreen`, `DocumentsScreen`
- Refresh core utility screens:
  - `MessagesScreen`, `SettingsScreen`, `HistoryScreen`, `EarningsScreen`

### Exit Criteria
- Customer and contractor demo paths are visually coherent and mockup-aligned.
- No button-dump screens remain in primary demo path.

## Phase 4: Uploads and Storage Integration
- Add storage support in `apps/mobile/src/services/firebase.ts`:
  - Initialize/export storage and connect storage emulator
- Add upload utility `apps/mobile/src/services/upload.ts`:
  - `pickImage()`
  - `pickDocument()`
  - `uploadToStorage(localUri, storagePath)`
- Install/use pickers: `expo-image-picker`, `expo-document-picker`.
- Wire uploads into:
  - `EditProfileScreen` (avatar)
  - `DocumentsScreen` (credential docs)
  - `CompletionReviewScreen` (proof photos)
  - `ResolutionSubmissionScreen` (document + summary)

### Exit Criteria
- Required demo uploads produce storage URLs (no `example.com` placeholders in primary flow).

## Phase 5: Demo Data, Artifacts, and Scripted Bootstrapping
- Enhance `scripts/seed.ts` and demo JSON for deterministic personas:
  - Customer: Maria Rodriguez
  - Contractor: Juan's Services
- Create `docs/demo_credentials.md` with exact role mapping.
- Add synthetic asset pack under `apps/mobile/assets/demo/`:
  - avatars, project photos, credential mock docs, logo/splash variants
- Create `docs/demo_assets_manifest.md` (usage mapping).
- Create `docs/demo_assets_prompts.md` (reproducible generation prompts).
- Add `scripts/bootstrap_demo.ps1` to:
  - start emulators
  - seed data
  - apply demo config profile
  - print launch instructions for mobile/admin

### Exit Criteria
- One-command local demo bootstrap works reproducibly.
- Media/document artifacts are deterministic and mapped.

## Phase 6: QA, Test Hardening, and Demo Sign-off
- Fix failing integration tests:
  - `adminSetUserRole` user-not-found handling in `functions/src/http/handlers.ts`
  - deposit-policy fallback/setup in `functions/src/modules/config.ts` (or integration setup)
- Ensure `npm run test:unit` and `npm run test:integration` are green.
- Extend `docs/manual_qa_checklist.md` with screen-level checks for new flows and uploads.
- Add `docs/demo_script_customer.md` and `docs/demo_script_contractor.md`.
- Add minimal admin smoke checklist:
  - feature flags
  - dispute outcome execution
  - credential verification status

### Exit Criteria
- Automated tests green.
- Manual QA checklist passes on physical iPhone and admin web.
- Both persona demo scripts run end-to-end.

## Public API / Interface / Type Changes
- No new backend callable APIs required by default.
- Required interface updates:
  - `apps/mobile/src/store/appStore.ts`: hydrated profile + feature flags
  - `apps/mobile/src/navigation/types.ts`: tabs + new screen params
  - `apps/mobile/src/services/api.ts`: typed config/profile reads
  - `apps/mobile/src/services/firebase.ts`: export storage
- Config contract update:
  - `firebase.json` emulator host fields are required for device demos.
- Reliability updates:
  - Harden admin role sync and deposit-policy fallback for deterministic integration behavior.

## Test Cases and Scenarios
### Automated
- Existing shared unit suite remains green.
- Existing functions integration suite fully green.
- Add assertions for:
  - missing-auth-user role sync path
  - deposit creation without pre-seeded policy doc

### Manual Customer Path
- Register/login -> Home -> Search -> Contractor Portfolio -> Project flow -> Milestone review -> Upload proof/doc -> Review submission

### Manual Contractor Path
- Register/login -> Projects -> quote/completion actions -> profile/doc uploads -> earnings/history checks

### Manual Admin Smoke
- Login -> config flags -> dispute/case outcome visibility -> credential verification visibility

### Error-Path Checks
- Emulator offline/unreachable messaging quality
- Disabled-feature UI gating (no broken taps)

## Assumptions and Defaults
- Priority: demo reliability and realism over full product completion.
- Feature flags are first-class UI gates.
- Synthetic/demo data and media are acceptable.
- Minimal admin scope is included for demo confidence.
- Existing backend callable surface is sufficient unless blockers appear.
