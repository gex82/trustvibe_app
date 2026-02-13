export type Role = 'customer' | 'contractor' | 'admin';

export type EscrowState =
  | 'DRAFT'
  | 'OPEN_FOR_QUOTES'
  | 'CONTRACTOR_SELECTED'
  | 'AGREEMENT_ACCEPTED'
  | 'FUNDED_HELD'
  | 'IN_PROGRESS'
  | 'COMPLETION_REQUESTED'
  | 'APPROVED_FOR_RELEASE'
  | 'RELEASED_PAID'
  | 'ISSUE_RAISED_HOLD'
  | 'RESOLUTION_PENDING_EXTERNAL'
  | 'RESOLUTION_SUBMITTED'
  | 'EXECUTED_RELEASE_FULL'
  | 'EXECUTED_RELEASE_PARTIAL'
  | 'EXECUTED_REFUND_PARTIAL'
  | 'EXECUTED_REFUND_FULL'
  | 'CLOSED'
  | 'CANCELLED';

export type ProjectCategory =
  | 'plumbing'
  | 'electrical'
  | 'painting'
  | 'roofing'
  | 'carpentry'
  | 'hvac'
  | 'landscaping'
  | 'cleaning'
  | 'general';

export type Municipality = string;

export interface User {
  id: string;
  role: Role;
  email: string;
  name: string;
  phone?: string;
  municipality?: Municipality;
  profilePhotoUrl?: string;
  notificationPreferences?: {
    push: boolean;
    email: boolean;
  };
  disabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorProfile {
  userId: string;
  skills: string[];
  serviceMunicipalities: Municipality[];
  serviceRadiusKm?: number;
  portfolio: Array<{ imageUrl: string; caption: string }>;
  credentials: Array<{
    type: 'license' | 'insurance' | 'certification' | 'daco_registration' | 'perito_license';
    identifier?: string;
    fileUrl: string;
    status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
    source?: 'manual' | 'provider_lookup';
    expiresAt?: string;
    verifiedAt?: string;
    verificationId?: string;
  }>;
  availability: {
    weekly: Record<string, Array<{ start: string; end: string }>>;
    blackoutDates: string[];
  };
  ratingAvg?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  userId: string;
  preferredMunicipality?: Municipality;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  customerId: string;
  contractorId?: string;
  category: ProjectCategory;
  title: string;
  titleEn?: string;
  titleEs?: string;
  description: string;
  descriptionEn?: string;
  descriptionEs?: string;
  photos: string[];
  municipality: Municipality;
  desiredTimeline: string;
  budgetMinCents?: number;
  budgetMaxCents?: number;
  escrowState: EscrowState;
  selectedQuoteId?: string;
  agreementId?: string;
  completionRequestedAt?: string;
  issueRaisedAt?: string;
  estimateDepositId?: string;
  estimateDepositCreditCents?: number;
  milestonePlanRequired?: boolean;
  highTicket?: boolean;
  reliabilityGateBypassed?: boolean;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  projectId: string;
  contractorId: string;
  priceCents: number;
  timelineDays: number;
  scopeNotes: string;
  lineItems?: Array<{ description: string; amountCents: number }>;
  status: 'SUBMITTED' | 'SELECTED' | 'DECLINED';
  createdAt: string;
  updatedAt: string;
}

export interface AgreementSnapshot {
  id: string;
  projectId: string;
  customerId: string;
  contractorId: string;
  scopeSummary: string;
  priceCents: number;
  timelineDays: number;
  policySummary: string;
  feeDisclosure: string;
  changeScopeGuidance: string;
  agreementVersion: string;
  acceptedByCustomerAt?: string;
  acceptedByContractorAt?: string;
  createdAt: string;
}

export type LedgerEventType =
  | 'HOLD_CREATED'
  | 'ESTIMATE_DEPOSIT_CREATED'
  | 'ESTIMATE_DEPOSIT_CAPTURED'
  | 'ESTIMATE_DEPOSIT_REFUNDED'
  | 'ESTIMATE_DEPOSIT_CREDITED'
  | 'RELEASE_FULL'
  | 'RELEASE_PARTIAL'
  | 'REFUND_FULL'
  | 'REFUND_PARTIAL'
  | 'PLATFORM_FEE_CHARGED'
  | 'MILESTONE_DEFINED'
  | 'JOINT_RELEASE_PROPOSED'
  | 'JOINT_RELEASE_SIGNED'
  | 'EXTERNAL_RESOLUTION_SUBMITTED'
  | 'BOOKING_CREATED'
  | 'BOOKING_ATTENDANCE_RECORDED'
  | 'RELIABILITY_UPDATED'
  | 'SUBSCRIPTION_INVOICE_POSTED'
  | 'CONCIERGE_INTAKE_FEE_CHARGED'
  | 'CONCIERGE_SUCCESS_FEE_CHARGED'
  | 'OUTCOME_EXECUTED'
  | 'AUTO_RELEASE_EXECUTED';

export interface LedgerEvent {
  id: string;
  projectId: string;
  type: LedgerEventType;
  amountCents?: number;
  feeCents?: number;
  actorId: string;
  actorRole: Role;
  metadata?: Record<string, unknown>;
  supportingDocRefs?: string[];
  createdAt: string;
}

export interface JointReleaseProposal {
  id: string;
  projectId: string;
  proposedBy: string;
  releaseToContractorCents: number;
  refundToCustomerCents: number;
  signedByCustomerAt?: string;
  signedByContractorAt?: string;
  status: 'PENDING_SIGNATURES' | 'FULLY_SIGNED' | 'EXECUTED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface CaseRecord {
  id: string;
  projectId: string;
  type: 'ISSUE_HOLD';
  status:
    | 'OPEN'
    | 'WAITING_JOINT_RELEASE'
    | 'WAITING_EXTERNAL_RESOLUTION'
    | 'RESOLUTION_SUBMITTED'
    | 'ADMIN_ATTENTION_REQUIRED'
    | 'CLOSED';
  openedByUserId: string;
  resolutionDocumentUrl?: string;
  resolutionSummary?: string;
  adminAttentionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  projectId: string;
  customerId: string;
  contractorId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: string;
  feedbackEn?: string;
  feedbackEs?: string;
  tags: Array<'quality' | 'communication' | 'timeliness'>;
  verified: boolean;
  flagged: boolean;
  moderationStatus: 'VISIBLE' | 'HIDDEN' | 'REMOVED';
  moderationReason?: string;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  projectId: string;
  senderId: string;
  body: string;
  bodyEn?: string;
  bodyEs?: string;
  attachments: string[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  amountCents: number;
  acceptanceCriteria: string;
  dueDate?: string;
  status: 'PENDING' | 'RELEASED';
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  proposedByUserId: string;
  scopeSummary: string;
  amountDeltaCents: number;
  timelineDeltaDays: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  acceptedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRequest {
  id: string;
  projectId: string;
  customerId: string;
  contractorId: string;
  startAt: string;
  endAt: string;
  note?: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  estimateDepositId?: string;
  customerAttendanceAt?: string;
  contractorAttendanceAt?: string;
  noShowBy?: 'customer' | 'contractor';
  respondedByUserId?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationItem {
  id: string;
  type: 'contractor' | 'project';
  score: number;
  reason: string;
  contractorId?: string;
  projectId?: string;
}

export interface Promotion {
  code: string;
  type: 'referral' | 'coupon' | 'featured';
  percentOffBps?: number;
  amountOffCents?: number;
  featuredContractorId?: string;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PlatformFeeConfig {
  percentBps: number;
  fixedFeeCents: number;
  tiers?: FeeTier[];
  schemaVersion?: number;
  updatedAt: string;
  updatedBy: string;
}

export interface FeeTier {
  id: string;
  minAmountCents: number;
  maxAmountCents?: number;
  percentBps: number;
  fixedFeeCents: number;
  planOverrides?: Record<
    string,
    {
      percentBps?: number;
      fixedFeeCents?: number;
    }
  >;
}

export interface PlatformFeeConfigV2 {
  schemaVersion: number;
  tiers: FeeTier[];
  updatedAt: string;
  updatedBy: string;
}

export interface DepositPolicyRule {
  category: ProjectCategory;
  amountCents: number;
  currency: 'USD';
  refundableOnContractorNoShow: boolean;
  creditToJobOnProceed: boolean;
}

export interface DepositPolicyConfig {
  schemaVersion: number;
  rules: DepositPolicyRule[];
  updatedAt: string;
  updatedBy: string;
}

export interface SubscriptionPlanDefinition {
  id: string;
  audience: 'contractor' | 'property_manager';
  name: string;
  monthlyPriceCents: number;
  annualPriceCents?: number;
  includedUnits?: number;
  overageUnitPriceCents?: number;
  featureCodes: string[];
  active: boolean;
}

export interface SubscriptionPlansConfig {
  schemaVersion: number;
  plans: SubscriptionPlanDefinition[];
  updatedAt: string;
  updatedBy: string;
}

export interface ReliabilityWeightConfig {
  schemaVersion: number;
  showUpRateWeight: number;
  responseTimeWeight: number;
  disputeFrequencyWeight: number;
  proofCompletenessWeight: number;
  onTimeCompletionWeight: number;
  autoReleaseThreshold: number;
  largeJobThreshold: number;
  highTicketThreshold: number;
  updatedAt: string;
  updatedBy: string;
}

export interface HighTicketPolicyConfig {
  schemaVersion: number;
  thresholdCents: number;
  feeMode: 'intake_success' | 'contractor_referral';
  intakeFeeCents: number;
  successFeeBps: number;
  contractorReferralFeeBps: number;
  updatedAt: string;
  updatedBy: string;
}

export interface HoldPolicyConfig {
  approvalWindowDays: number;
  adminAttentionDays: number;
  autoReleaseEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface FeatureFlags {
  stripeConnectEnabled: boolean;
  estimateDepositsEnabled: boolean;
  milestonePaymentsEnabled: boolean;
  changeOrdersEnabled: boolean;
  credentialVerificationEnabled: boolean;
  schedulingEnabled: boolean;
  reliabilityScoringEnabled: boolean;
  subscriptionsEnabled: boolean;
  highTicketConciergeEnabled: boolean;
  recommendationsEnabled: boolean;
  growthEnabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditAction {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface EstimateDeposit {
  id: string;
  projectId: string;
  customerId: string;
  contractorId: string;
  category: ProjectCategory;
  amountCents: number;
  currency: 'USD';
  status:
    | 'CREATED'
    | 'CAPTURED'
    | 'CONTRACTOR_ATTENDED'
    | 'CUSTOMER_ATTENDED'
    | 'CONTRACTOR_NO_SHOW'
    | 'CUSTOMER_NO_SHOW'
    | 'REFUNDED'
    | 'CREDITED_TO_JOB'
    | 'CLOSED';
  providerHoldId?: string;
  refundedAt?: string;
  creditedAt?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  updatedBy: string;
}

export interface PaymentAccount {
  userId: string;
  provider: 'stripe' | 'ath_movil' | 'mock';
  providerAccountId: string;
  onboardingStatus: 'NOT_STARTED' | 'PENDING' | 'ACTIVE' | 'RESTRICTED';
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  lastOnboardingLink?: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ReliabilityScore {
  contractorId: string;
  score: number;
  metrics: {
    showUpRate: number;
    responseTimeScore: number;
    disputeScore: number;
    proofScore: number;
    onTimeScore: number;
  };
  counters: {
    appointmentsTotal: number;
    appointmentsAttended: number;
    disputesTotal: number;
    completionsTotal: number;
    completionsOnTime: number;
    proofSubmissionsTotal: number;
    proofSubmissionsComplete: number;
    responseSamples: number;
    responseMedianMinutes: number;
  };
  eligibility: {
    autoRelease: boolean;
    largeJobs: boolean;
    highTicket: boolean;
  };
  schemaVersion: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CredentialVerification {
  id: string;
  contractorId: string;
  credentialType: 'daco_registration' | 'perito_license';
  identifier: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'MANUAL_REVIEW';
  source: 'mock_provider' | 'live_provider' | 'manual_admin';
  matchedName?: string;
  expiresAt?: string;
  verificationDetails?: Record<string, unknown>;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Subscription {
  id: string;
  accountId: string;
  audience: 'contractor' | 'property_manager';
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  provider: 'stripe' | 'mock';
  providerSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  unitCount?: number;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface BillingInvoice {
  id: string;
  subscriptionId: string;
  accountId: string;
  provider: 'stripe' | 'mock';
  providerInvoiceId?: string;
  amountCents: number;
  currency: 'USD';
  status: 'draft' | 'open' | 'paid' | 'void';
  lineItems: Array<{ code: string; description: string; amountCents: number }>;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface HighTicketCase {
  id: string;
  projectId: string;
  customerId: string;
  contractorId?: string;
  conciergeManagerId?: string;
  status: 'INTAKE' | 'BIDDING' | 'MILESTONE_SETUP' | 'READY_TO_FUND' | 'IN_PROGRESS' | 'CLOSED';
  intakeNotes: string;
  preferredStartDate?: string;
  intakeFeeCents: number;
  successFeeBps: number;
  referralFeeBps?: number;
  bidsCount: number;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}
