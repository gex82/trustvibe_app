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
  holdPolicy: z
    .object({
      approvalWindowDays: z.number().int().min(1).max(30),
      adminAttentionDays: z.number().int().min(7).max(180),
      autoReleaseEnabled: z.boolean(),
    })
    .optional(),
  featureFlags: z
    .object({
      stripeConnectEnabled: z.boolean(),
      milestonePaymentsEnabled: z.boolean(),
      changeOrdersEnabled: z.boolean(),
      credentialVerificationEnabled: z.boolean(),
      schedulingEnabled: z.boolean(),
      recommendationsEnabled: z.boolean(),
      growthEnabled: z.boolean(),
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
