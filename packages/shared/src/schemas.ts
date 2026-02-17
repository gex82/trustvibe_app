import { z } from 'zod';

export const roleSchema = z.enum(['customer', 'contractor', 'admin']);

export const escrowStateSchema = z.enum([
  'DRAFT',
  'OPEN_FOR_QUOTES',
  'CONTRACTOR_SELECTED',
  'AGREEMENT_ACCEPTED',
  'FUNDED_HELD',
  'IN_PROGRESS',
  'COMPLETION_REQUESTED',
  'APPROVED_FOR_RELEASE',
  'RELEASED_PAID',
  'ISSUE_RAISED_HOLD',
  'RESOLUTION_PENDING_EXTERNAL',
  'RESOLUTION_SUBMITTED',
  'EXECUTED_RELEASE_FULL',
  'EXECUTED_RELEASE_PARTIAL',
  'EXECUTED_REFUND_PARTIAL',
  'EXECUTED_REFUND_FULL',
  'CLOSED',
  'CANCELLED',
]);

export const projectCategorySchema = z.enum([
  'plumbing',
  'electrical',
  'painting',
  'roofing',
  'carpentry',
  'hvac',
  'landscaping',
  'cleaning',
  'general',
]);

export const createProjectInputSchema = z.object({
  category: projectCategorySchema,
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(3000),
  photos: z.array(z.string().url()).max(10).default([]),
  municipality: z.string().min(2).max(80),
  desiredTimeline: z.string().min(2).max(120),
  budgetMinCents: z.number().int().positive().optional(),
  budgetMaxCents: z.number().int().positive().optional(),
});

export const submitQuoteInputSchema = z.object({
  projectId: z.string().min(1),
  priceCents: z.number().int().positive(),
  timelineDays: z.number().int().positive().max(365),
  scopeNotes: z.string().min(5).max(2000),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1).max(200),
        amountCents: z.number().int().positive(),
      })
    )
    .max(25)
    .optional(),
});

export const selectContractorInputSchema = z.object({
  projectId: z.string().min(1),
  quoteId: z.string().min(1),
});

export const acceptAgreementInputSchema = z.object({
  agreementId: z.string().min(1),
  demoAutoAdvance: z.boolean().optional(),
});

export const fundHoldInputSchema = z.object({
  projectId: z.string().min(1),
  paymentMethodId: z.string().min(1).optional(),
});

export const requestCompletionInputSchema = z.object({
  projectId: z.string().min(1),
  proofPhotoUrls: z.array(z.string().url()).max(10).optional(),
  note: z.string().max(1000).optional(),
});

export const approveReleaseInputSchema = z.object({
  projectId: z.string().min(1),
});

export const raiseIssueHoldInputSchema = z.object({
  projectId: z.string().min(1),
  reason: z.string().min(5).max(2000),
});

export const proposeJointReleaseInputSchema = z.object({
  projectId: z.string().min(1),
  releaseToContractorCents: z.number().int().min(0),
  refundToCustomerCents: z.number().int().min(0),
});

export const signJointReleaseInputSchema = z.object({
  projectId: z.string().min(1),
  proposalId: z.string().min(1),
});

export const uploadResolutionDocumentInputSchema = z.object({
  projectId: z.string().min(1),
  documentUrl: z.string().url(),
  resolutionType: z.enum(['court_order', 'mediator_decision', 'signed_settlement']),
  summary: z.string().min(5).max(2000),
});

export const adminExecuteOutcomeInputSchema = z.object({
  projectId: z.string().min(1),
  caseId: z.string().min(1),
  outcomeType: z.enum(['release_full', 'release_partial', 'refund_partial', 'refund_full']),
  releaseToContractorCents: z.number().int().min(0),
  refundToCustomerCents: z.number().int().min(0),
  docReference: z.string().min(1),
});

export const submitReviewInputSchema = z.object({
  projectId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().min(3).max(2000),
  tags: z.array(z.enum(['quality', 'communication', 'timeliness'])).max(3),
});

export const flagReviewInputSchema = z.object({
  reviewId: z.string().min(1),
  reason: z.string().min(3).max(300),
});

export const adminModerateReviewInputSchema = z.object({
  reviewId: z.string().min(1),
  moderationStatus: z.enum(['VISIBLE', 'HIDDEN', 'REMOVED']),
  reason: z.string().min(3).max(300),
});

export const adminSetConfigInputSchema = z.object({
  platformFees: z
    .object({
      percentBps: z.number().int().min(0).max(5000),
      fixedFeeCents: z.number().int().min(0).max(100000),
    })
    .optional(),
  platformFeesV2: z
    .object({
      schemaVersion: z.number().int().min(1).default(2),
      tiers: z
        .array(
          z.object({
            id: z.string().min(1).max(80),
            minAmountCents: z.number().int().min(0),
            maxAmountCents: z.number().int().positive().optional(),
            percentBps: z.number().int().min(0).max(5000),
            fixedFeeCents: z.number().int().min(0).max(200000),
            planOverrides: z
              .record(
                z.object({
                  percentBps: z.number().int().min(0).max(5000).optional(),
                  fixedFeeCents: z.number().int().min(0).max(200000).optional(),
                })
              )
              .optional(),
          })
        )
        .min(1),
    })
    .optional(),
  depositPolicies: z
    .object({
      schemaVersion: z.number().int().min(1).default(1),
      rules: z
        .array(
          z.object({
            category: projectCategorySchema,
            amountCents: z.number().int().positive(),
            currency: z.literal('USD').default('USD'),
            refundableOnContractorNoShow: z.boolean(),
            creditToJobOnProceed: z.boolean(),
          })
        )
        .min(1),
    })
    .optional(),
  subscriptionPlans: z
    .object({
      schemaVersion: z.number().int().min(1).default(1),
      plans: z
        .array(
          z.object({
            id: z.string().min(1).max(80),
            audience: z.enum(['contractor', 'property_manager']),
            name: z.string().min(1).max(120),
            monthlyPriceCents: z.number().int().min(0),
            annualPriceCents: z.number().int().min(0).optional(),
            includedUnits: z.number().int().min(0).optional(),
            overageUnitPriceCents: z.number().int().min(0).optional(),
            featureCodes: z.array(z.string().min(1)).max(50),
            active: z.boolean(),
          })
        )
        .min(1),
    })
    .optional(),
  reliabilityWeights: z
    .object({
      schemaVersion: z.number().int().min(1).default(1),
      showUpRateWeight: z.number().min(0).max(1),
      responseTimeWeight: z.number().min(0).max(1),
      disputeFrequencyWeight: z.number().min(0).max(1),
      proofCompletenessWeight: z.number().min(0).max(1),
      onTimeCompletionWeight: z.number().min(0).max(1),
      autoReleaseThreshold: z.number().int().min(0).max(100),
      largeJobThreshold: z.number().int().min(0).max(100),
      highTicketThreshold: z.number().int().min(0).max(100),
    })
    .optional(),
  highTicketPolicy: z
    .object({
      schemaVersion: z.number().int().min(1).default(1),
      thresholdCents: z.number().int().positive(),
      feeMode: z.enum(['intake_success', 'contractor_referral']),
      intakeFeeCents: z.number().int().min(0),
      successFeeBps: z.number().int().min(0).max(5000),
      contractorReferralFeeBps: z.number().int().min(0).max(5000),
    })
    .optional(),
  holdPolicy: z
    .object({
      approvalWindowDays: z.number().int().min(1).max(30),
      adminAttentionDays: z.number().int().min(7).max(180),
      autoReleaseEnabled: z.boolean(),
    })
    .optional(),
  featureFlags: z
    .object({
      stripeConnectEnabled: z.boolean().optional(),
      estimateDepositsEnabled: z.boolean().optional(),
      milestonePaymentsEnabled: z.boolean().optional(),
      changeOrdersEnabled: z.boolean().optional(),
      credentialVerificationEnabled: z.boolean().optional(),
      schedulingEnabled: z.boolean().optional(),
      reliabilityScoringEnabled: z.boolean().optional(),
      subscriptionsEnabled: z.boolean().optional(),
      highTicketConciergeEnabled: z.boolean().optional(),
      recommendationsEnabled: z.boolean().optional(),
      growthEnabled: z.boolean().optional(),
    })
    .optional(),
});

export const listProjectsInputSchema = z.object({
  mineOnly: z.boolean().optional(),
  municipality: z.string().optional(),
  category: projectCategorySchema.optional(),
  budgetMinCents: z.number().int().optional(),
  budgetMaxCents: z.number().int().optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

export const listQuotesInputSchema = z.object({
  projectId: z.string().min(1),
});

export const getProjectInputSchema = z.object({
  projectId: z.string().min(1),
});

export const listMessagesInputSchema = z.object({
  projectId: z.string().min(1),
  limit: z.number().int().min(1).max(200).default(100),
});

export const sendMessageInputSchema = z.object({
  projectId: z.string().min(1),
  body: z.string().min(1).max(4000),
  attachments: z.array(z.string().url()).max(5).default([]),
});

export const createMilestonesInputSchema = z.object({
  projectId: z.string().min(1),
  milestones: z
    .array(
      z.object({
        title: z.string().min(2).max(120),
        amountCents: z.number().int().positive(),
        acceptanceCriteria: z.string().min(3).max(1200),
        dueDate: z.string().optional(),
      })
    )
    .min(1)
    .max(20),
});

export const approveMilestoneInputSchema = z.object({
  projectId: z.string().min(1),
  milestoneId: z.string().min(1),
});

export const proposeChangeOrderInputSchema = z.object({
  projectId: z.string().min(1),
  scopeSummary: z.string().min(5).max(2000),
  amountDeltaCents: z.number().int().min(-10000000).max(10000000),
  timelineDeltaDays: z.number().int().min(-365).max(365),
});

export const acceptChangeOrderInputSchema = z.object({
  projectId: z.string().min(1),
  changeOrderId: z.string().min(1),
  accept: z.boolean(),
});

export const createBookingRequestInputSchema = z.object({
  projectId: z.string().min(1),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  estimateDepositId: z.string().min(1).optional(),
  note: z.string().max(1000).optional(),
});

export const respondBookingRequestInputSchema = z.object({
  projectId: z.string().min(1),
  bookingRequestId: z.string().min(1),
  response: z.enum(['confirm', 'decline']),
});

export const getRecommendationsInputSchema = z.object({
  target: z.enum(['customer', 'contractor']).optional(),
  municipality: z.string().optional(),
  category: projectCategorySchema.optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

export const applyReferralCodeInputSchema = z.object({
  code: z.string().min(3).max(40),
  projectId: z.string().min(1).optional(),
});

export const adminSetPromotionInputSchema = z.object({
  code: z.string().min(3).max(40),
  type: z.enum(['referral', 'coupon', 'featured']),
  percentOffBps: z.number().int().min(0).max(5000).optional(),
  amountOffCents: z.number().int().min(0).max(200000).optional(),
  featuredContractorId: z.string().min(1).optional(),
  active: z.boolean(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export const listFeaturedListingsInputSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
});

export const adminSetUserRoleInputSchema = z.object({
  userId: z.string().min(1),
  role: roleSchema,
  disabled: z.boolean().optional(),
});

export const createEstimateDepositInputSchema = z.object({
  projectId: z.string().min(1),
  category: projectCategorySchema.optional(),
  appointmentStartAt: z.string().datetime().optional(),
});

export const previewEstimateDepositInputSchema = z.object({
  projectId: z.string().min(1),
  category: projectCategorySchema.optional(),
});

export const captureEstimateDepositInputSchema = z.object({
  depositId: z.string().min(1),
  paymentMethodId: z.string().min(1).optional(),
});

export const markEstimateAttendanceInputSchema = z.object({
  depositId: z.string().min(1),
  attendance: z.enum(['customer_present', 'contractor_present', 'customer_no_show', 'contractor_no_show']),
  note: z.string().max(500).optional(),
});

export const refundEstimateDepositInputSchema = z.object({
  depositId: z.string().min(1),
  reason: z.string().min(3).max(500),
});

export const applyEstimateDepositToJobInputSchema = z.object({
  projectId: z.string().min(1),
  depositId: z.string().min(1),
});

export const createConnectedPaymentAccountInputSchema = z.object({
  country: z.string().min(2).max(2).default('US'),
  type: z.enum(['express', 'standard']).default('express'),
});

export const getPaymentOnboardingLinkInputSchema = z.object({
  accountId: z.string().min(1).optional(),
  returnUrl: z.string().url().optional(),
  refreshUrl: z.string().url().optional(),
});

export const recordBookingAttendanceInputSchema = z.object({
  projectId: z.string().min(1),
  bookingRequestId: z.string().min(1),
  attendeeRole: z.enum(['customer', 'contractor']),
  attended: z.boolean(),
  note: z.string().max(500).optional(),
});

export const getReliabilityScoreInputSchema = z.object({
  contractorId: z.string().min(1).optional(),
});

export const submitCredentialForVerificationInputSchema = z.object({
  credentialType: z.enum(['daco_registration', 'perito_license']),
  identifier: z.string().min(3).max(120),
  documentUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const verifyCredentialInputSchema = z.object({
  verificationId: z.string().min(1),
});

export const createSubscriptionInputSchema = z.object({
  audience: z.enum(['contractor', 'property_manager']),
  planId: z.string().min(1),
  billingEmail: z.string().email().optional(),
  unitCount: z.number().int().min(1).max(10000).optional(),
});

export const updateSubscriptionInputSchema = z.object({
  subscriptionId: z.string().min(1),
  planId: z.string().min(1).optional(),
  unitCount: z.number().int().min(1).max(10000).optional(),
});

export const cancelSubscriptionInputSchema = z.object({
  subscriptionId: z.string().min(1),
  cancelAtPeriodEnd: z.boolean().default(true),
});

export const listInvoicesInputSchema = z.object({
  subscriptionId: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(100).default(30),
});

export const createHighTicketCaseInputSchema = z.object({
  projectId: z.string().min(1),
  intakeNotes: z.string().min(10).max(3000),
  preferredStartDate: z.string().datetime().optional(),
});

export const submitConciergeBidInputSchema = z.object({
  caseId: z.string().min(1),
  projectId: z.string().min(1),
  amountCents: z.number().int().positive(),
  milestoneTemplate: z
    .array(
      z.object({
        title: z.string().min(2).max(120),
        amountCents: z.number().int().positive(),
        acceptanceCriteria: z.string().min(3).max(1200),
      })
    )
    .max(15)
    .optional(),
});

export const assignConciergeManagerInputSchema = z.object({
  caseId: z.string().min(1),
  adminUserId: z.string().min(1),
});
