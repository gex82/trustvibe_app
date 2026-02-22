# Demo Credentials (Deterministic)

Last updated: 2026-02-13

## Precondition

Run bootstrap before demos:

```powershell
npm run bootstrap:demo
```

`bootstrap:demo` seeds Firestore and creates these Auth emulator users (when `FIREBASE_AUTH_EMULATOR_HOST` is set).

## Persona Accounts

| Persona | Role | UID | Email | Password |
| --- | --- | --- | --- | --- |
| Maria Rodriguez | customer | `customer-001` | `maria.rodriguez@trustvibe.test` | `DemoCustomer!123` |
| Juan's Services | contractor | `contractor-001` | `juan.services@trustvibe.test` | `DemoContractor!123` |
| Admin One | admin | `admin-001` | `admin@trustvibe.test` | `DemoAdmin!123` |

## Deterministic Demo Record Mapping

- Featured customer persona: `users/customer-001`
- Featured contractor persona: `users/contractor-001`
- Featured project: `projects/project-001` (`Primary Bathroom Renovation`)
- Demo profile marker: `config/demoProfile`

## Demo Config Snapshot (`config/demoProfile`)

- `name`: `demo_critical_v2`
- `personas.customer`: `customer-001`
- `personas.contractor`: `contractor-001`
- `personas.admin`: `admin-001`
- `projectId`: `project-001`

## Feature Flag Snapshot (`config/featureFlags`)

- `stripeConnectEnabled=false`
- `estimateDepositsEnabled=true`
- `milestonePaymentsEnabled=true`
- `changeOrdersEnabled=true`
- `credentialVerificationEnabled=true`
- `schedulingEnabled=true`
- `reliabilityScoringEnabled=true`
- `subscriptionsEnabled=true`
- `highTicketConciergeEnabled=true`
- `recommendationsEnabled=true`
- `growthEnabled=true`

## Notes

- These credentials are emulator-only and for demos/tests only.
- Do not reuse these passwords in staging or production.
