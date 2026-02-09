# TrustVibe - Assumptions Document

> **Project:** TrustVibe MVP + Phase 2  
> **Last Updated:** 2026-02-08

This document records all assumptions made during planning. Review and validate these assumptions before or during implementation.

---

## 1. Development Environment Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| DEV-01 | Developer has Windows 10/11 with Node.js 18 LTS or higher | Required for Expo CLI, Firebase CLI, and EAS | Build failures; need alternative Node version |
| DEV-02 | Developer has physical iPhone (iOS 15+) for testing | iOS Simulator not available on Windows | Cannot test on device; must use Expo Go with limitations |
| DEV-03 | Developer has Apple Developer account ($99/year) | Required for TestFlight and App Store submission | Cannot publish to App Store |
| DEV-04 | Stable internet connection for cloud builds | EAS builds happen in the cloud | Build timeouts; development delays |
| DEV-05 | PowerShell or Git Bash available as terminal | Scripts written for Unix-like commands | Need to adjust scripts for Windows cmd |

---

## 2. Technical Stack Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| TECH-01 | Expo SDK 50+ supports all required native features | Push notifications, image picker, secure storage | May need to eject or use custom dev client |
| TECH-02 | Firebase free tier sufficient for development | Emulators are free; Spark plan for initial testing | May hit quotas faster than expected |
| TECH-03 | Firebase Emulator Suite runs reliably on Windows | Documented as Windows-compatible | May have path or permission issues |
| TECH-04 | React Navigation v6+ handles all navigation patterns | Deep linking, tabs, stacks, modals | May need custom navigation solutions |
| TECH-05 | Zustand sufficient for state management (no Redux needed) | Simpler API, less boilerplate | May need Redux Toolkit for complex state |
| TECH-06 | Cloud Functions Node.js 18 runtime available | Required for modern TS/JS features | Must use older runtime if not available |

---

## 3. Product & Business Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| BIZ-01 | Puerto Rico is primary launch market | Spec requirement | Different regulations if expanding to other markets |
| BIZ-02 | USD is the only currency needed | Puerto Rico uses USD | Need multi-currency support if expanding |
| BIZ-03 | Email/password auth sufficient for MVP | Simplest auth to implement | Users may expect social login (Google, Apple) |
| BIZ-04 | 5% platform fee is acceptable to users | Common marketplace rate | May need to adjust based on market feedback |
| BIZ-05 | Auto-release after N days is legally acceptable | Standard escrow practice | May need legal review before production |
| BIZ-06 | Joint Release agreement is legally binding | Based on mutual consent principle | May need legal template review |
| BIZ-07 | External resolution documents (court orders, etc.) are verifiable | Admin validates authenticity | May need document verification service |

---

## 4. User Experience Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| UX-01 | Users are comfortable with app-based transactions | Marketplace apps are common | May need more onboarding/education |
| UX-02 | Users have smartphones capable of running latest Expo apps | iOS 15+ is 90%+ of iOS users | May need to support older iOS versions |
| UX-03 | Bilingual (EN/ES) is sufficient for Puerto Rico | Official languages | May encounter users who prefer other languages |
| UX-04 | Users will fund escrow via credit/debit card | Standard payment method | May need ACH, PayPal, or other payment methods |
| UX-05 | Users are willing to complete profile verification | Trust platform expectation | May see drop-off if verification is too complex |
| UX-06 | Push notifications are acceptable for key events | Standard mobile practice | Some users disable push; email fallback needed |

---

## 5. Payment & Escrow Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| PAY-01 | Mock payments are sufficient for MVP testing | Production payments require compliance | Must integrate real payments before any live use |
| PAY-02 | Stripe Connect is the preferred payment processor for Phase 2 | Industry standard for marketplaces | May need alternative if Stripe not available in PR |
| PAY-03 | Platform can hold funds for reasonable duration | Standard escrow model | May need money transmitter license depending on jurisdiction |
| PAY-04 | Partial releases/refunds can be calculated accurately | Basic math operations | Edge cases with rounding may cause discrepancies |
| PAY-05 | Fee deduction at release time is acceptable | Simplifies hold process | Users may prefer fee deduction at funding |

> [!WARNING]
> **Legal Disclaimer:** MVP uses mock payments only. Production payment handling requires:
> - Compliance review with payment processor (Stripe)
> - Legal counsel review of money handling
> - Potential money transmitter licensing depending on jurisdiction
> - PCI compliance for any card handling

---

## 6. Data & Security Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| SEC-01 | Firebase Auth provides sufficient security for user accounts | Google-backed, industry standard | May need additional security layers (MFA) |
| SEC-02 | Firestore security rules can enforce all RBAC requirements | Firebase documentation supports this | Complex rules may have performance impact |
| SEC-03 | Cloud Storage rules can protect user documents | Scoped to user paths | Misconfiguration could expose documents |
| SEC-04 | No PII beyond name, phone, email is needed for MVP | Minimal data collection | May need more data for verification features |
| SEC-05 | Audit logs are retained indefinitely | Compliance requirement | May need retention policy for storage costs |

---

## 7. Integration Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| INT-01 | FCM works reliably for push notifications on iOS | Expo managed workflow | May need to handle APNs directly |
| INT-02 | SendGrid (or similar) is available for email | Common email provider | May need alternative email service |
| INT-03 | Cloud Storage can handle expected file volumes | Firebase scales automatically | May hit storage limits on free tier |
| INT-04 | Firebase Analytics provides sufficient insights | Built-in, free | May need additional analytics (Mixpanel, Amplitude) |

---

## 8. Timeline & Resource Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| TIME-01 | Single developer can complete MVP in 13-14 sprints | Scope is aggressive but defined | May need more time or additional resources |
| TIME-02 | 2-week sprints are appropriate | Standard agile practice | May need shorter sprints for faster feedback |
| TIME-03 | No major scope changes during MVP development | Scope is locked | Scope creep will delay delivery |
| TIME-04 | Firebase Blaze plan is affordable for production | Pay-as-you-go pricing | May need to optimize for cost |

---

## 9. Puerto Rico Specific Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| PR-01 | 78 municipalities cover all service areas | Standard PR administrative divisions | May need sub-municipality regions |
| PR-02 | America/Puerto_Rico timezone is sufficient | All of PR uses Atlantic Standard Time | No DST, but must handle correctly |
| PR-03 | Phone numbers follow US format (+1 787/939) | PR uses NANP | Must validate area codes correctly |
| PR-04 | Address format follows US conventions | PR uses US postal format | Must handle urbanizaciones and barrios |

---

## 10. Dispute & Resolution Assumptions

| ID | Assumption | Rationale | Risk if Invalid |
|----|------------|-----------|-----------------|
| DISP-01 | Most disputes resolve via Joint Release | Parties prefer quick resolution | May need more admin intervention |
| DISP-02 | External resolution documents are rare | Court orders take time | May need more robust document handling |
| DISP-03 | Admin can validate documents manually | Small scale at MVP | May need document verification service at scale |
| DISP-04 | N=7 days is sufficient for customer approval | Industry standard for escrow | May need to adjust based on user behavior |
| DISP-05 | M=30 days is appropriate for admin attention threshold | Reasonable escalation timeline | May need adjustment based on volume |

---

## Validation Checklist

Before production launch, validate:

- [ ] Legal review of escrow/hold model
- [ ] Payment processor compliance (Stripe Connect)
- [ ] Money transmitter licensing requirements
- [ ] Privacy policy & terms of service
- [ ] Data protection compliance
- [ ] Push notification deliverability
- [ ] Email deliverability (SPF, DKIM, DMARC)
- [ ] Performance testing with expected user volumes
- [ ] Security penetration testing
- [ ] Accessibility audit (WCAG 2.1 AA)
