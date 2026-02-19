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
8. Tap bottom tab `Search`.
9. Tap one municipality filter chip (example: `San Juan`) and confirm list updates.
10. Tap `Clear filters`.
11. Tap bottom tab `Projects`.
12. Open a project that is `Open for quotes` (for seeded demo data, use `Interior Painting Refresh` when visible).
13. Confirm project detail shows imported before/after gallery assets.
14. Show the progress stepper and contextual hint text under it.
15. Tap `Submit quote`.
16. Enter quote price, timeline days, and scope notes.
17. Tap `Submit quote`.
18. Confirm you return to project detail and can see submitted quote context.
19. Open `Messages`.
20. Enter short update text and send it.
21. Confirm message sender labels are human names/friendly labels (not raw IDs).
22. Tap bottom tab `Profile`.
23. Tap `Edit Profile`.
24. Upload avatar image and save.
25. Go back and tap `Documents`.
26. Tap `Upload Document`.
27. Select a license/insurance mock document and confirm upload.
28. Return to `Profile`.
29. Tap `History`.
30. Return and open `Earnings` (if present for this seeded state).
31. Return to `Home`.
32. In the Home top row, tap the small `Log out` action (next to language switch).
33. In confirmation alert, tap `Log out`.
34. End recording on role-selection screen.

## Expected checkpoints

1. Language switch is visible and responsive.
2. Contractor can submit quote directly from an open project.
3. Project detail shows stepper + contextual hint for contractor state.
4. Search filters demonstrate municipality/rating filtering and clear action.
5. Message sender labels are readable (no raw UID-only labels in primary flow).
6. Contractor profile/docs flow is functional and upload paths complete.
7. Quick logout from Home returns to unauthenticated entry flow.
