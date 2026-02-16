# Admin Smoke Checklist (Deterministic Demo)

Last updated: 2026-02-13

## Preflight

1. Run `npm run bootstrap:demo`.
2. Confirm admin app is available at `http://localhost:3000`.
3. Sign in as `admin@trustvibe.test` with password `DemoAdmin!123`.

## Automated smoke

1. Run:
   `powershell -ExecutionPolicy Bypass -File .\scripts\smoke_admin_config.ps1`
2. Expected:
   - Script prints `Admin config smoke test passed.`
   - No assertion failures.

## Manual click-path smoke

1. Navigate to `/config`.
2. Confirm these toggles are visible:
   - `recommendationsEnabled`
   - `growthEnabled`
   - `milestonePaymentsEnabled`
3. Toggle each one, click save, refresh page, and verify values persisted.
4. Navigate to `/cases`.
5. Confirm at least one seeded case is visible and status is readable.
6. Navigate to `/users`.
7. Confirm seeded contractor and customer users are visible.
8. Confirm `contractor-001` / Juan profile shows verification-ready posture.

## Pass criteria

1. Automated script passes.
2. Config values persist after refresh.
3. Cases and users pages render without runtime errors.
