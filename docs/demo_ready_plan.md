# TrustVibe — Demo-Ready Plan

> **Purpose:** This document is the single source of truth for transforming TrustVibe from a functional scaffold into a polished, demo-ready prototype that wows customers and contractors. It must be followed sequentially — each phase depends on the previous one.

Last updated: 2026-02-12

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Target State (from mockups)](#2-target-state-from-mockups)
3. [Phase 0 — Critical Bug Fixes](#3-phase-0--critical-bug-fixes)
4. [Phase 1 — Design System Overhaul](#4-phase-1--design-system-overhaul)
5. [Phase 2 — Screen Redesigns](#5-phase-2--screen-redesigns)
6. [Phase 3 — Missing Screens & Features](#6-phase-3--missing-screens--features)
7. [Phase 4 — Functional Flow Completion](#7-phase-4--functional-flow-completion)
8. [Phase 5 — Demo Data & Assets](#8-phase-5--demo-data--assets)
9. [Phase 6 — Polish & QA](#9-phase-6--polish--qa)
10. [File Manifest](#10-file-manifest)
11. [Execution Notes for AI Agents](#11-execution-notes-for-ai-agents)

---

## 1. Current State Assessment

### What exists

| Area | Current State |
|------|---------------|
| **Screens** | 19 screens across 4 groups (auth/3, contractor/2, customer/2, shared/12) |
| **Components** | 2 generic: `PrimaryButton`, `ScreenContainer` |
| **Theme** | Dark mode only — 7 hardcoded colors, 5 spacing tokens |
| **Navigation** | Bottom tabs (Projects, Messages, History, Earnings, Settings) + HomeStack. No Search, no Profile tab. |
| **State** | Zustand store with role, language, user. Minimal. |
| **Services** | Firebase auth + Firestore emulators + 30+ callable function wrappers in `api.ts` |
| **Styling** | Inline `StyleSheet.create()` per screen, no shared styles, no typography system |
| **Icons** | None — tabs and buttons are text-only |
| **Images** | None — no image picking, uploading, or display |
| **Fonts** | System defaults only |

### Known bugs

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| `auth/network-request-failed` on Register | Firebase Auth emulator at `127.0.0.1:9099` unreachable from phone. The `.env.local` sets `EXPO_PUBLIC_EMULATOR_HOST=192.168.68.124` but the Firebase Auth emulator binds to `127.0.0.1` only. | Start emulators with `--host 0.0.0.0` so they listen on all interfaces, matching the phone-accessible LAN IP. Also add a firewall rule for ports 9099, 8080, 5001, 9199. |
| Empty list on HomeScreen | `listProjects` fires before emulators are seeded | Seed emulators on startup or display proper empty state with CTA |
| No back navigation on inner screens | Auth screens have `headerShown: false` but no manual back button | Add back arrows or native header on Login/Register screens |
| Dark text on dark background contrast issues | Some `textPrimary` (#F5FAFF) on accent (#1BC47D) is hard to read | Redesign removes this (switching to light theme) |

---

## 2. Target State (from mockups)

### Design language (extracted from provided mockups)

| Element | Value |
|---------|-------|
| **Background** | White (`#FFFFFF`) / light gray (`#F5F5F5`) |
| **Primary text** | Navy (`#0B1F47`) |
| **Secondary text** | Medium gray (`#6B7280`) |
| **Accent / CTA** | Navy blue (`#1B3A6B`) |
| **Success** | Green (`#22C55E`) |
| **Warning / Held** | Navy + gold lock icon |
| **Cards** | White with subtle `#E5E7EB` border, rounded corners (12–16px), light shadow |
| **Font** | Inter or SF Pro — clean, modern, medium-to-bold weights |
| **Tab bar** | 4 tabs: **Home**, **Search**, **Projects**, **Profile** (icons + labels) |
| **Status indicators** | Green checkmark (completed), blue clock (in progress), gold lock (held) |

### Key screens from mockups

1. **Home Dashboard** — Search bar, Financial Overview card (escrow total + lock icon), horizontal scrolling Active Projects carousel (progress bars), bottom tab bar
2. **Digital Contract / Milestone Ledger** — Project title + contractor name + verified badge, milestone list with status icons, "Review & Release" CTA button at bottom
3. **Verified Portfolio** — Contractor profile photo, "VERIFIED PRO" badge, rating + project count + DACO license, Credentials & Insurance expandable sections, Featured Projects photo gallery

### Missing screens (not in current codebase)

- Search/Browse Contractors
- Contractor Profile (public portfolio view)
- User Profile / Account (edit profile, photo, documents)
- Onboarding Wizard (first-time setup)
- Notifications Hub
- Project Timeline View (milestone-centric, not button-centric)
- Payment Method Management
- Document Upload/View Screen

---

## 3. Phase 0 — Critical Bug Fixes

> **Goal:** Make the existing app functional on a real device. Zero crashes, auth works, data loads.

### 3.1 Fix Firebase Emulator Binding

**Files:** `package.json` (root), `firebase.json`

**Change:** Update the emulators script to bind to `0.0.0.0`:
```json
"emulators": "firebase emulators:start --only auth,firestore,functions,storage --host 0.0.0.0 --import=.firebase/emulator-data --export-on-exit"
```

**Also:** Add Windows Firewall rules for ports 9099, 8080, 5001, 9199, 4000.

### 3.2 Fix Auth Emulator Connection URL

**File:** `apps/mobile/src/services/firebase.ts`

**Change:** The `connectAuthEmulator` call uses `http://${host}:9099` which is correct, but verify `EXPO_PUBLIC_EMULATOR_HOST` is the LAN IP (e.g., `192.168.68.124`). Confirm `.env.local` is loaded.

### 3.3 Add Back Navigation to Auth Screens

**Files:** `apps/mobile/src/navigation/RootNavigator.tsx`, `LoginScreen.tsx`, `RegisterScreen.tsx`

**Change:** Show the native header with a back button on Login and Register screens. Remove `headerShown: false` from Login and Register in the AuthStack.

### 3.4 Add Error Boundary

**File (new):** `apps/mobile/src/components/ErrorBoundary.tsx`

**Change:** Wrap the root navigator in an error boundary so the app shows a friendly error screen instead of a red crash overlay during demos.

### 3.5 Seed Data on Startup

**File:** `functions/src/http/handlers.ts` or create a new seed-on-start script.

**Change:** Ensure demo data (projects, contractors, quotes) is available when the emulators start. Wire up the existing seed scripts (`npm run seed`) to auto-run or provide a one-tap "Load Demo Data" button on the HomeScreen when empty.

---

## 4. Phase 1 — Design System Overhaul

> **Goal:** Replace the dark dev theme with the polished light theme from mockups. Create a reusable component library.

### 4.1 New Theme Tokens

**File:** `apps/mobile/src/theme/tokens.ts` (rewrite)

```typescript
export const colors = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceBorder: '#E5E7EB',

  // Text
  textPrimary: '#0B1F47',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',

  // Brand
  navy: '#1B3A6B',
  navyLight: '#2D5AA0',
  navyDark: '#0F2440',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Escrow
  escrowHeld: '#1B3A6B',
  escrowReleased: '#22C55E',
  escrowPending: '#F59E0B',

  // Tab bar
  tabActive: '#1B3A6B',
  tabInactive: '#9CA3AF',
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary, textTransform: 'uppercase' as const },
  amount: { fontSize: 32, fontWeight: '800' as const, color: colors.navy },
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};
```

### 4.2 Install Icon Library

**Command:** `npx expo install @expo/vector-icons`

(Already included with Expo — just import `Ionicons` or `MaterialIcons`.)

### 4.3 Install Fonts (optional, recommended)

**Command:** `npx expo install expo-google-fonts/inter @expo-google-fonts/inter`

### 4.4 New Reusable Components

Create the following in `apps/mobile/src/components/`:

| Component | File | Purpose |
|-----------|------|---------|
| `Card.tsx` | Card wrapper with shadow, border, rounded corners | Used everywhere |
| `Badge.tsx` | Verified PRO badge, status badges (green checkmark, blue clock, gold lock) | Profile, milestones |
| `Avatar.tsx` | Circular image with fallback initials | Profile, contractor cards |
| `IconButton.tsx` | Icon-only button (back arrow, edit, etc.) | Navigation, actions |
| `SearchBar.tsx` | Styled search input with icon | Home screen, Search tab |
| `ProgressBar.tsx` | Horizontal progress bar (0-100%) with label | Project cards |
| `MilestoneRow.tsx` | Milestone line item with status icon, title, amount | Contract detail |
| `FinancialCard.tsx` | Escrow total display with lock icon | Home dashboard |
| `ProjectCard.tsx` | Compact project card for carousel (title, progress, phase) | Home active projects |
| `ContractorCard.tsx` | Contractor info card (photo, name, rating, badge) | Search results |
| `SectionHeader.tsx` | Bold section title with optional "See All" link | Home screen sections |
| `EmptyState.tsx` | Friendly empty state with icon and CTA | Lists with no data |
| `TabBarIcon.tsx` | Tab bar icon component using vector icons | Bottom navigation |
| `StatusIndicator.tsx` | Green/blue/gold circle with icon for milestone status | Milestone ledger |
| `CredentialRow.tsx` | License or insurance row with icon and verified badge | Portfolio |
| `PhotoGallery.tsx` | Horizontal scrolling photo gallery | Featured projects |
| `CTAButton.tsx` | Full-width call-to-action button (navy, rounded, icon optional) | "Review & Release" |
| `FormInput.tsx` | Styled text input with label, error state, icon | Auth, forms |

---

## 5. Phase 2 — Screen Redesigns

> **Goal:** Rebuild every existing screen to match the mockup design language.

### 5.1 Auth Screens

#### `RoleSelectScreen.tsx` — Redesign

- Add TrustVibe logo at top
- Two large card-style buttons (Customer / Contractor) with icons and descriptions
- Subtitle: "Secure your home improvement projects"
- Language toggle (EN/ES) at bottom

#### `LoginScreen.tsx` — Redesign

- Logo + "Welcome Back" heading
- `FormInput` components (email, password) with icons
- "Forgot Password?" link (wired to `resetPassword`)
- Primary CTA button (navy)
- "Don't have an account? Register" link
- Back arrow at top-left

#### `RegisterScreen.tsx` — Redesign

- Logo + "Create Account" heading
- `FormInput` components (name, email, phone, password, confirm password)
- Role indicator ("Registering as Customer/Contractor")
- Terms & conditions checkbox (placeholder)
- Primary CTA button
- Back arrow at top-left

### 5.2 Home Dashboard (`HomeScreen.tsx`) — Full Rebuild

This is the most important screen. Refer to the Home mockup.

**Layout (top to bottom):**
1. **Top bar:** Greeting ("Good morning, {name}"), notification bell icon
2. **Search bar:** Rounded, icon-leading, navigates to Search tab on focus
3. **Financial Overview section:**
   - `SectionHeader` — "Financial Overview"
   - `FinancialCard` — Large escrow total ($15,000) with gold lock icon
4. **Active Projects section:**
   - `SectionHeader` — "Active Projects" + "See All"
   - Horizontal `FlatList` of `ProjectCard` components (title, progress %, phase label)
   - Dot pagination indicators below
5. **Recent Activity section:**
   - Timeline-style list of recent events (milestone approved, message received, etc.)

### 5.3 Project Detail (`ProjectDetailScreen.tsx`) — Full Rebuild

Currently: A dump of 15+ buttons. Must become a structured project view.

**Layout (top to bottom):**
1. **Header:** Project title (bold), contractor name + verified badge
2. **Status bar:** Current phase (e.g., "Phase 2: In Progress") with progress indicator
3. **Milestone Ledger section:**
   - `SectionHeader` — "Milestone Ledger"
   - List of `MilestoneRow` components, each with:
     - Status icon (✅ completed, 🕐 in progress, 🔒 held)
     - Title (e.g., "Milestone 1: Demolition")
     - Amount + status text (e.g., "$2,500 Released")
4. **CTA area at bottom:**
   - Conditional navy button: "Review & Release $5,000 for Milestone 2" (customer)
   - Or: "Request Completion" (contractor)
5. **Collapsible sections:** Quotes, Agreement, Change Orders — expandable, not a wall of buttons

### 5.4 Messages Screen — Redesign

- Conversation list view (show project name, last message preview, timestamp)
- Chat bubble UI when a conversation is selected
- Image attachment button (placeholder → Phase 3)
- Sender name/avatar on each bubble

### 5.5 Settings Screen — Redesign

- Profile section at top (avatar, name, email)
- Grouped list items with icons: Language, Notifications, Payment Methods, Help, About
- Logout at bottom (red, with confirmation dialog)

### 5.6 Other Shared Screens

Each of these needs the same visual treatment (cards, proper typography, icons):
- `QuotesCompareScreen` → Side-by-side quote cards with contractor info
- `AgreementReviewScreen` → Styled document preview with accept/decline
- `FundEscrowScreen` → Amount display + payment method selector + confirm
- `CompletionReviewScreen` → Photo proof grid + approve/deny
- `JointReleaseScreen` → Split slider or amount inputs
- `ResolutionSubmissionScreen` → Document uploader (placeholder → Phase 3)
- `ReviewSubmissionScreen` → Star rating input + text + tag chips
- `EarningsScreen` → Summary card + project list with earnings
- `HistoryScreen` → Transaction timeline with filters
- `AvailabilityScreen` → Calendar view placeholder + availability toggle
- `RecommendationsScreen` → Contractor cards with ratings

---

## 6. Phase 3 — Missing Screens & Features

> **Goal:** Add the screens visible in mockups that don't exist yet.

### 6.1 New Navigation Structure

**File:** `apps/mobile/src/navigation/RootNavigator.tsx` — Rebuild

Replace current tabs with:

| Tab | Icon | Stack Contents |
|-----|------|----------------|
| **Home** | `home-outline` | HomeScreen → ProjectDetail → MilestoneLedger → CompletionReview → etc. |
| **Search** | `search-outline` | SearchScreen → ContractorProfile → CreateProject |
| **Projects** | `briefcase-outline` | ProjectsListScreen → ProjectDetail → QuotesCompare → etc. |
| **Profile** | `person-outline` | ProfileScreen → EditProfile → Documents → PaymentMethods → Settings |

### 6.2 New Screens

#### `SearchScreen.tsx` (NEW)
- Full-width search bar at top
- Filter chips: Category, Municipality, Rating, Budget range
- Results: `ContractorCard` list or `FlatList` with project cards
- Data source: `listFeaturedListings` + `getRecommendations`

#### `ContractorProfileScreen.tsx` (NEW) — "Verified Portfolio" from mockups
- **Header:** Large circular profile photo + "VERIFIED PRO" badge
- **Stats row:** Rating (⭐ 4.9), Project count (50+), DACO license number
- **Credentials & Insurance:** Expandable `CredentialRow` items
  - License & Certifications (Verified) ✓
  - General Liability Insurance ($1M Coverage) ✓
- **Featured Projects:** Horizontal `PhotoGallery` with project thumbnails
- **Reviews:** Star breakdown + individual review cards
- **CTA:** "Request Quote" button

#### `ProfileScreen.tsx` (NEW) — User's own profile
- Avatar + name + role + edit button
- For **customers:** Past projects, saved contractors, payment methods
- For **contractors:** Portfolio management, earnings summary, credential uploads
- Edit profile (name, phone, photo upload)

#### `EditProfileScreen.tsx` (NEW)
- Form with avatar picker (camera + gallery), name, phone, email (read-only)
- Save button

#### `DocumentsScreen.tsx` (NEW)
- List of uploaded documents (contracts, licenses, insurance docs)
- Upload button → opens device file/photo picker
- Status badges (Pending Review, Verified, Expired)

#### `NotificationsScreen.tsx` (NEW)
- List of notifications with icons, timestamps
- Mark as read, swipe to dismiss
- Types: milestone approved, new message, quote received, payment processed

#### `PaymentMethodsScreen.tsx` (NEW)
- List of saved payment methods (credit cards, bank accounts)
- Add new method
- Default method indicator

### 6.3 Image & Document Upload

**Install:** `npx expo install expo-image-picker expo-document-picker`

**New utility:** `apps/mobile/src/services/upload.ts`

```typescript
// Functions needed:
export async function pickImage(): Promise<string | null> { ... }
export async function pickDocument(): Promise<string | null> { ... }
export async function uploadToStorage(localUri: string, storagePath: string): Promise<string> { ... }
```

**Where used:**
- Profile photo upload → `EditProfileScreen`
- Project photos → `CreateProjectScreen`
- Proof of completion photos → `CompletionReviewScreen`
- Resolution documents → `ResolutionSubmissionScreen`
- Contractor portfolio → `ContractorProfileScreen`
- Credential documents → `DocumentsScreen`

### 6.4 Firebase Storage Integration

**File:** `apps/mobile/src/services/firebase.ts`

**Add:** Storage initialization and emulator connection:
```typescript
import { connectStorageEmulator, getStorage } from 'firebase/storage';
export const storage = getStorage(app);
// In maybeConnectEmulators:
connectStorageEmulator(storage, host, 9199);
```

---

## 7. Phase 4 — Functional Flow Completion

> **Goal:** Every user flow works end-to-end with realistic behavior, even with synthetic data.

### 7.1 Customer Happy Path

```
Register → Home → Search Contractor → View Portfolio → Request Quote
→ Compare Quotes → Select Contractor → Review Agreement → Accept
→ Fund Escrow → Track Milestones → Approve Completion → Leave Review
```

**Gaps to fill:**
- [ ] Search + contractor profile flow (new screens)
- [ ] Milestone tracking (transform button dump into milestone ledger)
- [ ] Photo proof viewing on CompletionReview
- [ ] Star rating input component on ReviewSubmission
- [ ] Success/confirmation screens after key actions (payment, review, etc.)

### 7.2 Contractor Happy Path

```
Register → Home → View Available Projects → Submit Quote
→ Agreement Signed → Begin Work → Update Milestones → Request Completion
→ Get Paid → Manage Portfolio
```

**Gaps to fill:**
- [ ] Available projects view (Search tab adapted for contractors)
- [ ] Quote submission form (currently hardcoded in seed, no UI form)
- [ ] Milestone progress updates from contractor side
- [ ] Portfolio management (upload photos, manage credentials)
- [ ] Earnings dashboard improvements (weekly/monthly charts)

### 7.3 Edge Flows (must work for demo credibility)

- [ ] **Dispute flow:** Raise issue → Joint release negotiation → Resolution
- [ ] **Change order:** Propose → Accept/Decline → Updated agreement
- [ ] **Estimate deposit:** Create → Pay → Apply toward job OR refund
- [ ] **Forgot password:** Link on login → email sent confirmation screen

### 7.4 Data Hydration via Seed Script

**File:** `functions/src/http/seedDemoData.ts` (new or enhance existing)

Create realistic demo data for both roles:

**Customer "Maria":**
- 3 active projects (Bathroom Remodel 50%, Concrete Driveway 30%, Kitchen Update 10%)
- $15,000 total in escrow
- Past messages with contractor
- 1 completed project with review

**Contractor "Juan's Services":**
- VERIFIED PRO badge
- 4.9 rating, 50+ projects
- DACO License #12345
- $1M General Liability Insurance (Verified)
- 5 featured project photos (bathroom renovations)
- Active earnings: $12,500 released

---

## 8. Phase 5 — Demo Data & Assets

> **Goal:** Create all images, documents, and synthetic content needed for a realistic demo.

### 8.1 Images to Generate (use AI image generation)

| Asset | File Path | Description |
|-------|-----------|-------------|
| App logo | `assets/images/logo.png` | TrustVibe shield/trust logo, navy and white |
| Splash screen | `assets/images/splash.png` | Logo centered on white background |
| Contractor avatar | `assets/images/demo/contractor_juan.jpg` | Professional headshot of a contractor |
| Customer avatar | `assets/images/demo/customer_maria.jpg` | Friendly female headshot |
| Bathroom Remodel 1 | `assets/images/demo/projects/bathroom_1.jpg` | Modern bathroom renovation |
| Bathroom Remodel 2 | `assets/images/demo/projects/bathroom_2.jpg` | Bathroom vanity close-up |
| Bathroom Remodel 3 | `assets/images/demo/projects/bathroom_3.jpg` | Bathroom tile work |
| Concrete Driveway | `assets/images/demo/projects/concrete_1.jpg` | Stamped concrete driveway |
| Kitchen Update | `assets/images/demo/projects/kitchen_1.jpg` | Modern kitchen remodel |
| Proof of completion | `assets/images/demo/proof/demo_proof.jpg` | Before/after comparison |
| Credential doc placeholder | `assets/images/demo/docs/license.png` | DACO license document mockup |
| Insurance doc placeholder | `assets/images/demo/docs/insurance.png` | Insurance certificate mockup |
| Empty state illustration | `assets/images/empty_projects.png` | Friendly illustration for empty lists |

### 8.2 Demo User Credentials

Store in `docs/demo_credentials.md`:

| Role | Email | Password | Name |
|------|-------|----------|------|
| Customer | maria@demo.trustvibe.com | Demo1234! | Maria Rodriguez |
| Contractor | juan@demo.trustvibe.com | Demo1234! | Juan's Services |
| Admin | admin@demo.trustvibe.com | Admin1234! | TrustVibe Admin |

### 8.3 Bilingual Copy Audit

Ensure all new screens and components have both `en` and `es` translations in:
- `apps/mobile/src/i18n/en.json`
- `apps/mobile/src/i18n/es.json`

---

## 9. Phase 6 — Polish & QA

> **Goal:** Final pass on quality, performance, and demo readiness.

### 9.1 Animation & Micro-interactions

- Fade-in on screen transitions
- Skeleton loaders while data fetches (not just ActivityIndicator)
- Button press feedback (scale animation)
- Card press shadow elevation change
- Milestone status icon animations (checkmark draw-in)
- Pull-to-refresh on all list screens

### 9.2 Accessibility

- All buttons have `accessibilityLabel`
- All images have `accessibilityRole="image"` and alt text
- Minimum tap target size: 44x44pt
- Proper focus order for screen readers

### 9.3 Performance

- Image optimization (resize before upload)
- Query caching with React Query staleTime / cacheTime
- Lazy load screens with `React.lazy` + `Suspense`
- Minimize re-renders with `React.memo` on list items

### 9.4 QA Checklist (extend `docs/manual_qa_checklist.md`)

- [ ] Auth: Register customer → verify user in Firestore → login → logout → login again
- [ ] Auth: Register contractor → same flow
- [ ] Auth: Forgot password → shows confirmation
- [ ] Home: Shows greeting, financial overview, active projects
- [ ] Home: Search bar navigates to Search
- [ ] Search: Filter by category → see contractor results
- [ ] Contractor Profile: Shows verified badge, credentials, project gallery
- [ ] Project: Create → appears in list → view detail
- [ ] Quote: Submit (contractor) → Compare (customer) → Select
- [ ] Agreement: Review → Accept → Fund
- [ ] Milestones: View ledger → Approve completion → Release funds
- [ ] Review: Submit star rating + feedback
- [ ] Messages: Send/receive in project context
- [ ] Profile: View → Edit → Upload photo
- [ ] Settings: Switch language → UI updates → Logout
- [ ] Offline: Shows friendly error (not crash)
- [ ] Physical device: All above pass on iPhone via Expo Go

---

## 10. File Manifest

### New files to create

```
apps/mobile/src/
├── components/
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── CTAButton.tsx
│   ├── Card.tsx
│   ├── ContractorCard.tsx
│   ├── CredentialRow.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── FinancialCard.tsx
│   ├── FormInput.tsx
│   ├── IconButton.tsx
│   ├── MilestoneRow.tsx
│   ├── PhotoGallery.tsx
│   ├── ProgressBar.tsx
│   ├── ProjectCard.tsx
│   ├── SearchBar.tsx
│   ├── SectionHeader.tsx
│   ├── SkeletonLoader.tsx
│   ├── StatusIndicator.tsx
│   └── TabBarIcon.tsx
├── screens/
│   ├── customer/
│   │   └── SearchScreen.tsx
│   ├── contractor/
│   │   └── ContractorProfileScreen.tsx (public portfolio)
│   └── shared/
│       ├── ProfileScreen.tsx
│       ├── EditProfileScreen.tsx
│       ├── DocumentsScreen.tsx
│       ├── NotificationsScreen.tsx
│       └── PaymentMethodsScreen.tsx
├── services/
│   └── upload.ts
└── theme/
    └── tokens.ts (rewrite)

assets/images/
├── logo.png
├── splash.png
├── empty_projects.png
└── demo/
    ├── contractor_juan.jpg
    ├── customer_maria.jpg
    ├── projects/
    │   ├── bathroom_1.jpg
    │   ├── bathroom_2.jpg
    │   ├── bathroom_3.jpg
    │   ├── concrete_1.jpg
    │   └── kitchen_1.jpg
    ├── proof/
    │   └── demo_proof.jpg
    └── docs/
        ├── license.png
        └── insurance.png

docs/
├── demo_credentials.md
└── demo_ready_plan.md (this file)
```

### Files to modify

| File | Changes |
|------|---------|
| `package.json` (root) | Add `--host 0.0.0.0` to emulators script |
| `apps/mobile/package.json` | Add `expo-image-picker`, `expo-document-picker` dependencies |
| `apps/mobile/src/theme/tokens.ts` | Complete rewrite to light theme |
| `apps/mobile/src/navigation/RootNavigator.tsx` | Rebuild with 4-tab layout (Home, Search, Projects, Profile) |
| `apps/mobile/src/navigation/types.ts` | Add new screen params |
| `apps/mobile/src/components/PrimaryButton.tsx` | Restyle with navy design |
| `apps/mobile/src/components/ScreenContainer.tsx` | Update background to white |
| `apps/mobile/src/services/firebase.ts` | Add Storage init + emulator connection |
| `apps/mobile/src/store/appStore.ts` | Add profile data (name, avatarUrl, phone) |
| `apps/mobile/src/i18n/en.json` | Add all new screen translations |
| `apps/mobile/src/i18n/es.json` | Add all new screen translations |
| All 19 existing screens | Restyle with new design system |
| `apps/mobile/app.json` | Update splash screen, icon, name |

---

## 11. Execution Notes for AI Agents

### Build Order (MUST follow this sequence)

1. **Phase 0 first.** Fix the emulator binding bug and auth flow so the app is testable on device.
2. **Phase 1 next.** Create the design system (`tokens.ts` rewrite + new components). All subsequent screen work depends on this.
3. **Phase 2 in parallel groups.** Redesign screens in batches:
   - Batch A: Auth screens (RoleSelect, Login, Register)
   - Batch B: Home Dashboard + Navigation restructure
   - Batch C: Project Detail + Milestone Ledger
   - Batch D: Messages, Settings, History, Earnings
4. **Phase 3 after Phase 2.** New screens can only be built once the component library exists.
5. **Phase 4 after Phase 3.** Connect all flows end-to-end.
6. **Phase 5 in parallel with Phase 4.** Generate assets and demo data while wiring flows.
7. **Phase 6 last.** Polish pass after everything is functional.

### Key Principles

- **Every screen must use components from Phase 1.** No ad-hoc styles.
- **Every user-facing string must be in `en.json` and `es.json`.** No hardcoded text.
- **Every list must have an `EmptyState` component.** No blank screens.
- **Every action must have success/error feedback.** No silent operations.
- **Every screen must have back navigation.** Either native header or custom back button.
- **All images must be generated before Phase 5.** Use `generate_image` tool.
- **Test on physical device after each phase.** Don't wait until the end.

### Image Generation Instructions

When generating images for the app, use these guidelines:
- **Contractor photo (Juan):** Young Hispanic male, late 20s, wearing construction work shirt, friendly smile, professional headshot style, warm lighting
- **Customer photo (Maria):** Hispanic female, mid 30s, professional, friendly, headshot style
- **Project photos:** High-quality, well-lit, residential renovation photos. Realistic, modern style.
- **Logo:** Shield or trust icon incorporating the letters "TV" or "TrustVibe", navy blue and white, minimal, modern

### Testing After Each Phase

After completing each phase, run this sequence:
```powershell
# 1. Build shared package
npm run build -w @trustvibe/shared

# 2. Start emulators (with --host 0.0.0.0 after Phase 0 fix)
npm run emulators

# 3. Seed demo data
npm run seed

# 4. Start Expo
cd apps/mobile && npx expo start --offline --clear

# 5. Scan QR code on physical iPhone
# 6. Walk through the QA checklist for the completed phase
```
