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
