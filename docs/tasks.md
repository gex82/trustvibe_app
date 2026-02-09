# TrustVibe - Task Breakdown

> **Project:** TrustVibe MVP + Phase 2  
> **Last Updated:** 2026-02-08  
> **Legend:** `[ ]` = Todo, `[/]` = In Progress, `[x]` = Done

---

## Sprint 1: Repository Scaffold & Shared Types

### 1.1 Monorepo Setup
- [ ] Initialize root `package.json` with npm workspaces
- [ ] Configure workspace paths for apps and packages
- [ ] Add Turborepo or Nx config (optional)
- [ ] Set up ESLint + Prettier
- [ ] Create root README.md

### 1.2 Mobile App Shell (apps/mobile)
- [ ] Initialize Expo with TypeScript
- [ ] Configure app.json and eas.json
- [ ] Install: react-navigation, react-query, zustand, react-hook-form, zod, i18next
- [ ] Create folder structure (components, screens, navigation, hooks, services, store, theme)
- [ ] Set up navigation shell (Auth + Main stacks)
- [ ] Create design system: colors, typography, spacing, base components

### 1.3 Admin Console Shell (apps/admin)
- [ ] Initialize Next.js with TypeScript
- [ ] Install Firebase Admin SDK
- [ ] Set up page structure
- [ ] Create admin layout

### 1.4 Functions Shell (functions/)
- [ ] Initialize Cloud Functions with TypeScript
- [ ] Create folder structure for all domains
- [ ] Configure ESLint

### 1.5 Shared Package (packages/shared)
- [ ] Create types: User, Project, Quote, Agreement, Escrow, Message, Review, Case
- [ ] Create Zod schemas for all types
- [ ] Create constants: enums, municipalities, categories
- [ ] Set up i18n: en.json and es.json skeletons

### 1.6 Firebase Configuration
- [ ] Create firebase.json with emulators
- [ ] Create firestore.rules baseline
- [ ] Create storage.rules baseline
- [ ] Test emulator startup

---

## Sprint 2: Authentication & Profiles

### 2.1 Firebase Auth
- [ ] Enable email/password in Firebase console
- [ ] Set up auth emulator
- [ ] Create auth service wrapper

### 2.2 Mobile Auth Screens
- [ ] RoleSelectScreen
- [ ] LoginScreen with validation
- [ ] RegisterScreen with role assignment
- [ ] ForgotPasswordScreen
- [ ] Auth state listener + navigation guard

### 2.3 Profile Setup
- [ ] Create users Firestore collection
- [ ] ProfileSetupScreen: name, phone, municipality, photo
- [ ] updateProfile Cloud Function
- [ ] Photo upload to Storage

### 2.4 Contractor Profile
- [ ] contractorProfiles collection
- [ ] ContractorProfileSetupScreen: skills, service area, portfolio, credentials
- [ ] upsertContractorProfile Cloud Function
- [ ] ContractorProfileViewScreen

### 2.5 Settings Screen
- [ ] Language toggle (ES/EN)
- [ ] Notification preferences
- [ ] Logout, profile edit

### 2.6 RBAC & Security
- [ ] Define role enum
- [ ] Create Firestore security rules
- [ ] Create Cloud Functions role middleware

---

## Sprint 3-4: Projects & Quotes

### 3.1 Project Creation (Customer)
- [ ] projects Firestore collection
- [ ] CreateProjectScreen (multi-step wizard)
- [ ] createProject Cloud Function
- [ ] publishProject Cloud Function

### 3.2 Customer Project List
- [ ] CustomerProjectsScreen
- [ ] listCustomerProjects Cloud Function

### 3.3 Project Detail
- [ ] ProjectDetailScreen with status, quotes, escrow, messages, CTA
- [ ] getProject Cloud Function

### 3.4 Browse Projects (Contractor)
- [ ] BrowseProjectsScreen with filters
- [ ] listOpenProjects Cloud Function

### 3.5 Quote Submission
- [ ] quotes subcollection
- [ ] SubmitQuoteScreen
- [ ] submitQuote Cloud Function

### 3.6 Quotes Comparison
- [ ] QuotesListScreen
- [ ] QuoteDetailScreen
- [ ] listQuotes Cloud Function

### 3.7 Contractor Selection
- [ ] selectContractor Cloud Function
- [ ] Selection UI in ProjectDetail

### 3.8 Search & Discovery
- [ ] SearchContractorsScreen
- [ ] searchContractors Cloud Function

---

## Sprint 5: Agreement Capture

- [ ] agreements collection (immutable)
- [ ] generateAgreement Cloud Function
- [ ] AgreementReviewScreen
- [ ] acceptAgreement Cloud Function (dual acceptance)
- [ ] Firestore rules for immutability

---

## Sprint 6: Ledger & Payment Infrastructure

### 6.1 Payment Provider
- [ ] PaymentProvider interface
- [ ] MockPaymentProvider (fully working)
- [ ] StripeConnectProvider (stub)

### 6.2 Ledger Module
- [ ] ledgers/{projectId}/events structure
- [ ] LedgerEvent schema
- [ ] Ledger utility functions: recordHold, recordRelease, recordRefund, recordFee

### 6.3 Configuration
- [ ] /config/platformFees document
- [ ] /config/holdPolicy document
- [ ] getFeeConfig and getHoldPolicy functions

---

## Sprint 7: Fund Hold & Completion Flow

- [ ] FundEscrowScreen with totals, fees, terms
- [ ] fundHold Cloud Function
- [ ] EscrowStatusBadge component
- [ ] startWork Cloud Function
- [ ] RequestCompletionScreen
- [ ] requestCompletion Cloud Function
- [ ] CompletionReviewScreen
- [ ] approveRelease Cloud Function
- [ ] checkAutoRelease scheduled function

---

## Sprint 8: Issue Hold & Joint Release

- [ ] RaiseIssueScreen
- [ ] raiseIssueHold Cloud Function
- [ ] cases collection
- [ ] ProposeJointReleaseScreen
- [ ] proposeJointRelease Cloud Function
- [ ] ReviewJointReleaseScreen
- [ ] signJointRelease Cloud Function (execute if both sign)
- [ ] sendIssueReminders scheduled function

---

## Sprint 9: External Resolution

- [ ] UploadResolutionScreen
- [ ] uploadResolutionDocument Cloud Function
- [ ] Admin CaseDetailPage
- [ ] adminExecuteOutcome Cloud Function
- [ ] audit/adminActions collection

---

## Sprint 10: Messaging & Notifications

### 10.1 Messaging
- [ ] messages/{projectId}/items structure
- [ ] MessagesScreen
- [ ] sendMessage Cloud Function

### 10.2 Notifications
- [ ] FCM + APNs configuration
- [ ] NotificationProvider interface
- [ ] MockNotificationProvider
- [ ] SendGridProvider stub
- [ ] registerPushToken Cloud Function
- [ ] Notification triggers for all events
- [ ] EN/ES notification templates

---

## Sprint 11: Reviews & Moderation

- [ ] reviews collection
- [ ] SubmitReviewScreen
- [ ] submitReview Cloud Function
- [ ] Reviews display on contractor profile
- [ ] flagReview Cloud Function
- [ ] Admin ReviewModerationPage
- [ ] adminModerateReview Cloud Function

---

## Sprint 12: Synthetic Data & Scenarios

- [ ] data/demo/*.json files (municipalities, users, contractors, projects, quotes, messages, reviews, cases)
- [ ] scripts/seed.ts
- [ ] scripts/scenarios/happy_path_release.ts
- [ ] scripts/scenarios/issue_then_joint_release_partial.ts
- [ ] scripts/scenarios/issue_then_external_resolution_refund_full.ts

---

## Sprint 13: Admin Console

- [ ] Admin auth with custom claims
- [ ] UsersPage: list, search, filter, actions
- [ ] ProjectsPage: list, filter, detail
- [ ] CasesPage: list, priority, detail, execute
- [ ] ConfigPage: fees, hold policy
- [ ] AuditLogPage

---

## Sprint 14: Phase 2 Feature Flags

- [ ] Feature flag system (/config/featureFlags)
- [ ] useFeatureFlag hook
- [ ] Stripe Connect activation flag
- [ ] Milestone payments stub
- [ ] Change orders stub
- [ ] Credential verification stub
- [ ] Scheduling stub
- [ ] Recommendations stub
- [ ] Referrals/growth stub

---

## Documentation Tasks

- [ ] docs/architecture.md
- [ ] docs/escrow_hold_state_machine.md
- [ ] docs/api.md
- [ ] docs/windows_runbook.md
- [ ] docs/translation_glossary.md
- [ ] docs/manual_qa_checklist.md

---

## Testing Tasks

- [ ] Unit tests: escrow states, fee calculations, deadlines
- [ ] Integration tests against emulators
- [ ] Jest configuration
- [ ] CI/CD pipeline

---

## Deployment Tasks

- [ ] Firebase projects (dev, prod)
- [ ] EAS configuration
- [ ] TestFlight submission
