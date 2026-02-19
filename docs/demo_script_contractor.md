# Contractor Demo Script (Click-by-Click, iPad Recording)

Last updated: 2026-02-19

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
9. Open a project that is `Open for quotes` (for seeded demo data, use `Interior Painting Refresh` when visible).
10. Tap `Submit quote`.
11. Enter quote price, timeline days, and scope notes.
12. Tap `Submit quote`.
13. Confirm you return to project detail and can see submitted quote context.
14. Open `Messages`.
15. Enter short update text and send it.
16. Confirm message sender labels are human names/friendly labels (not raw IDs).
17. Tap bottom tab `Profile`.
18. Tap `Edit Profile`.
19. Upload avatar image and save.
20. Go back and tap `Documents`.
21. Tap `Upload Document`.
22. Select a license/insurance mock document and confirm upload.
23. Return to `Profile`.
24. Tap `History`.
25. Return and open `Earnings` (if present for this seeded state).
26. Return to `Home`.
27. In the Home top row, tap the small `Log out` action (next to language switch).
28. In confirmation alert, tap `Log out`.
29. End recording on role-selection screen.

## Expected checkpoints

1. Language switch is visible and responsive.
2. Contractor can submit quote directly from an open project.
3. Message sender labels are readable (no raw UID-only labels in primary flow).
4. Contractor profile/docs flow is functional and upload paths complete.
5. Quick logout from Home returns to unauthenticated entry flow.
