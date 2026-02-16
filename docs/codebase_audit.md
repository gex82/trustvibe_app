# TrustVibe Codebase Audit

## 1. Repository Structure (Top Levels)

```text
trustvibe/
├── .firebase/             # Firebase emulator data/cache
├── .github/               # GitHub Actions/workflows
├── apps/
│   ├── admin/             # Web dashboard (Next.js)
│   └── mobile/            # Mobile app (Expo/React Native)
├── artifacts/             # Generated artifacts
├── data/                  # Data files
├── docs/                  # Documentation
├── e2e/                   # End-to-End tests
├── functions/             # Firebase Cloud Functions
├── packages/
│   └── shared/            # Shared logic/types (Zod schemas)
├── scripts/               # Utility scripts (PowerShell/TS)
├── firebase.json          # Firebase configuration
├── package.json           # Root configuration
└── playwright.config.ts   # E2E test config
```

## 2. Package Catalog

| Workspace | Type | Responsibility | Build Command | Test Command | Key Deps |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **@trustvibe/mobile** | App | Mobile Application (iOS/Android) | `expo export` | *(None defined)* | `expo`, `react-native`, `firebase`, `react-hook-form`, `zod` |
| **@trustvibe/admin** | App | Admin/Web Dashboard | `next build` | *(None defined)* | `next`, `react (v18)`, `firebase` |
| **@trustvibe/functions** | Backend | Cloud Functions / API | `tsc` | *(None defined)* | `firebase-functions`, `stripe`, `zod` |
| **@trustvibe/shared** | Lib | Shared Types & Schemas | `tsc` | *(None defined)* | `zod` |

> **Note**: Build commands are orchestrated via the root `build` script.

## 3. Global Scripts (Root)

Major global commands defined in the root `package.json`:

*   **Build**: `npm run build` - Builds all workspaces in order: shared -> functions -> mobile -> admin.
*   **Test**: `npm run test` (Jest), `test:unit` (Shared), `test:integration` (Functions), `test:e2e:web` (Playwright).
*   **Emulators**: `npm run emulators` - Starts Firebase emulators (Auth, Firestore, Functions, Storage).
*   **Scenarios**: `npm run scenario:*` - Series of scripts to seed data for specific demo scenarios (happy path, disputes, etc.).
*   **Demo**: `npm run bootstrap:demo`, `npm run pass:web:demo` - PowerShell automation for demos.

## 4. Tech Debt Backlog

### High Priority
1.  **React Version Mismatch** (Effort: Medium, Risk: High)
    *   **Issue**: `apps/admin` uses React `18.2.0`, while `apps/mobile` and root use `19.1.0`.
    *   **Impact**: Potential shared component incompatibility and "multiple instances of React" errors if shared packages assume a specific version.
    *   **Recommendation**: Align `apps/admin` to React 19 if Next.js support allows, or downgrade others if 19 is too unstable.

2.  **Missing Linting & Formatting** (Effort: Low, Risk: Low)
    *   **Issue**: All workspaces (`admin`, `mobile`, `functions`, `shared`) have placeholder lint scripts (`echo ... placeholder`).
    *   **Impact**: Inconsistent code style and potential bugs.
    *   **Recommendation**: Install `eslint` and `prettier` at root with global config, or per-package.

3.  **Fragile Build Orchestration** (Effort: Low, Risk: Medium)
    *   **Issue**: Root `build` script manually chains `npm run build -w ...`.
    *   **Impact**: Slow serial builds; hard to maintain if dependency graph changes.
    *   **Recommendation**: Use a tool like TurboRepo or Nx to handle topological builds and caching.

### Missing Tests
*   **Unit Tests**: No unit test scripts defined within `apps/mobile` or `apps/admin`.
*   **Linting**: No actual lint rules active.

## 5. Next Steps
*   [ ] Resolve React version mismatch.
*   [ ] Configure ESLint/Prettier.
*   [ ] Add unit test scripts to workspaces.
