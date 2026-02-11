"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectInputSchema = exports.listQuotesInputSchema = exports.listProjectsInputSchema = exports.adminSetConfigInputSchema = exports.adminModerateReviewInputSchema = exports.flagReviewInputSchema = exports.submitReviewInputSchema = exports.adminExecuteOutcomeInputSchema = exports.uploadResolutionDocumentInputSchema = exports.signJointReleaseInputSchema = exports.proposeJointReleaseInputSchema = exports.raiseIssueHoldInputSchema = exports.approveReleaseInputSchema = exports.requestCompletionInputSchema = exports.fundHoldInputSchema = exports.acceptAgreementInputSchema = exports.selectContractorInputSchema = exports.submitQuoteInputSchema = exports.createProjectInputSchema = exports.projectCategorySchema = exports.escrowStateSchema = exports.roleSchema = void 0;
const zod_1 = require("zod");
exports.roleSchema = zod_1.z.enum(['customer', 'contractor', 'admin']);
exports.escrowStateSchema = zod_1.z.enum([
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
exports.projectCategorySchema = zod_1.z.enum([
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
exports.createProjectInputSchema = zod_1.z.object({
    category: exports.projectCategorySchema,
    title: zod_1.z.string().min(3).max(120),
    description: zod_1.z.string().min(10).max(3000),
    photos: zod_1.z.array(zod_1.z.string().url()).max(10).default([]),
    municipality: zod_1.z.string().min(2).max(80),
    desiredTimeline: zod_1.z.string().min(2).max(120),
    budgetMinCents: zod_1.z.number().int().positive().optional(),
    budgetMaxCents: zod_1.z.number().int().positive().optional(),
});
exports.submitQuoteInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    priceCents: zod_1.z.number().int().positive(),
    timelineDays: zod_1.z.number().int().positive().max(365),
    scopeNotes: zod_1.z.string().min(5).max(2000),
    lineItems: zod_1.z
        .array(zod_1.z.object({
        description: zod_1.z.string().min(1).max(200),
        amountCents: zod_1.z.number().int().positive(),
    }))
        .max(25)
        .optional(),
});
exports.selectContractorInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    quoteId: zod_1.z.string().min(1),
});
exports.acceptAgreementInputSchema = zod_1.z.object({
    agreementId: zod_1.z.string().min(1),
});
exports.fundHoldInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    paymentMethodId: zod_1.z.string().min(1).optional(),
});
exports.requestCompletionInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    proofPhotoUrls: zod_1.z.array(zod_1.z.string().url()).max(10).optional(),
    note: zod_1.z.string().max(1000).optional(),
});
exports.approveReleaseInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
});
exports.raiseIssueHoldInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    reason: zod_1.z.string().min(5).max(2000),
});
exports.proposeJointReleaseInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    releaseToContractorCents: zod_1.z.number().int().min(0),
    refundToCustomerCents: zod_1.z.number().int().min(0),
});
exports.signJointReleaseInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    proposalId: zod_1.z.string().min(1),
});
exports.uploadResolutionDocumentInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    documentUrl: zod_1.z.string().url(),
    resolutionType: zod_1.z.enum(['court_order', 'mediator_decision', 'signed_settlement']),
    summary: zod_1.z.string().min(5).max(2000),
});
exports.adminExecuteOutcomeInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    caseId: zod_1.z.string().min(1),
    outcomeType: zod_1.z.enum(['release_full', 'release_partial', 'refund_partial', 'refund_full']),
    releaseToContractorCents: zod_1.z.number().int().min(0),
    refundToCustomerCents: zod_1.z.number().int().min(0),
    docReference: zod_1.z.string().min(1),
});
exports.submitReviewInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
    rating: zod_1.z.number().int().min(1).max(5),
    feedback: zod_1.z.string().min(3).max(2000),
    tags: zod_1.z.array(zod_1.z.enum(['quality', 'communication', 'timeliness'])).max(3),
});
exports.flagReviewInputSchema = zod_1.z.object({
    reviewId: zod_1.z.string().min(1),
    reason: zod_1.z.string().min(3).max(300),
});
exports.adminModerateReviewInputSchema = zod_1.z.object({
    reviewId: zod_1.z.string().min(1),
    moderationStatus: zod_1.z.enum(['VISIBLE', 'HIDDEN', 'REMOVED']),
    reason: zod_1.z.string().min(3).max(300),
});
exports.adminSetConfigInputSchema = zod_1.z.object({
    platformFees: zod_1.z
        .object({
        percentBps: zod_1.z.number().int().min(0).max(5000),
        fixedFeeCents: zod_1.z.number().int().min(0).max(100000),
    })
        .optional(),
    holdPolicy: zod_1.z
        .object({
        approvalWindowDays: zod_1.z.number().int().min(1).max(30),
        adminAttentionDays: zod_1.z.number().int().min(7).max(180),
        autoReleaseEnabled: zod_1.z.boolean(),
    })
        .optional(),
    featureFlags: zod_1.z
        .object({
        stripeConnectEnabled: zod_1.z.boolean(),
        milestonePaymentsEnabled: zod_1.z.boolean(),
        changeOrdersEnabled: zod_1.z.boolean(),
        credentialVerificationEnabled: zod_1.z.boolean(),
        schedulingEnabled: zod_1.z.boolean(),
        recommendationsEnabled: zod_1.z.boolean(),
        growthEnabled: zod_1.z.boolean(),
    })
        .optional(),
});
exports.listProjectsInputSchema = zod_1.z.object({
    mineOnly: zod_1.z.boolean().optional(),
    municipality: zod_1.z.string().optional(),
    category: exports.projectCategorySchema.optional(),
    budgetMinCents: zod_1.z.number().int().optional(),
    budgetMaxCents: zod_1.z.number().int().optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(25),
});
exports.listQuotesInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
});
exports.getProjectInputSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1),
});
