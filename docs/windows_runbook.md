# Windows Runbook

Last updated: 2026-02-11 (productionization pass)

## 1. Prerequisites

Install:

1. Node.js LTS (20+ recommended)
2. Firebase CLI (`npm i -g firebase-tools`)
3. Expo CLI (`npm i -g expo-cli`)
4. EAS CLI (`npm i -g eas-cli`)
5. Git + PowerShell

Accounts:

- Firebase project(s): dev/staging/prod
- Apple Developer account (for TestFlight/App Store)

## 2. Install Dependencies

From repo root:

```powershell
npm install
```

## 3. Environment Variables

Functions/runtime (PowerShell env or `.env` loaded by your process manager):

```env
GCLOUD_PROJECT=trustvibe-dev
PAYMENT_PROVIDER=mock # mock | stripe | ath_movil
STRIPE_SIMULATE=true  # true for local prototyping
STRIPE_SECRET_KEY=sk_test_xxx # required when PAYMENT_PROVIDER=stripe and simulation=false
```

Notes:

- Local prototype default should remain `PAYMENT_PROVIDER=mock` or `STRIPE_SIMULATE=true`.
- Staging/prod should use Stripe-first configuration.

Mobile (`apps/mobile/.env`):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=trustvibe-dev
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_USE_EMULATORS=true
EXPO_PUBLIC_EMULATOR_HOST=192.168.1.10
```

Important for physical iPhone:

- `EXPO_PUBLIC_EMULATOR_HOST` must be your Windows LAN IP, not `127.0.0.1`.

Admin (`apps/admin/.env.local`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=trustvibe-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_EMULATOR_HOST=127.0.0.1
```

## 4. Run Firebase Emulators

```powershell
npm run emulators
```

Services:

- Auth: `localhost:9099`
- Firestore: `localhost:8080`
- Functions: `localhost:5001`
- Storage: `localhost:9199`
- Emulator UI: `http://localhost:4000`

## 5. Seed Demo Data

In another terminal:

```powershell
$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'
$env:GCLOUD_PROJECT='trustvibe-dev'
npm run seed
```

## 6. Run Mobile App (Physical iPhone)

```powershell
npm run dev -w @trustvibe/mobile
```

- This default runs Expo in `--offline` mode for demo reliability.
- Scan QR with Expo Go / dev client.
- Ensure iPhone is on same LAN as Windows host.

If you want online dependency checks instead:

```powershell
npm run dev:online -w @trustvibe/mobile
```

## 7. Run Admin Console

```powershell
npm run dev -w @trustvibe/admin
```

Open `http://localhost:3000`.

## 8. Run Tests

Unit tests:

```powershell
npm run test:unit
```

Integration tests (with emulator running):

```powershell
$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'
$env:FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099'
$env:GCLOUD_PROJECT='trustvibe-dev'
npm run test:integration
```

Run deterministic demo flows:

```powershell
$env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'
$env:GCLOUD_PROJECT='trustvibe-dev'
npm run scenario:happy
npm run scenario:joint
npm run scenario:external
npm run scenario:deposit-no-show
npm run scenario:milestone-partial
npm run scenario:verified-credential
npm run scenario:high-ticket
```

Productionization demo:

1. Sign in to admin console.
2. Open Config and enable desired flags (`estimateDepositsEnabled`, `credentialVerificationEnabled`, `reliabilityScoringEnabled`, `subscriptionsEnabled`, `highTicketConciergeEnabled`).
3. Seed deposit policies / fee tiers / subscription plans in Config JSON editors.
4. Use mobile project detail actions to demo deposits, booking request creation, credential submission, reliability view, and concierge intake.
5. Use admin pages (`/deposits`, `/reliability`, `/subscriptions`, `/concierge`) for operations views.

## 9. EAS Build + TestFlight

From `apps/mobile`:

```powershell
eas login
eas build -p ios --profile preview
eas submit -p ios --profile production
```

`eas.json` profiles:

- `development`: internal dev client
- `preview`: internal distribution
- `production`: App Store/TestFlight path

## 10. Disclaimer

Live payment operations require compliance/legal readiness. Keep local demos in mock or Stripe simulation mode.
