# Device Lane Packet (iPad/iPhone) — 2026-02-17

## Purpose
Use this packet to close all remaining unchecked rows in `docs/manual_qa_checklist.md` after laptop/browser closure is complete.

## Preflight
1. Run `npm run bootstrap:demo`.
2. Run `npm run dev -w @trustvibe/mobile`.
3. Confirm iPad/iPhone is on same Wi-Fi.
4. Launch app in Expo Go.
5. Use demo credentials from `docs/demo_credentials.md`.

## Evidence Naming Convention
- Screenshot: `device_<row_key>.png`
- Screen recording segment: `device_<row_key>.mp4`
- If fail: add short clip + exact error text.

## Execution Order
1. Customer flow checks
2. Contractor flow checks
3. Error-path checks
4. Config/feature-flag checks

## Row-by-Row Closure Steps

### 1. `mobile_lan_launch`
Checklist row: Mobile app launches on physical iPhone with LAN emulator host.
- Open app on iPhone.
- Confirm login screen loads and no network error appears.
Expected: app is usable and connected to emulator-backed services.
Evidence: `device_mobile_lan_launch.png`

### 2. `feature_disabled_ui_gating`
Checklist row: When a feature is disabled, UI hides/disables action and avoids failed call attempts.
- Open admin web and disable one demo feature flag (for example recommendations).
- Login on device and navigate to affected screen.
- Attempt action.
Expected: UI shows disabled/hidden state, no crash, no raw precondition error.
Evidence: `device_feature_disabled_ui_gating.png`

### 3. `completion_request_proof_photo`
Checklist row: Completion request supports proof photo upload to storage emulator.
- Login as contractor.
- Open funded project -> completion flow.
- Upload proof photo and submit completion request.
Expected: upload succeeds and completion request confirms.
Evidence: `device_completion_request_proof_photo.png`

### 4. `completion_proof_url_saved`
Checklist row: Completion proof upload stores URL and submission succeeds.
- Continue from previous step.
- Verify confirmation UI + related record references uploaded file.
Expected: no placeholder URL; operation succeeds.
Evidence: `device_completion_proof_url_saved.png`

### 5. `resolution_file_upload`
Checklist row: Resolution file upload stores URL and callable succeeds.
- Open issue/dispute resolution path.
- Attach a document and submit resolution.
Expected: submission succeeds with uploaded file reference.
Evidence: `device_resolution_file_upload.png`

### 6. `offline_network_guidance`
Checklist row: Emulator offline shows user-safe network guidance.
- Temporarily stop emulators.
- Attempt login or data fetch on device.
Expected: friendly network guidance message (no stack trace/raw payload).
Evidence: `device_offline_network_guidance.png`

### 7. `disabled_actions_no_precondition_error`
Checklist row: Disabled-feature actions do not surface precondition exceptions to users.
- Keep selected feature disabled.
- Attempt blocked action from device.
Expected: clear disabled reason; no backend-precondition exception shown to user.
Evidence: `device_disabled_actions_no_precondition_error.png`

### 8. `messages_selector_uniform_cards`
Checklist row: Messages project selector cards keep uniform dimensions across labels.
- Open Messages screen.
- Compare project selector cards with short/long titles.
Expected: same card height/width with consistent alignment.
Evidence: `device_messages_selector_uniform_cards.png`

### 9. `create_project_picker_fields`
Checklist row: Create Project Category/Municipality/Timeline fields use picker menus.
- Open Create Project.
- Tap each field: Category, Municipality, Timeline.
Expected: picker UI appears (not free-text-only behavior).
Evidence: `device_create_project_picker_fields.png`

### 10. `create_project_other_custom`
Checklist row: Picker "Other (custom)" flow works and submits successfully.
- In Create Project pick `Other` in Category and/or Timeline.
- Enter custom value.
- Submit project.
Expected: submit succeeds and custom value is used.
Evidence: `device_create_project_other_custom.png`

### 11. `auth_handled_error_no_debug_payload`
Checklist row: Handled auth failures show friendly messages without raw debug payload bars.
- Trigger known auth error (wrong password / duplicate register).
Expected: user-friendly message only; no raw `[TrustVibe]` payload in UI.
Evidence: `device_auth_handled_error_no_debug_payload.png`

### 12. `deposit_amount_rationale_confirm`
Checklist row: Estimate deposit creation shows amount/rationale confirmation before execution.
- Customer flow: Project Detail -> Developer actions -> Create estimate deposit.
Expected: confirmation dialog shows amount + rationale before confirming.
Evidence: `device_deposit_amount_rationale_confirm.png`

### 13. `booking_disabled_until_captured`
Checklist row: Booking request action is disabled until deposit is captured, with inline reason shown.
- In same project state, open booking action before capturing deposit.
Expected: CTA disabled with explicit reason.
Evidence: `device_booking_disabled_until_captured.png`

### 14. `messages_keyboard_visibility`
Checklist row: Messages input and send controls remain visible above iPad keyboard.
- Open Messages on iPad.
- Tap input and open keyboard.
Expected: input + send remain visible and tappable; no hidden composer.
Evidence: `device_messages_keyboard_visibility.png`

### 15. `recommendation_disabled_reason`
Checklist row: Recommendation rows with no destination show disabled reason instead of silent no-op.
- Open recommendations list with at least one item lacking destination.
- Tap that row.
Expected: explicit disabled reason displayed.
Evidence: `device_recommendation_disabled_reason.png`

## Defect Severity Rules
- P0: blocks scripted demo continuation.
- P1: major user confusion or high-risk friction.
- P2: cosmetic/minor issue safe for post-demo.

## After Execution
1. Fill `docs/device_lane_results_2026-02-17.md`.
2. Update `docs/manual_qa_checklist.md` rows to `[x]` only for verified PASS rows.
3. Share FAIL rows with evidence for targeted fixes.
