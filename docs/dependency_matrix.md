# TrustVibe Dependency Matrix

Last updated: 2026-02-15

## Runtime Framework Constraints

| Workspace | Framework | React | Notes |
| --- | --- | --- | --- |
| `apps/admin` | `next@14.2.25` | `react@18.2.0` | Next 14 peer deps require React 18. |
| `apps/mobile` | `expo@54.0.33` | `react@19.1.0` | Expo SDK 54 template stack currently targets React 19 + RN 0.81.x. |
| `functions` | Firebase Functions v2 | N/A | Server runtime, no React dependency. |
| `packages/shared` | TypeScript library | N/A | Shared contracts/schemas only. |

## React Strategy

- Keep split React majors by workspace for now:
  - Admin remains on React 18 while pinned to Next 14.
  - Mobile remains on React 19 for Expo SDK compatibility.
- Revisit alignment during a coordinated Next.js major upgrade.

## Type Package Policy

- `apps/admin` pins:
  - `@types/react@18.2.79`
  - `@types/react-dom@18.2.25`
- `apps/mobile` keeps React 19 type packages aligned with Expo SDK 54.

## Upgrade Trigger Conditions

- Move admin to React 19 only when upgrading to a Next major that officially supports it.
- Re-validate mobile compatibility before any React/RN major movement.
- Avoid cross-workspace React overrides at root to prevent invalid dedupe outcomes.
