# Contractor Demo Script (Click-by-Click, iPad Recording)

Last updated: 2026-02-12

## Preflight (before opening camera)

1. In terminal window A run: `npm run bootstrap:demo`
2. In terminal window B run: `npm run dev -w @trustvibe/mobile`
3. On iPad, connect to the same Wi-Fi as dev machine.
4. Open Expo Go and launch TrustVibe.

## Demo account

- Email: `juan.services@trustvibe.test`
- Password: `DemoContractor!123`
- Role: Contractor

## Tap-by-tap flow

1. On `TrustVibe` role screen, tap `Continue as Contractor`.
2. On login screen, tap email field and enter `juan.services@trustvibe.test`.
3. Tap password field and enter `DemoContractor!123`.
4. Tap `Sign in`.
5. On `Home`, tap language chip `ES`.
6. Confirm key labels change to Spanish.
7. Tap language chip `EN`.
8. Tap bottom tab `Projects`.
9. Tap `Bathroom Remodel`.
10. Show milestone ledger and current contractor action state.
11. Open `Messages`.
12. Enter short update text and send it.
13. Tap bottom tab `Profile`.
14. Tap `Edit Profile`.
15. Upload avatar image and save.
16. Go back and tap `Documents`.
17. Tap `Upload Document`.
18. Select a license/insurance mock document and confirm upload.
19. Return to `Profile`.
20. Tap `History`.
21. Return and open `Earnings` (if present for this seeded state).
22. Return to `Profile`.
23. Tap `Log out` (red button).
24. In confirmation alert, tap `Log out`.
25. End recording on role-selection screen.

## Expected checkpoints

1. Language switch is visible and responsive.
2. Contractor profile/docs flow is functional and upload paths complete.
3. Logout from Profile returns to unauthenticated entry flow.
