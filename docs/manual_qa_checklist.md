# Manual QA Checklist (iPhone + Emulator)

Last updated: 2026-02-11

## Setup

- [ ] Windows machine and iPhone on same network.
- [ ] Emulators running (`auth`, `firestore`, `functions`, `storage`).
- [ ] Mobile app using emulator host LAN IP.
- [ ] Seed script executed successfully.

## Auth + Profiles

- [ ] Role select screen loads in selected language.
- [ ] Register customer account works.
- [ ] Register contractor account works.
- [ ] Login/logout flows work.

## Happy Path (Release)

- [ ] Customer creates project.
- [ ] Contractor submits quote.
- [ ] Customer selects contractor.
- [ ] Both accept agreement.
- [ ] Customer funds hold.
- [ ] Contractor requests completion.
- [ ] Customer approves release.
- [ ] Ledger events show hold, release, fee.

## Issue Path (Joint Release)

- [ ] Customer raises issue after completion request.
- [ ] Joint release proposal created.
- [ ] Both parties sign.
- [ ] Outcome executed and ledger updated.

## Issue Path (External Resolution)

- [ ] Resolution document uploaded.
- [ ] Admin sees case in console.
- [ ] Admin executes explicit release/refund outcome.
- [ ] Audit entry written.

## Bilingual

- [ ] Language switch EN/ES updates screen labels.
- [ ] Terms use glossary wording (Cuenta de resguardo, Liberar pago, Reportar inconveniente, Instruccion de liberacion conjunta).

## Reliability + Policy

- [ ] Completion deadline auto-release job runs for overdue completion requests.
- [ ] M-day admin-attention job marks stale cases.

## Reviews + Moderation

- [ ] Customer can submit verified review only after final state.
- [ ] Review flagging works.
- [ ] Admin moderation status updates.

## Phase 2 (Feature Flagged)

- [ ] Enable Phase 2 flags in Admin Config.
- [ ] Create estimate deposit, capture it, then apply deposit credit before funding.
- [ ] Mark contractor no-show and verify auto-refund for estimate deposit.
- [ ] Create milestones and approve a milestone release.
- [ ] Propose and accept a change order.
- [ ] Create and confirm a booking request.
- [ ] Record booking attendance and verify reliability score updates.
- [ ] Submit DACO/perito credential and verify status badge updates.
- [ ] Create subscription and verify invoice appears in admin subscriptions page.
- [ ] Create high-ticket concierge case and assign concierge manager in admin page.
- [ ] Load recommendations for both customer and contractor views.
- [ ] Create featured promotion code and verify featured listings + referral code apply.
