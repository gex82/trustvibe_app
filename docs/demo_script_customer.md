# Customer Demo Script (Click-by-Click, iPad Recording)

Last updated: 2026-02-12

## Preflight (before opening camera)

1. In terminal window A run: `npm run bootstrap:demo`
2. In terminal window B run: `npm run dev -w @trustvibe/mobile`
3. On iPad, connect to the same Wi-Fi as dev machine.
4. Open Expo Go and launch TrustVibe.

## Demo account

- Email: `maria.rodriguez@trustvibe.test`
- Password: `DemoCustomer!123`
- Role: Customer

## Tap-by-tap flow

1. On `TrustVibe` role screen, tap `Continue as Customer`.
2. On login screen, tap email field and enter `maria.rodriguez@trustvibe.test`.
3. Tap password field and enter `DemoCustomer!123`.
4. Tap `Sign in`.
5. On `Home`, point out greeting + financial card.
6. Tap language chip `ES` (top-right area on Home).
7. Confirm labels change to Spanish.
8. Tap language chip `EN` to continue in English.
9. Tap bottom tab `Search`.
10. In contractor list, tap `Juan's Services`.
11. On `Verified Portfolio`, scroll through credentials and featured projects.
12. Tap top-left back arrow.
13. Tap bottom tab `Projects`.
14. Tap `Bathroom Remodel`.
15. Show milestone/ledger state and the primary CTA.
16. Tap bottom tab `Profile`.
17. Tap `Documents`.
18. Tap `Upload Document`.
19. Pick a demo file and confirm upload.
20. Navigate back to `Profile`.
21. Tap `Log out` (red button).
22. In confirmation alert, tap `Log out`.
23. End recording on role-selection screen.

## Expected checkpoints

1. Language switch is visible on Home and works immediately.
2. No hardcoded English remains on Home/Profile/role entry while in Spanish mode.
3. Logout from Profile returns to unauthenticated entry flow.
