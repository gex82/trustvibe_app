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
    type: 'license' | 'insurance' | 'certification';
    fileUrl: string;
    status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
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
  description: string;
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
  | 'RELEASE_FULL'
  | 'RELEASE_PARTIAL'
  | 'REFUND_FULL'
  | 'REFUND_PARTIAL'
  | 'PLATFORM_FEE_CHARGED'
  | 'JOINT_RELEASE_PROPOSED'
  | 'JOINT_RELEASE_SIGNED'
  | 'EXTERNAL_RESOLUTION_SUBMITTED'
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
  milestonePaymentsEnabled: boolean;
  changeOrdersEnabled: boolean;
  credentialVerificationEnabled: boolean;
  schedulingEnabled: boolean;
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
