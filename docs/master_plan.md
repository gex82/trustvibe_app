# TrustVibe Master Plan — Final Demo Closure (Dual-Lane)

Last updated: 2026-02-19
Purpose: Single source of truth for finishing demo signoff with both physical-device and laptop-browser validation.

---

## Current State (Repo Truth)

### Implemented in code

| Area | Status | Notes |
| --- | --- | --- |
| Batch 1 UX | Implemented | Password toggle, T&C modal acceptance, picker UX, auth logging cleanup |
| Batch 2 UX | Implemented | Guided project workflow, quote clarity, agreement transparency, deposit preview/confirm |
| Batch 3 UX | Implemented | Keyboard-aware messages, tappable activity/recommendation rows, profile fallback clarity |
| Batch 4 UX | Implemented | Contractor quote submit UI, message sender names, release->review handoff, role-aware home guidance |
| Batch 5 UX | In progress | Demo polish stream: project stepper, trust callouts, star ratings, search filters, microcopy pass |
| Backend callable surface | Implemented | Includes agreement/demo auto-advance and deposit preview path |
| Shared contracts/i18n | Implemented | Additive fields and EN/ES coverage for batch flows |
| Automated tests | Passing baseline | Unit + integration are green in local emulator lane |

### Still required to declare "demo complete"

| Area | Status | Required action |
| --- | --- | --- |
| Laptop browser lane | Passed on 2026-02-17 | Maintain as baseline; rerun only after P0/P1 fixes |
| iPad/iPhone lane | Pending | Execute customer + contractor scripts and checklist rows on device |
| Final signoff package | Pending | Publish dated report with evidence and blocker status |

---

## Demo Closure Policy

1. Scope freeze: only P0/P1 demo defects can be fixed during closure.
2. Gate rule: both lanes must pass (laptop browser + iPad/iPhone).
3. API policy: no breaking API/type changes during closure; only additive compatibility updates.
4. Evidence policy: every pass/fail claim must reference command output, screenshots, or checklist rows.

---

## Dual-Lane Signoff Model

### Lane A — Laptop Browser (Automation + Manual Spot-Check)

Mandatory:
1. `npm run pass:web:demo`
2. Validate generated artifacts:
  - `artifacts/demo-pass/<timestamp>/...`
  - `docs/web_manual_pass_report_YYYY-MM-DD.md`
3. Manual browser spot-check in both Chrome and Edge:
  - customer login/logout path
  - contractor login/logout path
  - Home recent activity navigation
  - Search + Recommendations navigation
  - agreement/deposit transparency checkpoints
  - messages input/send usability

Exit criteria:
- No FAIL entries in web automation report.
- Manual spot-check rows pass in Chrome and Edge.
- Any N/A entries are explicitly mapped to device-only checks.

### Lane B — Physical Device (iPad/iPhone)

Mandatory:
1. Execute `docs/demo_script_customer.md` exactly.
2. Execute `docs/demo_script_contractor.md` exactly.
3. Complete `docs/manual_qa_checklist.md` including Batch 1/2/3 rows.
4. Classify defects:
  - P0: demo-blocking
  - P1: high-friction demo risk
  - P2: post-demo backlog

Exit criteria:
- Zero open P0/P1.
- Both scripts complete end-to-end without improvisation.

---

## Execution Sequence

### Phase 0 — Reconciliation
1. Keep this file as orchestration source of truth.
2. Keep `docs/batch1_ux_fixes.md`, `docs/batch2_ux_fixes.md`, `docs/batch3_ux_fixes.md`, `docs/batch4_demo_gaps.md` as implementation detail streams.
3. Keep `docs/batch5_demo_ux_polish.md` as implementation detail stream for demo polish + MVP hooks.
4. Keep scripts/checklist as runtime signoff gates.

### Phase 1 — Baseline Gate
1. `npm run test:unit`
2. `npm run test:integration:local`
3. `npm run build -w @trustvibe/mobile`
4. Record results in dated signoff draft.

### Phase 2 — Browser Lane
1. Run full web pass (`npm run pass:web:demo`).
2. Review web report for any FAIL/N/A.
3. Complete manual spot-check in Chrome + Edge and append results to signoff report.

### Phase 3 — Device Lane
1. Execute customer and contractor scripts on iPad/iPhone.
2. Complete manual QA checklist rows.
3. Log defects and fix only P0/P1.

### Phase 4 — Defect Burn-Down Loop
For each P0/P1:
1. Reproduce.
2. Fix.
3. Re-run targeted lane checks.
4. Re-run Phase 1 baseline commands.
5. Update scripts/checklist text if UI paths changed.

### Phase 5 — Recording + Final Signoff
1. `npm run bootstrap:demo` fresh reset.
2. Record customer demo.
3. Record contractor demo.
4. Publish `docs/demo_signoff_YYYY-MM-DD.md` with:
  - commit hash
  - baseline command results
  - browser lane results (automation + manual)
  - device lane results
  - blocker status (must be zero P0/P1)

### Phase 6 — MVP Transition (After Signoff)
Start MVP stream only after demo signoff:
1. live payment integration
2. notifications
3. production Firebase hardening
4. analytics + crash telemetry
5. legal/compliance finalization

---

## Definition of Done (Demo)

Demo is complete only when all are true:
1. Phase 1 automation gate passes on release commit.
2. Browser lane passes (automation + manual Chrome/Edge checks).
3. Device lane passes (scripts + checklist + no P0/P1).
4. Two clean recordings exist (customer + contractor).
5. Final signoff report is published and references evidence artifacts.

---

## Primary Files Used During Closure

| File | Role |
| --- | --- |
| `docs/master_plan.md` | orchestration source of truth |
| `docs/batch1_ux_fixes.md` | batch 1 implementation details |
| `docs/batch2_ux_fixes.md` | batch 2 implementation details |
| `docs/batch3_ux_fixes.md` | batch 3 implementation details |
| `docs/batch4_demo_gaps.md` | batch 4 implementation details |
| `docs/batch5_demo_ux_polish.md` | batch 5 implementation details |
| `docs/manual_qa_checklist.md` | pass/fail checklist for device and QA rows |
| `docs/demo_script_customer.md` | customer recording script |
| `docs/demo_script_contractor.md` | contractor recording script |
| `docs/web_manual_pass_report_YYYY-MM-DD.md` | browser automation output |
| `docs/demo_signoff_YYYY-MM-DD.md` | closure status and release signoff |
| `docs/device_lane_packet_YYYY-MM-DD.md` | exact iPad/iPhone execution instructions |
| `docs/device_lane_results_YYYY-MM-DD.md` | device execution evidence/results template |
