# TrustVibe Demo-Web

Single-runtime browser demo app for TrustVibe UX parity.

## Local Run

From repo root:

```bash
npm run bootstrap:demo
npm run dev:demo-web
```

Open:

- `http://localhost:5174/role`
- `http://localhost:5174/admin`

## Demo Accounts

- Customer: `maria.rodriguez@trustvibe.test` / `DemoCustomer!123`
- Contractor: `juan.services@trustvibe.test` / `DemoContractor!123`
- Admin: `admin@trustvibe.test` / `DemoAdmin!123`

## Mode Controls

The bottom-right dev switcher includes:

- role switch shortcuts
- `Live` / `Mock` data-mode toggle
- auto-fallback banner when backend is unavailable

## Validation

From repo root:

```bash
npm run build:demo-web
npm run test:e2e:demo-web
```

## Cloudflare Pages

Manual deploy from local machine:

```bash
npm run deploy:demo-web:pages
```

The deploy script:

- verifies `wrangler` auth
- builds `@trustvibe/demo-web`
- deploys `apps/demo-web/dist` to `trustvibe-demo-only`
- sets build-time defaults:
  - `VITE_USE_EMULATORS=false`
  - `VITE_DEMO_DATA_FALLBACK=true`

For Git-connected Pages builds, use repo-root build settings:

- Build command: `npm ci && npm run build:demo-web`
- Build output directory: `apps/demo-web/dist`
