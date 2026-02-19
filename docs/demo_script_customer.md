# Customer Demo Script (Click-by-Click, iPad Recording)

Last updated: 2026-02-19

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
5. On `Home`, point out greeting + role summary card + financial card.
6. Tap language chip `ES` (top-right area on Home).
7. Confirm labels change to Spanish.
8. Tap language chip `EN` to continue in English.
9. In `Recent Activity`, tap the first activity row and confirm it opens project detail.
10. Tap back to return to `Home`.
11. Tap bottom tab `Search`.
12. Tap one category filter chip (example: `Plumbing`) and confirm list refreshes.
13. Tap `Clear filters`.
14. In contractor list, tap one recommended contractor card.
15. On `Verified Portfolio`, confirm selected contractor context and show the imported before/after job gallery set.
16. Tap top-left back arrow.
17. Tap bottom tab `Projects`.
18. Tap `Bathroom Remodel`.
19. Show project photo gallery (before/after) on top of `ProjectDetail`.
20. Show the progress stepper and contextual hint text under it.
21. Tap primary CTA `Select contractor` to open quote comparison.
22. In `Compare quotes`, pick one quote card and tap `Select this contractor`.
23. On `Agreement snapshot`, highlight contractor, price, scope, policy, and fee sections.
24. Tap `Accept agreement`.
25. Confirm the flow advances to escrow funding step.
26. On `Fund escrow`, show the trust callout bullets, then tap `Fund escrow`.
27. Confirm trust-focused success message appears before returning to project detail.
28. Navigate back to project detail and open `Developer actions`.
29. Tap `Create estimate deposit`, review amount/rationale dialog, then confirm.
30. Show inline `Deposit Details` card and status update.
31. If `Review and Release` is visible, tap it to execute release.
32. Confirm app routes to `Submit review`.
33. Select star rating, choose one or more review tags, enter short feedback, and tap `Submit review`.
34. (Optional) Deselect all tags once to show validation, then reselect tags and submit.
35. Confirm inline success message then return to `ProjectDetail`.
36. Tap bottom tab `Profile`.
37. Tap `History`.
38. Tap `Recommendations`.
39. Tap one recommendation row and confirm it opens a profile or project detail route.
40. Return to `Profile`, tap `Documents`, then tap `Upload Document`.
41. Pick a demo file and confirm upload.
42. Navigate back to `Home`.
43. In the Home top row, tap the small `Log out` action (next to language switch).
44. In confirmation alert, tap `Log out`.
45. End recording on role-selection screen.

## Expected checkpoints

1. Language switch is visible on Home and works immediately.
2. No hardcoded English remains on Home/Profile/role entry while in Spanish mode.
3. Home Recent Activity rows are tappable and route correctly.
4. Search and Recommendations rows provide visible feedback and deterministic navigation.
5. Contractor selection is deliberate (quote compare), not auto-selected.
6. Agreement acceptance is transparent with visible policy and fee details.
7. Project detail shows a stepper + contextual guidance for current state.
8. Fund escrow shows trust callout and trust-focused success copy.
9. Search filters demonstrate category/rating filtering and clear action.
10. Deposit flow shows amount/rationale before create and details after create.
11. Review submission includes tag selection and validation.
12. Release action routes to review submission and returns to project detail after submit.
13. Quick logout from Home returns to unauthenticated entry flow.
