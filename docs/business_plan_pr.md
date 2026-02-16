# Business Plan for Puerto Rico

Source: `C:\Users\excj\OneDrive\Documents\TrustVibe_app\Business Plan for PR.pdf`

Pages: 8

## Page 1

TrustVibe Puerto Rico Business Plan – Revised
MECE Report
Date:  February 11, 2026
Team size:  2 (founder + co‑founder)
Introduction
Home‑repair and improvement in Puerto Rico suffers from a chronic trust deficit: customers pay deposits or
full amounts and then contractors disappear or do poor work. TrustVibe  aims to solve this by combining a
neutral payment escrow with a structured workflow for quotes, contracts, scheduling and release of funds.
The current prototype is an MVP built in a monorepo. It implements the core flow (project → quote →
agreement  → hold  → release)  but  uses  mock  payments  and  leaves  many  advanced  features  behind
feature flags . A  MockPaymentProvider  is active, while the Stripe Connect provider is stubbed and
disabled .  Phase‑2  modules  such  as  milestones,  change  orders,  scheduling,  recommendations  and
growth  are  scaffolded  but  disabled  by  default .  Contractor  profiles  can  store  licenses  and
certifications, but there is no automated credential verification workflow .
This report presents a revised business and product strategy  tailored to a small founding team. It refines
the monetization plan, acquisition tactics and operational policies to ensure the platform directly addresses
the “paid then disappeared” problem. At the end, we summarise the gaps in the current GitHub prototype
and outline specific development recommendations.
1. North‑Star Positioning
Tagline: “Pay safely for services in Puerto Rico.”
TrustVibe must be perceived as neutral infrastructure : it does not judge workmanship quality or act as a
mediator . Instead, it:
Holds funds in escrow and only releases them on customer approval, a jointly signed release, or
after an external resolution document is provided .
Captures complete documentation (proof photos, contracts, communications) to build a reliable
reputation system.
Rewards reliable contractors with higher ranking and repeat work while penalising no‑shows and
off‑platform bypasses.1
2
34
5
1
•
1
•
•
1

## Page 2

2. Target Segments (MECE)
A. High‑LTV / High‑Repeat Customers (launch wedge)
Property‑management companies  overseeing long‑term rentals – they suffer from chronic
maintenance pain and appreciate reliability.
Short‑term rental (STR) operators and co‑hosts  – urgent repairs directly impact revenue; they
value quick dispatch and documentation.
Small commercial owners  (retail, restaurants, clinics) – downtime is costly and they need consistent
vendors.
B. Volume Customers (scale later)
Homeowners  – make up the majority of spend but have lower frequency; onboard them after
marketplace health is established.
C. Supply Segmentation
A‑team contractors  – reliable, licensed professionals who become the backbone of the
marketplace.
Long‑tail contractors  – admitted only for low‑risk jobs until their reliability score grows.
3. Product Mechanics
A. Payment Structure for Trust
Escrow per job size:
< $1,000:  hold the entire amount until completion or dispute resolution.
$1,000 – $7,500:  use milestone holds  so contractors receive progress payments for materials and
labour; this requires enabling the milestone payments module which is currently behind a feature
flag .
> $7,500:  offer a  concierge mode  (described later) with detailed scoping, multiple bids and more
stringent controls.
Estimate/booking deposit:  Collect a small deposit (e.g., $29–$79 depending on category) when a
customer requests an on‑site estimate. This deposit filters tyre‑kickers, covers the contractor’s time,
and  is  credited  towards  the  job  if  they  proceed;  it  is  refunded  automatically  if  the  contractor
no‑shows. The current prototype has no function for such deposits .
Risk‑based  auto‑release:  The  escrow  auto‑release  job  is  configurable .  For  high‑reliability
contractors (good response times, few disputes), small jobs can auto‑release after  N days if the
customer is silent. For others, auto‑release should be disabled.
B. Proof Requirements
Contractors must submit time‑stamped photos of the site (before, during, after) and confirm
location; missing proof blocks completion requests. This reduces false completions.1.
2.
3.
1.
1.
2.
•
•
•
3
•
•
6
• 2
•
2

## Page 3

Customers must accept or dispute within N days; otherwise, the risk‑based auto‑release applies.
All proof, contracts, messages and change orders are compiled into a dispute packet . This helps an
external mediator or judge resolve issues quickly.
C. Dispute Handling
TrustVibe does not arbitrate quality. The hold can only be released via:
Customer approval  after completion request.
Joint release : both parties sign a release with agreed distribution of funds.
External resolution document : e.g., a judgement, mediation or arbitration agreement .
The admin’s role is to execute the signed outcome and log it in the ledger . Cases are flagged for admin
attention after M days if unresolved .
D. Reliability Score
Ranking contractors by star rating alone is insufficient. A reliability score should combine:
Show‑up rate (estimate appointments and scheduled visits).
Response time to messages/quotes.
Dispute frequency and resolution outcomes.
Proof completeness.
On‑time completion against promised timeline.
This score determines search ranking, eligibility for larger jobs, auto‑release eligibility and payout speed.
4. Monetization Model
A. Estimate/Booking Deposit
Small jobs (e.g., plumbing, electrical repairs):  $29 deposit.
Medium jobs:  $49 deposit.
High‑ticket jobs:  $79 deposit.
Deposits are credited to the job if it goes ahead. Contractor no‑shows result in an automatic refund to the
customer and a penalty to the contractor’s reliability score.
B. Transaction Fee (Take Rate)
Job size Platform fee Notes
<$1,000 10% (max $120) protects small‑job economics
$1,000 – $5,000 7% (max $300) moderate take for mid jobs
>$5,000 4% (max $1,500) reduces bypass incentives•
•
1.
2.
3. 1
1
1
•
•
•
•
•
•
•
•
3

## Page 4

Fees should be configured server‑side in  config/platformFees ; the current prototype has a single
percent + fixed fee configuration .
C. Subscription Plans
Pro Contractor ($79/month):  priority placement, lower fee (minus 1 percentage point), early access
to larger jobs and milestone features.
Premium Contractor ($199/month):  further fee reduction (minus 2 percentage points), access to
high‑ticket concierge projects, faster payouts once payments are live.
D. Property Manager / STR SaaS
Provide consolidated invoices, dispatch SLAs and property history:
- $49/mo (1–5 units), $99/mo (6–20 units), $199/mo (21–60 units).
This taps recurring revenue from repeat buyers.
E. High‑Ticket Concierge
For projects above a threshold (e.g., $5k), charge a $199 intake fee plus a 2% success fee, or alternatively
charge  contractors  a  referral  fee.  The  concierge  service  includes  professional  scoping,  multiple  bids,
milestone plan creation and documentation enforcement.
F. Growth & Referrals
Phase‑2 growth functions such as promotions and referral codes exist behind the  growthEnabled  flag
. Once enabled, implement a referral program where both parties receive credit after a completed job,
and optionally feature contractors in paid listings.
5. Acquisition Strategy
A. Supply
Recruit quality over quantity : aim for ~300 contractors onboarded, with ~150 active and ~50–80
trusted “A‑team” in the launch area. Use direct outreach via hardware stores, trade associations and
Facebook groups. Offer zero platform fees on the first $2k or first month to seed supply.
Enforce reliability : no‑shows or attempts to bypass payment result in deprioritisation or delisting.
The scheduling endpoints are currently behind a feature flag and need to be implemented .
B. Demand
Property managers & STR operators : Outreach to property management firms and co‑hosts;
emphasise dispatch SLAs, documentation and consolidated billing.
Small commercial owners : Target high‑urgency sectors (retail, restaurants, clinics) with a “never
lose revenue due to maintenance” message.
Homeowners : Use social channels, Meta ads and QR codes at hardware stores once supply
reliability is proven.7
•
•
4
•
•
8
1.
2.
3.
4

## Page 5

C. Growth Loops
Contractor shares quote/contract link → customer must open the app → organic user acquisition.
Completion generates a shareable before/after “job card” encouraging word‑of‑mouth.
Referral credits only when a job is completed, deterring abuse.
6. Operational Policies
Anti‑bypass controls : do not reveal contact information until the deposit is paid. Make warranties,
proof archives and tax documentation accessible only within the app so users stay on‑platform.
Fraud controls : multi‑tier identity verification; deposit requirement filters fake requests; strong
audit logs track all money and admin actions . Contractor credential verification should be
automated (see below).
Dispute workflow : encourage joint release agreements first; if unresolved, collect external
resolution documents and execute them exactly . Disputes older than M days are flagged for
admin attention .
7. Financial Projections (Year 1)
To keep expectations grounded, here are two scenarios for the first year .
Conservative Scenario (metro area + property managers)
Jobs:  2,000 jobs completed (avg. ticket $850) → GMV $1.7M.
Take‑rate revenue:  7% average → $119k.
Deposits:  3,000 estimate deposits × $39 avg → $117k.
Contractor subscriptions:  50 contractors × $79/mo × 12 mo → $47k.
Total revenue:  ~$283k  (before payment processing and overhead).
Aggressive Scenario (strong adoption + referrals)
Jobs:  8,000 jobs (avg. $900) → GMV $7.2M.
Take‑rate revenue:  6% average → $432k.
Deposits:  12k deposits × $39 → $468k.
Contractor subscriptions:  200 contractors × $79/mo × 12 mo → $190k.
Property manager SaaS:  200 accounts × $49/mo × 12 mo → $118k.
Total revenue:  ~$1.2M .
Deposits are a major revenue line and a quality control lever . Without them the platform will struggle to
enforce reliability and cover basic costs.
8. Execution Roadmap (First 90 Days)
Days 0–30 – Core Promise & Controls
Implement estimate deposit flow  (custom API + UI).
Enable milestone payments  and ensure partial releases are possible. •
•
•
•
•
1
•
1
1
•
•
•
•
•
•
•
•
•
•
•
•
•
5

## Page 6

Build reliability scoring  engine using no‑show rate and response times.
Finish core UX polish (copy consistency and EN/ES i18n) .
Days 31–60 – Repeat Buyers
Onboard 20–50 property managers and STR operators.
Provide them with consolidated billing and dispatch SLAs.
Launch referral program for small commercial clients.
Days 61–90 – Scaling & Metrics Review
Expand to additional municipalities only if key KPIs are healthy (no‑show <10%, quote‑to‑book >40%,
repeat rate >25%).
Activate growth modules (promotions, referrals) once reliability metrics are stable and enable
credential verification to boost trust.
9. Prototype Gaps & Recommended Fixes
The  current  GitHub  prototype  (as  of  February   2026)  is  impressive  but  omits  several  critical  features
necessary for market success.
Gap Evidence from repo Recommended fix
No deposit or
booking fee
functionalityThe API supports fundHold  (holding full
project funds) but there is no function for
collecting small deposits for estimates or
bookings .Build a createEstimateDeposit
callable function; extend data
models to record deposit amounts
and link to projects; implement
refund and credit logic; update
client UI to collect deposit on quote
request.
Mock
payments
only; real
payments
disabledMVP uses MockPaymentProvider , and
the Stripe Connect provider is stubbed
behind a feature flag .Integrate Stripe Connect or a local
payment rail (e.g., ATH Móvil) and
remove the mock fallback; update
Firestore to handle real
transactions; perform compliance
review.
Credential
verification
absentContractor profiles can store licenses and
certifications but there is no automated
verification and the
credentialVerificationEnabled
feature flag defaults to false .Build a verification workflow that
captures DACO registration
numbers and perito licences,
validates them against government
databases, updates credentials’
status and displays badges; enable
the flag.•
• 9
•
•
•
•
•
6
210
45
6

## Page 7

Gap Evidence from repo Recommended fix
Scheduling
and no‑show
penalties not
implementedThe createBookingRequest  and
respondBookingRequest  functions exist
but are gated by the schedulingEnabled
flag .Activate these functions; tie
appointment confirmation to the
deposit; record attendance and
enforce penalties for no‑shows; add
calendar integration and
reminders.
Subscription
plans &
property
manager
features
missingPlatform fees are globally configured as a
simple percentage + fixed fee ; there are
no subscription plans or property manager
modules.Extend PlatformFeeConfig  to
support tiered fees; add
subscriptionPlans  in config;
build SaaS billing and UI for
contractors/property managers;
implement recurring billing.
Growth and
referral
modules
disabledgrowthEnabled  is false by default, and
there is no UI for referrals, promotions or
featured listings .Implement growth endpoints:
adminSetPromotion ,
applyReferralCode ,
listFeaturedListings ; build
UI for promotions and referrals;
enable the feature flag.
UX and i18n
polish
incompleteThe workplan notes that mobile UX polish is
in progress .Finalise copy, ensure all new
features have bilingual text, use
simple flows, provide clear deposit
and dispute explanations, and test
extensively on low‑bandwidth
devices.
10. Summary & Next Steps
A successful launch in Puerto Rico requires combining payment safety with a structured workflow and
real  enforcement .  Customers  will  adopt  only  if  deposit  and  completion  flows  are  transparent,  while
contractors will participate only if they can receive materials money along the way. Build reliability scoring
and strong proof requirements to make sure you do not recreate the problem you are trying to solve. Focus
on  the  segments  with  the  highest  pain  (property  managers,  STRs,  small  commercial)  before  pushing
volume.
For development, the immediate priorities are implementing the  estimate deposit , enabling  milestone
payments , integrating a real payment provider , and adding credential verification . These changes will
allow the two‑person team to test the marketplace with real money and verify that reliability incentives
work before expanding further .
README.md
https://github.com/gex82/trustvibe_app/blob/9091673309638817c3114770cc72d78e1d05015c/README.md8
7
4 11
9
1
7

## Page 8

architecture.md
https://github.com/gex82/trustvibe_app/blob/main/docs/architecture.md
featureFlags.ts
https://github.com/gex82/trustvibe_app/blob/main/packages/shared/src/featureFlags.ts
types.ts
https://github.com/gex82/trustvibe_app/blob/main/packages/shared/src/types.ts
api.md
https://github.com/gex82/trustvibe_app/blob/main/docs/api.md
fees.ts
https://github.com/gex82/trustvibe_app/blob/main/packages/shared/src/fees.ts
workplan.md
https://github.com/gex82/trustvibe_app/blob/main/docs/workplan.md
assumptions.md
https://github.com/gex82/trustvibe_app/blob/main/docs/assumptions.md2 3
4
5
6 811
7
9
10
8

