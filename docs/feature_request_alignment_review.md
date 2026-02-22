# Original Feature Request (2023) — Alignment Review

Last updated: 2026-02-18  
Purpose: Map every feature from the original "LemonAid" request against the current TrustVibe codebase. Identify what's aligned, what contradicts, and what's still missing.

---

## Executive Summary

The original 2023 feature request described **10 features** across 21 pages. The core vision — **escrow-based contractor marketplace for Puerto Rico** — is fully aligned with what was built. There are **no fundamental contradictions** between the original request and the current app direction.

However, there are **graduated gaps** — some features exist as full implementations, some as functional placeholders, and a few are still MVP-depth only. The biggest remaining gap areas are: **push/email notification delivery**, **analytics depth (charts/export)**, **contractor availability management depth**, and **advanced search filters**.

---

## Feature-by-Feature Status

### Feature 1: Language Toggle (EN/ES)

| Requested | Built | Status |
|-----------|-------|--------|
| Switch language for everything within the app | i18next with shared EN/ES keys, language toggle visible on Home, Profile, and Settings | ✅ **Fully aligned** |
| Covers toggles, FAQs, chats, etc. | All UI strings, all batch flows, error messages | ✅ **Fully aligned** |

> **Verdict**: ✅ Complete. EN/ES bilingual coverage is one of the best-implemented features.

---

### Feature 2: User Registration & Authentication

| Requested | Built | Status |
|-----------|-------|--------|
| Separate registration for customers/contractors | `RoleSelectScreen` → `RegisterScreen` with role selection | ✅ |
| Email/password auth | Firebase Auth with email/password | ✅ |
| Social media logins (Facebook, Google) | **Not implemented** — no social auth buttons | 🟡 Demo gap |
| Profile management (picture, contact details) | `EditProfileScreen` with avatar upload via Expo picker | ✅ |
| Password visibility toggle | Batch 1: eye icon toggle on password fields | ✅ |
| Terms & conditions checkbox | Batch 1: modal with T&C, EN/ES toggle, required acceptance | ✅ |
| Input validation | Real-time validation on registration fields | ✅ |

> **Verdict**: 🟡 Near-complete. Social login (Google/Apple) is the only gap.
>
> **Demo impact**: Low — email/password is standard for demos. Social login is MVP work.
>
> **MVP action**: Add Google/Apple sign-in via Firebase Auth's built-in providers. No Facebook needed (declining platform for PR market).

---

### Feature 3: Contractor Profiles

| Requested | Built | Status |
|-----------|-------|--------|
| Skills, experience, portfolio, reviews | `ContractorProfileScreen`: name, rating, projects count, photo gallery, credential rows | ✅ |
| Licensing, insurance, certifications | Credential rows (DACO license, general liability) + verification badges | ✅ |
| "Verified" badge | `Badge` component with "Verified Pro" (now localized via Batch 4) | ✅ |
| Availability/scheduling management | `AvailabilityScreen` exists but is a **static placeholder** — Save button does nothing | 🔴 Placeholder |
| Portfolio with images/videos | `PhotoGallery` component with demo project photos | ✅ |
| Contact / Hire button | "Request Quote" CTA navigates to `CreateProjectScreen` | ✅ |

> **Verdict**: 🟡 Mostly aligned. Availability/scheduling is a placeholder shell.
>
> **Contradiction**: None. The app builds availability into the contractor profile flow exactly as requested.
>
> **Demo impact**: Low — the availability screen exists in navigation and won't be a primary demo path.
>
> **MVP action**: Wire `AvailabilityScreen` to backend `createBookingRequest` and calendar data. The backend callable already supports scheduling with `startAt`/`endAt` fields.

---

### Feature 4: Project Listings & Quotes

| Requested | Built | Status |
|-----------|-------|--------|
| Customers create project listings with descriptions, images, requirements | `CreateProjectScreen` with title, description, category picker, municipality picker, timeline picker, "Other" custom input | ✅ |
| Contractors submit quotes with timeline and cost | `SubmitQuoteScreen` (Batch 4) + `submitQuote` backend callable | ✅ |
| Customers review quotes, compare, select contractor | `QuotesCompareScreen` with enriched cards (name, rating, price, timeline, scope notes, "Select" button) | ✅ |
| Project listing cards | `ProjectsListScreen` with `ProjectCard` components showing title, status, municipality | ✅ |
| Quote sort/filter | **Not implemented** — quotes displayed in a flat list with no sorting | 🟡 Nice-to-have |
| Side-by-side comparison | Quotes shown as vertical list cards, not side-by-side split view | 🟡 Acceptable UX |
| Image upload on project creation | Implemented in `CreateProjectScreen` via picker + storage upload (photo URLs sent in `createProject`) | ✅ |

> **Verdict**: 🟡 Core flow complete. Main enhancement remaining is quote sorting/filtering in compare view.
>
> **Demo impact**: Low — image upload is now present for demo realism. Quote sorting remains low-impact.
>
> **MVP action**: Optionally add simple sort buttons (by price, by rating) to `QuotesCompareScreen`.

---

### Feature 5: Escrow Payment System

| Requested | Built | Status |
|-----------|-------|--------|
| Deposit funds upon selecting contractor | `FundEscrowScreen` shows amount + "Fund Escrow" CTA after agreement acceptance | ✅ |
| Funds held until project completed + both parties agree | Full escrow state machine: `FUNDED_HELD` → `COMPLETION_REQUESTED` → approval required | ✅ |
| Release with service fee deducted | `approveRelease` callable + tiered fee evaluation from `platformFeesV2` config | ✅ |
| Escrow status display | `ProjectDetailScreen` shows escrow state labels + workflow status card | ✅ |
| Transaction history / ledger | `ledgers/{projectId}/events/{eventId}` collection exists + `HistoryScreen` | 🟡 Partial |
| Payment method selection (credit card, bank transfer) | `PaymentMethodsScreen` exists but is a **placeholder** (using mock payment provider) | 🟡 Placeholder |
| Deposit preview with fees | Batch 2: `previewEstimateDeposit` shows amount + rationale in confirmation dialog | ✅ |
| Milestone payments | Backend: `createMilestones` callable + milestone ledger display in `ProjectDetailScreen` | ✅ |

> **Verdict**: ✅ Core escrow flow is the app's strongest feature. Fully aligned with original vision.
>
> **Contradiction**: None. The architecture docs explicitly state "neutral payment-hold infrastructure" which matches the original request's "escrow account" concept perfectly.
>
> **Demo impact**: Low — mock payment provider works seamlessly for demo. Real payment methods are MVP work.
>
> **MVP action**: Wire `PaymentMethodsScreen` to Stripe Connect via the existing `StripeConnectProvider` abstraction.

---

### Feature 6: Dispute Resolution & Mediation

| Requested | Built | Status |
|-----------|-------|--------|
| In-app communication for issues | `MessagesScreen` per project + `raiseIssueHold` callable | ✅ |
| "Raise a Dispute" button | `ProjectDetailScreen`: "Raise Issue" CTA visible at `COMPLETION_REQUESTED` state | ✅ |
| Third-party mediator / support team | `ResolutionSubmissionScreen`: document upload + summary for external resolution | ✅ |
| Dispute form with description + evidence | `ResolutionSubmissionScreen`: description field + document upload via `pickDocument` | ✅ |
| Joint release (mutual agreement) | `JointReleaseScreen` + `proposeJointRelease` / `signJointRelease` callables | ✅ |
| Dispute status display | Escrow state labels show `ISSUE_RAISED_HOLD`, `JOINT_RELEASE_SIGNED` etc. | ✅ |
| Resolution outcome + feedback | State transitions update escrow state + ledger events recorded | 🟡 Partial |
| Dispute workflow visual (flowchart/timeline) | **Not implemented** — no visual process overview for users | 🟡 Nice-to-have |

> **Verdict**: ✅ Strong implementation. Core dispute flow works end-to-end.
>
> **Contradiction**: The original request envisions disputes as negotiation between parties. The architecture doc states "TrustVibe is neutral payment-hold infrastructure — it does not judge quality or arbitrate disputes." This is actually an **enhancement** over the original request, not a contradiction. The app correctly positions itself as infrastructure, not an arbiter.
>
> **Demo impact**: None — the dispute flow is demo-ready.

---

### Feature 7: Reviews & Ratings

| Requested | Built | Status |
|-----------|-------|--------|
| Customer rates contractor after project | `ReviewSubmissionScreen`: 1-5 star rating + feedback text + submit | ✅ |
| Post-completion review prompt | Batch 4: release CTA now routes to `ReviewSubmission` on success | ✅ |
| Contractor profile shows average rating + count | `ContractorProfileScreen`: rating display + projects count | ✅ |
| Contractor requests reviews | **Not implemented** — no "Request Review" feature | 🟡 Gap |
| Review moderation system | Backend: `reviews/{reviewId}` collection + admin console reviews page | ✅ |
| Review detail view (all reviews list) | **Not implemented** — no "View all reviews" screen for a contractor profile | 🟡 Gap |
| Review criteria (punctuality, communication, quality) | Tags are hardcoded `['quality', 'communication']` in review submission | 🟡 Partial |

> **Verdict**: 🟡 Core implemented but thin. The review submission exists but lacks depth.
>
> **Demo impact**: Medium — during a demo, the review submission form looks basic (numbered buttons for rating instead of stars, hardcoded tags). A dedicated reviews list on the contractor profile would improve credibility.
>
> **MVP action**: (1) Replace numbered buttons with a visual star rating component. (2) Add selectable tag chips for review criteria. (3) Add a "Reviews" section to `ContractorProfileScreen` showing individual reviews. (4) Add "Request Review" capability for contractors.

---

### Feature 8: Search & Filtering

| Requested | Built | Status |
|-----------|-------|--------|
| Find contractors by skills, location, ratings | `SearchScreen` with text search bar + contractor recommendations | 🟡 Partial |
| Advanced filtering (skills, location, ratings) | **Not implemented** — search is text-only, no filter UI | 🔴 Gap |
| Customizable filters | No filter chips, dropdowns, or faceted search | 🔴 Gap |
| Featured listings | `SearchScreen`: featured listings section (behind `growthEnabled` flag) | ✅ |

> **Verdict**: 🟡 Basic search exists but **advanced filtering is completely absent**. The original request specifically calls for "customizable filtering options" which don't exist.
>
> **Contradiction**: None — the direction is aligned, just incomplete.
>
> **Demo impact**: Medium — the search screen shows recommendations and featured listings, which is adequate for a demo. But a prospect asking "can I filter by municipality?" will see no filter UI.
>
> **MVP action**: Add filter UI to `SearchScreen`: municipality picker, category picker, minimum rating slider. The backend `getRecommendations` callable can be extended to accept filter parameters.

---

### Feature 9: In-App Messaging & Notifications

| Requested | Built | Status |
|-----------|-------|--------|
| Secure messaging per project | `MessagesScreen` with project selector cards, per-project message threads | ✅ |
| Message input with text | Text input + send button with `KeyboardAvoidingView` (Batch 3) | ✅ |
| File attachments | **Not implemented** — text-only messages, no attachment support | 🟡 Gap |
| Push notifications for quotes, messages, updates | `NotificationsScreen` now renders demo preview items; no real push delivery pipeline yet | 🟡 Partial |
| Email alerts | **Not implemented** — no email notification system | 🔴 Not started |
| Notification settings | Entry point exists in Settings, but no persisted per-event preference controls yet | 🟡 Partial |
| End-to-end encryption | **Not implemented** — messages stored in plaintext in Firestore | 🟡 MVP work |
| Voice notes / video calls | **Not implemented** — not realistic for MVP | ⚪ Deferred |

> **Verdict**: 🟡 Messaging works and notification UI exists, but delivery and preference plumbing are still missing.
>
> **Contradiction**: None — the workplan explicitly lists "FCM/APNs + email template parity" as Iteration B work, confirming this was intentionally deferred.
>
> **Demo impact**: Medium — during a demo, you can show the messaging screen working. But if someone asks "does the contractor get notified when a new project matches them?" the answer is currently no.
>
> **MVP action**: This is already planned in the workplan as Iteration B. Priority: (1) FCM push for key events (new quote, message, completion request, funds released). (2) Email fallback for critical events. (3) Notification preferences in `SettingsScreen`.

---

### Feature 10: Analytics & Reporting

| Requested | Built | Status |
|-----------|-------|--------|
| Contractor analytics dashboard (KPIs, charts) | `EarningsScreen` reads completed-project payout totals from real project states | 🟡 Partial |
| Customer project history + transaction details | `HistoryScreen` now reads ledger events from `ledgers/{projectId}/events` for user projects | 🟡 Partial |
| Report generation (PDF/CSV export) | **Not implemented** — no export capability | 🔴 Not started |
| Performance charts/graphs | **Not implemented** — no charting library integrated | 🔴 Not started |

> **Verdict**: 🟡 Foundations are implemented (ledger-backed history + earnings totals), but charting/export/report depth from the original request remains MVP+ work.
>
> **Contradiction**: None — the workplan correctly deprioritized analytics behind core escrow/marketplace features.
>
> **Demo impact**: Low for initial demos (analytics is a retention feature, not an acquisition feature). High for investor/partner demos where you need to show business intelligence capability.
>
> **MVP action**: (1) Add charted KPI views for contractors. (2) Add report generation/export (CSV/PDF). (3) Add richer customer interaction timelines beyond ledger-only events.

---

## Summary Matrix

| # | Feature | Alignment | Demo-Ready? | Contradictions | Key Gap |
|---|---------|-----------|-------------|----------------|---------|
| 1 | Language EN/ES | ✅ Full | ✅ Yes | None | — |
| 2 | Registration/Auth | ✅ Full | 🟡 Yes (no social) | None | Social login |
| 3 | Contractor Profiles | ✅ Full | 🟡 Yes | None | Availability calendar is placeholder |
| 4 | Project Listings/Quotes | ✅ Full | ✅ Yes | None | Quote sorting/filter controls |
| 5 | Escrow Payments | ✅ Full | ✅ Yes | None | Payment methods placeholder (by design) |
| 6 | Dispute Resolution | ✅ Full | ✅ Yes | None (enhanced) | — |
| 7 | Reviews/Ratings | 🟡 Partial | 🟡 Yes | None | Basic form, no review list on profile |
| 8 | Search/Filtering | 🟡 Partial | 🟡 Yes | None | No filter UI at all |
| 9 | Messaging/Notifications | 🟡 Partial | 🟡 Yes | None | Push/email delivery + persisted preferences not implemented |
| 10 | Analytics/Reporting | 🟡 Partial | 🟡 Yes | None | No charts/exports yet |

---

## Contradictions Found

**Zero fundamental contradictions.** The app development direction is fully aligned with the original 2023 vision. Every named feature from the original request exists in some form — from full implementation to registered placeholder screen.

The only directional shift is actually an improvement: the original request described the app as "an app that serves as an escrow payment account." The architecture evolved this into "neutral payment-hold infrastructure" — which is more precise and legally defensible. This is a refinement, not a contradiction.

---

## Prioritized Gap List (Demo → MVP → Post-MVP)

### Demo Gaps (fix before live demos)
1. **Star rating UX** — Replace numbered buttons with star component in `ReviewSubmissionScreen`
2. **Quote comparison sorting** — Add sort/filter controls in `QuotesCompareScreen`
3. **Notification experience clarity** — Add explicit per-event setting controls in Settings UI (even before live delivery)

### MVP Gaps (fix before first real users)
4. **Push notifications** — FCM/APNs for key lifecycle events (already planned as Iteration B)
5. **Email notifications** — Fallback notification channel for critical events
6. **Search filters** — Category, municipality, rating filters on `SearchScreen`
7. **Social login** — Google/Apple sign-in via Firebase Auth
8. **Review depth** — Individual reviews list on contractor profile + selectable tags
9. **Availability calendar** — Wire `AvailabilityScreen` to real scheduling data
10. **Message attachments** — Image/document sharing in `MessagesScreen`
11. **Payment methods** — Wire to Stripe Connect for real card/bank selection

### Post-MVP Gaps (fix for scale)
12. **Analytics dashboard** — Charts, KPIs, earnings trends for contractors
13. **Report export** — PDF/CSV download capability
14. **Notification preferences** — Persisted user-controlled notification settings
15. **End-to-end encryption** — Message security enhancement
16. **Review moderation UI** — Customer-facing moderation transparency
