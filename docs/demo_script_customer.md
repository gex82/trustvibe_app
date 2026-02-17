# Customer Demo Script (Click-by-Click, iPad Recording)

Last updated: 2026-02-17

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
9. In `Recent Activity`, tap the first activity row and confirm it opens project detail.
10. Tap back to return to `Home`.
11. Tap bottom tab `Search`.
12. In contractor list, tap one recommended contractor card.
13. On `Verified Portfolio`, confirm selected contractor context and scroll through credentials/projects.
14. Tap top-left back arrow.
15. Tap bottom tab `Projects`.
16. Tap `Bathroom Remodel`.
17. Tap primary CTA `Select contractor` to open quote comparison.
18. In `Compare quotes`, pick one quote card and tap `Select this contractor`.
19. On `Agreement snapshot`, highlight contractor, price, scope, policy, and fee sections.
20. Tap `Accept agreement`.
21. Confirm the flow advances to escrow funding step.
22. Navigate back to project detail and open `Developer actions`.
23. Tap `Create estimate deposit`, review amount/rationale dialog, then confirm.
24. Show inline `Deposit Details` card and status update.
25. Tap bottom tab `Profile`.
26. Tap `History`.
27. Tap `Recommendations`.
28. Tap one recommendation row and confirm it opens a profile or project detail route.
29. Return to `Profile`, tap `Documents`, then tap `Upload Document`.
30. Pick a demo file and confirm upload.
31. Navigate back to `Home`.
32. In the Home top row, tap the small `Log out` action (next to language switch).
33. In confirmation alert, tap `Log out`.
34. End recording on role-selection screen.

## Expected checkpoints

1. Language switch is visible on Home and works immediately.
2. No hardcoded English remains on Home/Profile/role entry while in Spanish mode.
3. Home Recent Activity rows are tappable and route correctly.
4. Search and Recommendations rows provide visible feedback and deterministic navigation.
5. Contractor selection is deliberate (quote compare), not auto-selected.
6. Agreement acceptance is transparent with visible policy and fee details.
7. Deposit flow shows amount/rationale before create and details after create.
8. Quick logout from Home returns to unauthenticated entry flow.
