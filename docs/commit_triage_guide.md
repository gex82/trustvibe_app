# Commit Triage Guide (Beginner-Friendly)

Red X marks on commits usually mean CI checks failed on that commit snapshot.

## What CI actually runs in this repo

Source of truth: `.github/workflows/ci.yml` job `validate`.

Required steps:
1. `Lint`
2. `Typecheck`
3. `Build workspaces`
4. `Unit tests`
5. `Integration tests (Firestore emulator)`

If any step fails, GitHub shows a red X.

## Fast local preflight before push

Run these from repo root:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:unit
```

Optional demo lane:

```bash
npm run pass:demo-web
```

## Safe merge checklist

Only merge when:
1. Latest commit in your PR is green.
2. Scope is reviewed and understandable.
3. Commit history is clean enough to audit (squash fixups if noisy).

Do not merge red checks unless it is an intentional emergency decision.

## Red X triage flow

1. Open the failing CI run.
2. Find the first failing step in `validate`.
3. Reproduce locally with the matching command.
4. Fix and push.
5. Wait for CI to turn green.

## Local emulator edge case (common on Windows)

Sometimes tests fail because a stale Firestore emulator still owns port `8080`.

Check listener:

```powershell
netstat -ano | findstr :8080
```

Kill stale PID if needed:

```powershell
taskkill /PID <PID> /F
```

Then rerun the command that failed.

## Branch protection (GitHub settings)

Apply on `main`:
1. Require pull request before merging.
2. Require status checks to pass before merging.
3. Select required checks from the `validate` job.
4. Restrict direct pushes to `main` (allow admins only if needed).

This prevents accidental red-check merges moving forward.
