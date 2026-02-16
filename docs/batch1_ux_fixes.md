# Batch 1 UX Fixes (Implemented)

Last updated: 2026-02-16

## Summary

This batch implements the iPad QA feedback for:
1. Password visibility toggle on auth forms.
2. Clickable Terms and Conditions link with required modal acceptance.
3. Uniform project selector cards in Messages.
4. Pull-down picker UX with "Other (custom)" support in Create Project.
5. Reduced noisy auth debug logging for handled failures.

## Implemented Changes

### 1) Password Show/Hide Toggle

- Updated `apps/mobile/src/components/FormInput.tsx`.
- Password inputs now show an eye icon on the right when `secureTextEntry` is enabled.
- Tapping toggles mask/unmask.
- Added accessibility label updates for show/hide state.

### 2) Terms and Conditions Modal + Acceptance Requirement

- Updated `apps/mobile/src/screens/auth/RegisterScreen.tsx`.
- Register form now shows:
  - checkbox target (opens terms modal),
  - text prefix + clickable underlined terms link.
- Modal includes:
  - scrollable full T&C text,
  - independent EN/ES in-modal language toggle,
  - `Close` and `I Agree / Acepto` actions.
- User must accept in modal before registration can proceed.

#### T&C source and demo metadata

- Added `apps/mobile/src/legal/termsContent.ts`.
- Demo metadata used:
  - Effective Date: February 16, 2026
  - Last Updated: February 16, 2026
  - Legal Company: TrustVibe Demo Company, LLC
  - Jurisdiction: Commonwealth of Puerto Rico
  - Arbitration Admin: AAA
  - Contact Email: support@trustvibe.test
  - Contact Address: San Juan, Puerto Rico (Demo Address)

### 3) Uniform Messages Project Selector Cards

- Updated `apps/mobile/src/screens/shared/MessagesScreen.tsx`.
- Replaced variable-width buttons with fixed-size project cards.
- Cards now keep consistent width/height, centered text, 2-line cap, and clear active/inactive styles.

### 4) Pull-Down Picker Menus + Custom Values

- Added `apps/mobile/src/components/PickerInput.tsx`.
- Updated `apps/mobile/src/screens/customer/CreateProjectScreen.tsx`:
  - `Category`, `Municipality`, `Desired timeline` use picker modal input.
  - Supports `Other (custom)` with free-text entry.
  - Keeps `Title` and `Description` as text inputs.
- Reused `data/demo/municipalities.json` (78 municipalities).
- Submission remains backend-compatible (`string` fields).

### 5) Handled Auth Logging Noise

- Updated:
  - `apps/mobile/src/screens/auth/LoginScreen.tsx`
  - `apps/mobile/src/screens/auth/RegisterScreen.tsx`
- Handled auth failures now use warning-level logging instead of error-level logging.
- User-facing message flow remains inline + alert.

## i18n Additions

- Updated:
  - `packages/shared/src/i18n/en.json`
  - `packages/shared/src/i18n/es.json`

Added keys include:
- Terms UX:
  - `auth.acceptTermsPrefix`
  - `auth.acceptTermsLink`
  - `auth.termsModalTitle`
  - `auth.termsAgreeAction`
  - `auth.termsCloseAction`
  - `auth.termsRequiredToContinue`
- Common:
  - `common.close`
  - `common.readMore`
  - `common.english`
  - `common.spanish`
  - `common.other`
- Create project picker labels:
  - `project.create.customValuePlaceholder`
  - `project.category.plumbing`, `project.category.electrical`, `project.category.painting`,
    `project.category.carpentry`, `project.category.roofing`, `project.category.general`
  - `project.timeline.immediately`, `project.timeline.within1Week`, `project.timeline.within2Weeks`,
    `project.timeline.within1Month`, `project.timeline.flexible`

## Verification Checklist

### Automated

1. `npm run build -w @trustvibe/mobile`
2. `npm run pass:web:demo`

### Manual (iPad / iPhone)

1. Register password fields show eye toggle and mask/unmask properly.
2. Terms link opens modal, EN/ES toggle works, and register submit stays blocked until modal acceptance.
3. Messages project selector cards render equal size and switch state correctly.
4. Create Project pickers open; selecting predefined options works; selecting Other allows custom input.
5. Duplicate email / invalid credentials show friendly UI errors without raw debug payload bar.
