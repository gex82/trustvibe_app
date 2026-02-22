# Device Lane Results Template — 2026-02-17

Use this to record execution results from `docs/device_lane_packet_2026-02-17.md`.

## Summary
- Executor:
- Device(s):
- Date/time:
- Build/commit:
- Overall result: PASS / FAIL / PARTIAL

## Results Table

| Row key | Checklist row | Status (PASS/FAIL/N/A) | Evidence file(s) | Severity (if FAIL) | Notes |
| --- | --- | --- | --- | --- | --- |
| `mobile_lan_launch` | Mobile app launches on physical iPhone with LAN emulator host. |  |  |  |  |
| `feature_disabled_ui_gating` | Feature disabled -> UI hides/disables action without failed call. |  |  |  |  |
| `completion_request_proof_photo` | Completion request supports proof photo upload to storage emulator. |  |  |  |  |
| `completion_proof_url_saved` | Completion proof upload stores URL and submission succeeds. |  |  |  |  |
| `resolution_file_upload` | Resolution file upload stores URL and callable succeeds. |  |  |  |  |
| `offline_network_guidance` | Emulator offline shows user-safe network guidance. |  |  |  |  |
| `disabled_actions_no_precondition_error` | Disabled-feature actions do not surface precondition exceptions. |  |  |  |  |
| `messages_selector_uniform_cards` | Messages project selector cards keep uniform dimensions. |  |  |  |  |
| `create_project_picker_fields` | Create Project fields use picker menus. |  |  |  |  |
| `create_project_other_custom` | Picker Other(custom) flow works and submits. |  |  |  |  |
| `auth_handled_error_no_debug_payload` | Auth handled errors show friendly message without raw payload bars. |  |  |  |  |
| `deposit_amount_rationale_confirm` | Estimate deposit create shows amount/rationale before execution. |  |  |  |  |
| `booking_disabled_until_captured` | Booking action disabled until deposit captured, with reason. |  |  |  |  |
| `messages_keyboard_visibility` | Messages input/send remain visible above iPad keyboard. |  |  |  |  |
| `recommendation_disabled_reason` | No-destination recommendation shows disabled reason (not silent no-op). |  |  |  |  |

## Defect List (if any)

| ID | Severity | Area | Repro steps | Actual | Expected | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

## Signoff
- Device lane status: PASS / FAIL
- Open P0 count:
- Open P1 count:
- Ready to record demos: YES / NO
