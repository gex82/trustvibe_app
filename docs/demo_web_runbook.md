# Demo-Web Runbook

Last updated: 2026-02-21

## Purpose

`apps/demo-web` provides a single-browser demo runtime with:

- phone-mimic customer/contractor UX
- `/admin` route in the same app
- backend-first Firebase callable integration
- automatic fallback to deterministic mock data

## Local Startup

1. `npm install`
2. `npm run bootstrap:demo`
3. `npm run dev:demo-web`
4. Open `http://localhost:5174/role`

## Key URLs

- Role entry: `http://localhost:5174/role`
- Login: `http://localhost:5174/login`
- Admin dashboard: `http://localhost:5174/admin`

## Navigation Contract

- Customer tabs: `/home`, `/search`, `/projects`, `/messages`
- Contractor tabs: `/home`, `/browse`, `/jobs`, `/earnings`, `/messages`
- Legacy automation alias: `tab-profile` remains available during transition

## Image Assets

- Demo-web relies on reference assets under `apps/demo-web/public/images`.
- Required set: 4 contractor avatars + 8 job photos (12 PNG total).
- Verify quickly with: `npm run test:e2e:demo-web -- assets-smoke.spec.ts`

## Environment Variables

- `VITE_USE_EMULATORS=true|false` (default: `true`)
- `VITE_EMULATOR_HOST=<host>` (default: browser hostname or `127.0.0.1`)
- `VITE_DEMO_DATA_FALLBACK=true|false` (default: `true`)

## Automated Pass

- Run localization gates only:
  - `npm run check:demo-web:localization`
- Run demo-web unit/integration tests (Vitest):
  - `npm run test:unit:demo-web`
- Run Playwright suite only:
  - `npm run test:e2e:demo-web`
- Run full bootstrap + server + suite:
  - `npm run pass:demo-web`

Artifacts are written under `artifacts/demo-pass/<timestamp>/`.

## Localization Troubleshooting

1. If ES mode shows English text in UI, run `npm run check:demo-web:localization`.
2. If the static gate fails, remove hardcoded English from `apps/demo-web/src/**` and use `t(...)` keys.
3. If the data gate fails, add missing `*En`/`*Es` fields in `apps/demo-web/src/data/*`.
4. Re-run unit + e2e localization suites before demo handoff.
5. Contract reference: `docs/demo_web_localization_contract.md`.

## Notes

- Existing `apps/mobile` and `apps/admin` remain canonical MVP codepaths.
- Demo-web is presentation-focused and shares backend callable contracts.
