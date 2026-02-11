import { z } from 'zod';
export declare const roleSchema: z.ZodEnum<["customer", "contractor", "admin"]>;
export declare const escrowStateSchema: z.ZodEnum<["DRAFT", "OPEN_FOR_QUOTES", "CONTRACTOR_SELECTED", "AGREEMENT_ACCEPTED", "FUNDED_HELD", "IN_PROGRESS", "COMPLETION_REQUESTED", "APPROVED_FOR_RELEASE", "RELEASED_PAID", "ISSUE_RAISED_HOLD", "RESOLUTION_PENDING_EXTERNAL", "RESOLUTION_SUBMITTED", "EXECUTED_RELEASE_FULL", "EXECUTED_RELEASE_PARTIAL", "EXECUTED_REFUND_PARTIAL", "EXECUTED_REFUND_FULL", "CLOSED", "CANCELLED"]>;
export declare const projectCategorySchema: z.ZodEnum<["plumbing", "electrical", "painting", "roofing", "carpentry", "hvac", "landscaping", "cleaning", "general"]>;
export declare const createProjectInputSchema: z.ZodObject<{
    category: z.ZodEnum<["plumbing", "electrical", "painting", "roofing", "carpentry", "hvac", "landscaping", "cleaning", "general"]>;
    title: z.ZodString;
    description: z.ZodString;
    photos: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    municipality: z.ZodString;
    desiredTimeline: z.ZodString;
    budgetMinCents: z.ZodOptional<z.ZodNumber>;
    budgetMaxCents: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    category: "plumbing" | "electrical" | "painting" | "roofing" | "carpentry" | "hvac" | "landscaping" | "cleaning" | "general";
    title: string;
    description: string;
    photos: string[];
    municipality: string;
    desiredTimeline: string;
    budgetMinCents?: number | undefined;
    budgetMaxCents?: number | undefined;
}, {
    category: "plumbing" | "electrical" | "painting" | "roofing" | "carpentry" | "hvac" | "landscaping" | "cleaning" | "general";
    title: string;
    description: string;
    municipality: string;
    desiredTimeline: string;
    photos?: string[] | undefined;
    budgetMinCents?: number | undefined;
    budgetMaxCents?: number | undefined;
}>;
export declare const submitQuoteInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    priceCents: z.ZodNumber;
    timelineDays: z.ZodNumber;
    scopeNotes: z.ZodString;
    lineItems: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        amountCents: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        description: string;
        amountCents: number;
    }, {
        description: string;
        amountCents: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    priceCents: number;
    timelineDays: number;
    scopeNotes: string;
    lineItems?: {
        description: string;
        amountCents: number;
    }[] | undefined;
}, {
    projectId: string;
    priceCents: number;
    timelineDays: number;
    scopeNotes: string;
    lineItems?: {
        description: string;
        amountCents: number;
    }[] | undefined;
}>;
export declare const selectContractorInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    quoteId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    quoteId: string;
}, {
    projectId: string;
    quoteId: string;
}>;
export declare const acceptAgreementInputSchema: z.ZodObject<{
    agreementId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    agreementId: string;
}, {
    agreementId: string;
}>;
export declare const fundHoldInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    paymentMethodId?: string | undefined;
}, {
    projectId: string;
    paymentMethodId?: string | undefined;
}>;
export declare const requestCompletionInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    proofPhotoUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    proofPhotoUrls?: string[] | undefined;
    note?: string | undefined;
}, {
    projectId: string;
    proofPhotoUrls?: string[] | undefined;
    note?: string | undefined;
}>;
export declare const approveReleaseInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
}, {
    projectId: string;
}>;
export declare const raiseIssueHoldInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    reason: string;
}, {
    projectId: string;
    reason: string;
}>;
export declare const proposeJointReleaseInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    releaseToContractorCents: z.ZodNumber;
    refundToCustomerCents: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    releaseToContractorCents: number;
    refundToCustomerCents: number;
}, {
    projectId: string;
    releaseToContractorCents: number;
    refundToCustomerCents: number;
}>;
export declare const signJointReleaseInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    proposalId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    proposalId: string;
}, {
    projectId: string;
    proposalId: string;
}>;
export declare const uploadResolutionDocumentInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    documentUrl: z.ZodString;
    resolutionType: z.ZodEnum<["court_order", "mediator_decision", "signed_settlement"]>;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    documentUrl: string;
    resolutionType: "court_order" | "mediator_decision" | "signed_settlement";
    summary: string;
}, {
    projectId: string;
    documentUrl: string;
    resolutionType: "court_order" | "mediator_decision" | "signed_settlement";
    summary: string;
}>;
export declare const adminExecuteOutcomeInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    caseId: z.ZodString;
    outcomeType: z.ZodEnum<["release_full", "release_partial", "refund_partial", "refund_full"]>;
    releaseToContractorCents: z.ZodNumber;
    refundToCustomerCents: z.ZodNumber;
    docReference: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    releaseToContractorCents: number;
    refundToCustomerCents: number;
    caseId: string;
    outcomeType: "release_full" | "release_partial" | "refund_partial" | "refund_full";
    docReference: string;
}, {
    projectId: string;
    releaseToContractorCents: number;
    refundToCustomerCents: number;
    caseId: string;
    outcomeType: "release_full" | "release_partial" | "refund_partial" | "refund_full";
    docReference: string;
}>;
export declare const submitReviewInputSchema: z.ZodObject<{
    projectId: z.ZodString;
    rating: z.ZodNumber;
    feedback: z.ZodString;
    tags: z.ZodArray<z.ZodEnum<["quality", "communication", "timeliness"]>, "many">;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    rating: number;
    feedback: string;
    tags: ("quality" | "communication" | "timeliness")[];
}, {
    projectId: string;
    rating: number;
    feedback: string;
    tags: ("quality" | "communication" | "timeliness")[];
}>;
export declare const flagReviewInputSchema: z.ZodObject<{
    reviewId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    reviewId: string;
}, {
    reason: string;
    reviewId: string;
}>;
export declare const adminModerateReviewInputSchema: z.ZodObject<{
    reviewId: z.ZodString;
    moderationStatus: z.ZodEnum<["VISIBLE", "HIDDEN", "REMOVED"]>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    reviewId: string;
    moderationStatus: "VISIBLE" | "HIDDEN" | "REMOVED";
}, {
    reason: string;
    reviewId: string;
    moderationStatus: "VISIBLE" | "HIDDEN" | "REMOVED";
}>;
export declare const adminSetConfigInputSchema: z.ZodObject<{
    platformFees: z.ZodOptional<z.ZodObject<{
        percentBps: z.ZodNumber;
        fixedFeeCents: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        percentBps: number;
        fixedFeeCents: number;
    }, {
        percentBps: number;
        fixedFeeCents: number;
    }>>;
    holdPolicy: z.ZodOptional<z.ZodObject<{
        approvalWindowDays: z.ZodNumber;
        adminAttentionDays: z.ZodNumber;
        autoReleaseEnabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        approvalWindowDays: number;
        adminAttentionDays: number;
        autoReleaseEnabled: boolean;
    }, {
        approvalWindowDays: number;
        adminAttentionDays: number;
        autoReleaseEnabled: boolean;
    }>>;
    featureFlags: z.ZodOptional<z.ZodObject<{
        stripeConnectEnabled: z.ZodBoolean;
        milestonePaymentsEnabled: z.ZodBoolean;
        changeOrdersEnabled: z.ZodBoolean;
        credentialVerificationEnabled: z.ZodBoolean;
        schedulingEnabled: z.ZodBoolean;
        recommendationsEnabled: z.ZodBoolean;
        growthEnabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        stripeConnectEnabled: boolean;
        milestonePaymentsEnabled: boolean;
        changeOrdersEnabled: boolean;
        credentialVerificationEnabled: boolean;
        schedulingEnabled: boolean;
        recommendationsEnabled: boolean;
        growthEnabled: boolean;
    }, {
        stripeConnectEnabled: boolean;
        milestonePaymentsEnabled: boolean;
        changeOrdersEnabled: boolean;
        credentialVerificationEnabled: boolean;
        schedulingEnabled: boolean;
        recommendationsEnabled: boolean;
        growthEnabled: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    platformFees?: {
        percentBps: number;
        fixedFeeCents: number;
    } | undefined;
    holdPolicy?: {
        approvalWindowDays: number;
        adminAttentionDays: number;
        autoReleaseEnabled: boolean;
    } | undefined;
    featureFlags?: {
        stripeConnectEnabled: boolean;
        milestonePaymentsEnabled: boolean;
        changeOrdersEnabled: boolean;
        credentialVerificationEnabled: boolean;
        schedulingEnabled: boolean;
        recommendationsEnabled: boolean;
        growthEnabled: boolean;
    } | undefined;
}, {
    platformFees?: {
        percentBps: number;
        fixedFeeCents: number;
    } | undefined;
    holdPolicy?: {
        approvalWindowDays: number;
        adminAttentionDays: number;
        autoReleaseEnabled: boolean;
    } | undefined;
    featureFlags?: {
        stripeConnectEnabled: boolean;
        milestonePaymentsEnabled: boolean;
        changeOrdersEnabled: boolean;
        credentialVerificationEnabled: boolean;
        schedulingEnabled: boolean;
        recommendationsEnabled: boolean;
        growthEnabled: boolean;
    } | undefined;
}>;
export declare const listProjectsInputSchema: z.ZodObject<{
    mineOnly: z.ZodOptional<z.ZodBoolean>;
    municipality: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["plumbing", "electrical", "painting", "roofing", "carpentry", "hvac", "landscaping", "cleaning", "general"]>>;
    budgetMinCents: z.ZodOptional<z.ZodNumber>;
    budgetMaxCents: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    category?: "plumbing" | "electrical" | "painting" | "roofing" | "carpentry" | "hvac" | "landscaping" | "cleaning" | "general" | undefined;
    municipality?: string | undefined;
    budgetMinCents?: number | undefined;
    budgetMaxCents?: number | undefined;
    mineOnly?: boolean | undefined;
}, {
    category?: "plumbing" | "electrical" | "painting" | "roofing" | "carpentry" | "hvac" | "landscaping" | "cleaning" | "general" | undefined;
    municipality?: string | undefined;
    budgetMinCents?: number | undefined;
    budgetMaxCents?: number | undefined;
    mineOnly?: boolean | undefined;
    limit?: number | undefined;
}>;
export declare const listQuotesInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
}, {
    projectId: string;
}>;
export declare const getProjectInputSchema: z.ZodObject<{
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
}, {
    projectId: string;
}>;
