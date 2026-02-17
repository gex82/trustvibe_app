import type {
  AgreementSnapshot,
  BookingRequest,
  ChangeOrder,
  CredentialVerification,
  DepositPolicyConfig,
  EstimateDeposit,
  FeatureFlags,
  FeeTier,
  HighTicketCase,
  HighTicketPolicyConfig,
  HoldPolicyConfig,
  MessageItem,
  Milestone,
  PlatformFeeConfig,
  PlatformFeeConfigV2,
  Project,
  Quote,
  RecommendationItem,
  ReliabilityScore,
  ReliabilityWeightConfig,
  Role,
  SubscriptionPlansConfig,
  BillingInvoice,
} from './types';

export type JsonRecord = Record<string, unknown>;

export interface ProjectRecord extends Project {
  selectedQuotePriceCents?: number;
  heldAmountCents?: number;
  providerHoldId?: string;
  milestones?: Array<
    Pick<Milestone, 'id' | 'title' | 'amountCents'> & {
      status?: Milestone['status'] | 'APPROVED' | 'COMPLETED_REQUESTED';
    }
  >;
}

export interface ProjectQuoteRecord extends Quote {
  contractorName?: string;
  contractorAvatarUrl?: string;
  contractorRatingAvg?: number;
  contractorReviewCount?: number;
}

export type CallableContract<Request, Response> = {
  request: Request;
  response: Response;
};

type AdminSetConfigPayload = {
  platformFees?: {
    percentBps: number;
    fixedFeeCents: number;
  };
  platformFeesV2?: {
    schemaVersion: number;
    tiers: FeeTier[];
  };
  depositPolicies?: {
    schemaVersion: number;
    rules: DepositPolicyConfig['rules'];
  };
  subscriptionPlans?: {
    schemaVersion: number;
    plans: SubscriptionPlansConfig['plans'];
  };
  reliabilityWeights?: Omit<ReliabilityWeightConfig, 'updatedAt' | 'updatedBy'>;
  highTicketPolicy?: Omit<HighTicketPolicyConfig, 'updatedAt' | 'updatedBy'>;
  holdPolicy?: Pick<HoldPolicyConfig, 'approvalWindowDays' | 'adminAttentionDays' | 'autoReleaseEnabled'>;
  featureFlags?: Partial<Omit<FeatureFlags, 'updatedAt' | 'updatedBy'>>;
};

type CurrentConfigResponse = {
  fees?: PlatformFeeConfig;
  feesV2?: PlatformFeeConfigV2;
  holdPolicy?: HoldPolicyConfig;
  featureFlags?: FeatureFlags;
  depositPolicies?: DepositPolicyConfig;
  subscriptionPlans?: SubscriptionPlansConfig;
  reliabilityWeights?: ReliabilityWeightConfig;
  highTicketPolicy?: HighTicketPolicyConfig;
};

export interface CallableContracts {
  listProjects: CallableContract<
    {
      mineOnly?: boolean;
      municipality?: string;
      category?: string;
      budgetMinCents?: number;
      budgetMaxCents?: number;
      limit?: number;
    },
    { projects: ProjectRecord[] }
  >;
  createProject: CallableContract<
    {
      category: string;
      title: string;
      description: string;
      photos: string[];
      municipality: string;
      desiredTimeline: string;
      budgetMinCents?: number;
      budgetMaxCents?: number;
    },
    { project: ProjectRecord }
  >;
  getProject: CallableContract<
    { projectId: string },
    {
      project: ProjectRecord;
      quotes: ProjectQuoteRecord[];
      agreement?: AgreementSnapshot;
      estimateDeposit?: EstimateDeposit;
    }
  >;
  submitQuote: CallableContract<
    {
      projectId: string;
      priceCents: number;
      timelineDays: number;
      scopeNotes: string;
      lineItems?: Array<{ description: string; amountCents: number }>;
    },
    { quote: Quote }
  >;
  selectContractor: CallableContract<{ projectId: string; quoteId: string }, { agreementId: string }>;
  acceptAgreement: CallableContract<{ agreementId: string; demoAutoAdvance?: boolean }, { readyToFund: boolean }>;
  fundHold: CallableContract<{ projectId: string; paymentMethodId?: string }, JsonRecord>;
  requestCompletion: CallableContract<{ projectId: string; proofPhotoUrls?: string[]; note?: string }, JsonRecord>;
  approveRelease: CallableContract<{ projectId: string }, JsonRecord>;
  raiseIssueHold: CallableContract<{ projectId: string; reason: string }, JsonRecord>;
  proposeJointRelease: CallableContract<
    {
      projectId: string;
      releaseToContractorCents: number;
      refundToCustomerCents: number;
    },
    { proposalId: string }
  >;
  signJointRelease: CallableContract<{ projectId: string; proposalId: string }, JsonRecord>;
  uploadResolutionDocument: CallableContract<
    {
      projectId: string;
      documentUrl: string;
      resolutionType: 'court_order' | 'mediator_decision' | 'signed_settlement';
      summary: string;
    },
    JsonRecord
  >;
  listMessages: CallableContract<{ projectId: string; limit?: number }, { projectId: string; messages: MessageItem[] }>;
  sendMessage: CallableContract<
    {
      projectId: string;
      body: string;
      attachments?: string[];
    },
    { message: MessageItem }
  >;
  createMilestones: CallableContract<
    {
      projectId: string;
      milestones: Array<{ title: string; amountCents: number; acceptanceCriteria: string; dueDate?: string }>;
    },
    { projectId: string; milestones: Milestone[] }
  >;
  approveMilestone: CallableContract<
    {
      projectId: string;
      milestoneId: string;
    },
    { projectId: string; milestoneId: string; releasedAmountCents: number }
  >;
  proposeChangeOrder: CallableContract<
    {
      projectId: string;
      scopeSummary: string;
      amountDeltaCents: number;
      timelineDeltaDays: number;
    },
    { changeOrder: ChangeOrder }
  >;
  acceptChangeOrder: CallableContract<
    {
      projectId: string;
      changeOrderId: string;
      accept: boolean;
    },
    { changeOrderId: string; status: string }
  >;
  createBookingRequest: CallableContract<
    {
      projectId: string;
      startAt: string;
      endAt: string;
      estimateDepositId?: string;
      note?: string;
    },
    { bookingRequest: BookingRequest }
  >;
  respondBookingRequest: CallableContract<
    {
      projectId: string;
      bookingRequestId: string;
      response: 'confirm' | 'decline';
    },
    { bookingRequestId: string; status: string }
  >;
  recordBookingAttendance: CallableContract<
    {
      projectId: string;
      bookingRequestId: string;
      attendeeRole: 'customer' | 'contractor';
      attended: boolean;
      note?: string;
    },
    { bookingRequestId: string; attended: boolean }
  >;
  createEstimateDeposit: CallableContract<
    {
      projectId: string;
      category?: string;
      appointmentStartAt?: string;
    },
    { deposit: EstimateDeposit }
  >;
  previewEstimateDeposit: CallableContract<
    { projectId: string; category?: string },
    { amountCents: number; currency: 'USD'; category: string; rationale: string }
  >;
  captureEstimateDeposit: CallableContract<{ depositId: string; paymentMethodId?: string }, { deposit: EstimateDeposit }>;
  markEstimateAttendance: CallableContract<
    {
      depositId: string;
      attendance: 'customer_present' | 'contractor_present' | 'customer_no_show' | 'contractor_no_show';
      note?: string;
    },
    { deposit: EstimateDeposit }
  >;
  refundEstimateDeposit: CallableContract<{ depositId: string; reason: string }, { deposit: EstimateDeposit }>;
  applyEstimateDepositToJob: CallableContract<
    {
      projectId: string;
      depositId: string;
    },
    { projectId: string; creditedAmountCents: number }
  >;
  createConnectedPaymentAccount: CallableContract<
    {
      country?: string;
      type?: 'express' | 'standard';
    },
    { paymentAccountId: string; providerAccountId: string }
  >;
  getPaymentOnboardingLink: CallableContract<
    {
      accountId?: string;
      returnUrl?: string;
      refreshUrl?: string;
    },
    { onboardingUrl: string }
  >;
  getReliabilityScore: CallableContract<{ contractorId?: string }, { score: ReliabilityScore }>;
  submitCredentialForVerification: CallableContract<
    {
      credentialType: 'daco_registration' | 'perito_license';
      identifier: string;
      documentUrl?: string;
      expiresAt?: string;
    },
    { verification: CredentialVerification }
  >;
  createSubscription: CallableContract<
    {
      audience: 'contractor' | 'property_manager';
      planId: string;
      billingEmail?: string;
      unitCount?: number;
    },
    { subscriptionId: string }
  >;
  updateSubscription: CallableContract<
    {
      subscriptionId: string;
      planId?: string;
      unitCount?: number;
    },
    { subscriptionId: string; updated: boolean }
  >;
  cancelSubscription: CallableContract<
    {
      subscriptionId: string;
      cancelAtPeriodEnd?: boolean;
    },
    { subscriptionId: string; status: string }
  >;
  listInvoices: CallableContract<{ subscriptionId?: string; limit?: number }, { invoices: BillingInvoice[] }>;
  createHighTicketCase: CallableContract<
    {
      projectId: string;
      intakeNotes: string;
      preferredStartDate?: string;
    },
    { highTicketCase: HighTicketCase }
  >;
  submitConciergeBid: CallableContract<
    {
      caseId: string;
      projectId: string;
      amountCents: number;
      milestoneTemplate?: Array<{ title: string; amountCents: number; acceptanceCriteria: string }>;
    },
    { caseId: string; bidId: string }
  >;
  assignConciergeManager: CallableContract<{ caseId: string; adminUserId: string }, { caseId: string; conciergeManagerId: string }>;
  getRecommendations: CallableContract<
    {
      target?: 'customer' | 'contractor';
      municipality?: string;
      category?: string;
      limit?: number;
    },
    { target: 'customer' | 'contractor'; recommendations: RecommendationItem[] }
  >;
  adminSetPromotion: CallableContract<
    {
      code: string;
      type: 'referral' | 'coupon' | 'featured';
      percentOffBps?: number;
      amountOffCents?: number;
      featuredContractorId?: string;
      active: boolean;
      startsAt?: string;
      endsAt?: string;
    },
    { code: string; active: boolean }
  >;
  applyReferralCode: CallableContract<{ code: string; projectId?: string }, JsonRecord>;
  listFeaturedListings: CallableContract<{ limit?: number }, { featured: Array<JsonRecord> }>;
  submitReview: CallableContract<
    {
      projectId: string;
      rating: number;
      feedback: string;
      tags: Array<'quality' | 'communication' | 'timeliness'>;
    },
    { reviewId: string }
  >;
  adminSetUserRole: CallableContract<
    {
      userId: string;
      role: Role;
      disabled?: boolean;
    },
    {
      userId: string;
      role: Role;
      disabled: boolean;
      claimsSynced: boolean;
    }
  >;
  adminExecuteOutcome: CallableContract<
    {
      projectId: string;
      caseId: string;
      outcomeType: 'release_full' | 'release_partial' | 'refund_partial' | 'refund_full';
      releaseToContractorCents: number;
      refundToCustomerCents: number;
      docReference: string;
    },
    JsonRecord
  >;
  adminSetConfig: CallableContract<AdminSetConfigPayload, { updated: boolean }>;
  getCurrentConfig: CallableContract<Record<string, never>, CurrentConfigResponse>;
  getAdminSession: CallableContract<Record<string, never>, { uid: string; role: Role; adminVerified: boolean }>;
}

export type CallableName = keyof CallableContracts;
export type CallableRequest<TName extends CallableName> = CallableContracts[TName]['request'];
export type CallableResponse<TName extends CallableName> = CallableContracts[TName]['response'];
