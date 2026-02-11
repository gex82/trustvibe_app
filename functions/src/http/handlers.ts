import {
  acceptChangeOrderInputSchema,
  adminExecuteOutcomeInputSchema,
  adminModerateReviewInputSchema,
  adminSetPromotionInputSchema,
  adminSetConfigInputSchema,
  adminSetUserRoleInputSchema,
  applyReferralCodeInputSchema,
  approveMilestoneInputSchema,
  approveReleaseInputSchema,
  type BookingRequest,
  type ChangeOrder,
  type EscrowState,
  type FeatureFlags,
  type HoldPolicyConfig,
  type MessageItem,
  type Milestone,
  type Project,
  type Quote,
  createBookingRequestInputSchema,
  createMilestonesInputSchema,
  acceptAgreementInputSchema,
  calculateFee,
  createProjectInputSchema,
  flagReviewInputSchema,
  fundHoldInputSchema,
  getRecommendationsInputSchema,
  getProjectInputSchema,
  isAdminAttentionRequired,
  isApprovalDeadlinePassed,
  listFeaturedListingsInputSchema,
  listMessagesInputSchema,
  listProjectsInputSchema,
  listQuotesInputSchema,
  proposeChangeOrderInputSchema,
  proposeJointReleaseInputSchema,
  raiseIssueHoldInputSchema,
  requestCompletionInputSchema,
  respondBookingRequestInputSchema,
  selectContractorInputSchema,
  sendMessageInputSchema,
  signJointReleaseInputSchema,
  submitQuoteInputSchema,
  submitReviewInputSchema,
  uploadResolutionDocumentInputSchema,
} from '@trustvibe/shared';
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../utils/firebase';
import { getActor, requireRole, type Actor } from '../utils/auth';
import { parseOrThrow } from '../utils/validation';
import { getFeatureFlags, getHoldPolicyConfig, getPlatformFeeConfig } from '../modules/config';
import { getPaymentProvider } from '../modules/paymentProviderFactory';
import { writeLedgerEvent } from '../modules/ledger';
import { writeAuditLog } from '../modules/audit';

const PROJECTS = db.collection('projects');
const AGREEMENTS = db.collection('agreements');
const CASES = db.collection('cases');
const REVIEWS = db.collection('reviews');
const MESSAGES = db.collection('messages');
const PROMOTIONS = db.collection('promotions');

function nowIso(): string {
  return new Date().toISOString();
}

function ensureProjectParty(project: any, actor: Actor): void {
  if (actor.role === 'admin') {
    return;
  }

  const isCustomer = project.customerId === actor.uid;
  const isContractor = project.contractorId && project.contractorId === actor.uid;
  if (!isCustomer && !isContractor) {
    throw new HttpsError('permission-denied', 'Project access denied.');
  }
}

function getHeldAmountCents(project: any): number {
  return Number(project.heldAmountCents ?? 0);
}

async function requireFeatureFlag<K extends keyof FeatureFlags>(key: K, message: string): Promise<FeatureFlags> {
  const flags = await getFeatureFlags();
  if (!flags[key]) {
    throw new HttpsError('failed-precondition', message);
  }
  return flags;
}

function parseVersion(version: string | undefined): number {
  if (!version) {
    return 1;
  }
  const match = version.match(/^v(\d+)$/i);
  if (!match) {
    return 1;
  }
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function assertFinalProjectStateForReview(escrowState: EscrowState): void {
  const allowed: EscrowState[] = [
    'RELEASED_PAID',
    'EXECUTED_RELEASE_FULL',
    'EXECUTED_RELEASE_PARTIAL',
    'EXECUTED_REFUND_PARTIAL',
    'EXECUTED_REFUND_FULL',
    'CLOSED',
  ];
  if (!allowed.includes(escrowState)) {
    throw new HttpsError('failed-precondition', 'Reviews are available only after project completion.');
  }
}

async function getProjectOrThrow(projectId: string): Promise<any> {
  const projectSnap = await PROJECTS.doc(projectId).get();
  if (!projectSnap.exists) {
    throw new HttpsError('not-found', 'Project not found.');
  }
  return projectSnap.data();
}

async function getSelectedQuoteOrThrow(project: any): Promise<any> {
  if (!project.selectedQuoteId) {
    throw new HttpsError('failed-precondition', 'Selected quote is required.');
  }
  const quoteSnap = await PROJECTS.doc(project.id).collection('quotes').doc(project.selectedQuoteId).get();
  if (!quoteSnap.exists) {
    throw new HttpsError('failed-precondition', 'Selected quote not found.');
  }
  return quoteSnap.data();
}

function computeOutcomeState(releaseToContractorCents: number, refundToCustomerCents: number, heldAmountCents: number): EscrowState {
  if (releaseToContractorCents === heldAmountCents) {
    return 'EXECUTED_RELEASE_FULL';
  }
  if (refundToCustomerCents === heldAmountCents) {
    return 'EXECUTED_REFUND_FULL';
  }
  if (releaseToContractorCents > 0 && refundToCustomerCents > 0) {
    return 'EXECUTED_RELEASE_PARTIAL';
  }
  if (refundToCustomerCents > 0) {
    return 'EXECUTED_REFUND_PARTIAL';
  }
  return 'EXECUTED_RELEASE_PARTIAL';
}

async function executeOutcome(input: {
  actor: Actor;
  project: any;
  releaseToContractorCents: number;
  refundToCustomerCents: number;
  docRefs?: string[];
  reason: string;
}): Promise<{ outcomeState: EscrowState; feeCents: number; netReleaseCents: number }> {
  const heldAmountCents = getHeldAmountCents(input.project);
  if (heldAmountCents <= 0) {
    throw new HttpsError('failed-precondition', 'No held amount exists for this project.');
  }

  if (input.releaseToContractorCents < 0 || input.refundToCustomerCents < 0) {
    throw new HttpsError('invalid-argument', 'Outcome amounts must be non-negative.');
  }

  const sum = input.releaseToContractorCents + input.refundToCustomerCents;
  if (sum > heldAmountCents) {
    throw new HttpsError('invalid-argument', 'Outcome amounts cannot exceed held amount.');
  }

  const feeConfig = await getPlatformFeeConfig();
  const feeSummary =
    input.releaseToContractorCents > 0
      ? calculateFee({
          amountCents: input.releaseToContractorCents,
          percentBps: feeConfig.percentBps,
          fixedFeeCents: feeConfig.fixedFeeCents,
        })
      : { grossAmountCents: 0, feeCents: 0, netPayoutCents: 0 };

  const paymentProvider = await getPaymentProvider();
  const holdId = input.project.providerHoldId as string;
  if (!holdId) {
    throw new HttpsError('failed-precondition', 'Provider hold ID missing for project.');
  }

  if (input.releaseToContractorCents > 0) {
    await paymentProvider.release({
      projectId: input.project.id,
      providerHoldId: holdId,
      amountCents: feeSummary.netPayoutCents,
      destinationAccountRef: input.project.contractorId,
      metadata: { reason: input.reason },
    });
  }

  if (input.refundToCustomerCents > 0) {
    await paymentProvider.refund({
      projectId: input.project.id,
      providerHoldId: holdId,
      amountCents: input.refundToCustomerCents,
      destinationCustomerRef: input.project.customerId,
      metadata: { reason: input.reason },
    });
  }

  const outcomeState = computeOutcomeState(input.releaseToContractorCents, input.refundToCustomerCents, heldAmountCents);

  await writeLedgerEvent({
    projectId: input.project.id,
    type: 'OUTCOME_EXECUTED',
    actorId: input.actor.uid,
    actorRole: input.actor.role,
    amountCents: sum,
    feeCents: feeSummary.feeCents,
    metadata: {
      releaseToContractorCents: input.releaseToContractorCents,
      refundToCustomerCents: input.refundToCustomerCents,
      reason: input.reason,
    },
    supportingDocRefs: input.docRefs,
  });

  if (feeSummary.feeCents > 0) {
    await writeLedgerEvent({
      projectId: input.project.id,
      type: 'PLATFORM_FEE_CHARGED',
      actorId: input.actor.uid,
      actorRole: input.actor.role,
      amountCents: feeSummary.feeCents,
      metadata: { reason: input.reason },
      supportingDocRefs: input.docRefs,
    });
  }

  await PROJECTS.doc(input.project.id).update({
    escrowState: outcomeState,
    executedAt: nowIso(),
    updatedAt: nowIso(),
  });

  return {
    outcomeState,
    feeCents: feeSummary.feeCents,
    netReleaseCents: feeSummary.netPayoutCents,
  };
}

export async function createProjectHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);

  const payload = parseOrThrow(createProjectInputSchema, req.data);
  const now = nowIso();
  const ref = PROJECTS.doc();

  const project: Project = {
    id: ref.id,
    customerId: actor.uid,
    category: payload.category,
    title: payload.title,
    description: payload.description,
    photos: payload.photos ?? [],
    municipality: payload.municipality,
    desiredTimeline: payload.desiredTimeline,
    budgetMinCents: payload.budgetMinCents,
    budgetMaxCents: payload.budgetMaxCents,
    escrowState: 'OPEN_FOR_QUOTES',
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(project);
  return { project };
}

function applyProjectFilters(projects: any[], input: any): any[] {
  return projects.filter((p) => {
    if (input.municipality && p.municipality !== input.municipality) {
      return false;
    }
    if (input.category && p.category !== input.category) {
      return false;
    }
    if (typeof input.budgetMinCents === 'number' && typeof p.budgetMaxCents === 'number' && p.budgetMaxCents < input.budgetMinCents) {
      return false;
    }
    if (typeof input.budgetMaxCents === 'number' && typeof p.budgetMinCents === 'number' && p.budgetMinCents > input.budgetMaxCents) {
      return false;
    }
    return true;
  });
}

export async function listProjectsHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  const input = parseOrThrow(listProjectsInputSchema, req.data ?? {});
  const limit = input.limit ?? 25;

  let projects: any[] = [];

  if (actor.role === 'customer') {
    const snap = await PROJECTS.where('customerId', '==', actor.uid).limit(limit).get();
    projects = snap.docs.map((d) => d.data());
  } else if (actor.role === 'contractor') {
    const [openSnap, selectedSnap] = await Promise.all([
      PROJECTS.where('escrowState', '==', 'OPEN_FOR_QUOTES').limit(limit).get(),
      PROJECTS.where('contractorId', '==', actor.uid).limit(limit).get(),
    ]);

    const dedup = new Map<string, any>();
    for (const doc of openSnap.docs) {
      dedup.set(doc.id, doc.data());
    }
    for (const doc of selectedSnap.docs) {
      dedup.set(doc.id, doc.data());
    }
    projects = Array.from(dedup.values());
  } else {
    const snap = await PROJECTS.limit(limit).get();
    projects = snap.docs.map((d) => d.data());
  }

  return { projects: applyProjectFilters(projects, input) };
}

export async function getProjectHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  const input = parseOrThrow(getProjectInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);

  if (actor.role === 'customer' && project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Project access denied.');
  }

  if (actor.role === 'contractor') {
    const canViewOpen = project.escrowState === 'OPEN_FOR_QUOTES';
    const isSelected = project.contractorId === actor.uid;
    if (!canViewOpen && !isSelected) {
      throw new HttpsError('permission-denied', 'Project access denied.');
    }
  }

  const quotesSnap = await PROJECTS.doc(project.id).collection('quotes').get();
  const quotes = quotesSnap.docs.map((d) => d.data());

  return { project, quotes };
}

export async function listMessagesHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);

  const input = parseOrThrow(listMessagesInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  ensureProjectParty(project, actor);

  const limit = input.limit ?? 100;
  const snap = await MESSAGES.doc(project.id).collection('items').orderBy('createdAt', 'asc').limit(limit).get();
  const messages = snap.docs.map((d) => d.data());

  return { projectId: project.id, messages };
}

export async function sendMessageHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);

  const input = parseOrThrow(sendMessageInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  ensureProjectParty(project, actor);

  if (!project.contractorId) {
    throw new HttpsError('failed-precondition', 'Messages are available after contractor selection.');
  }

  const now = nowIso();
  const ref = MESSAGES.doc(project.id).collection('items').doc();
  const message: MessageItem = {
    id: ref.id,
    projectId: project.id,
    senderId: actor.uid,
    body: input.body,
    attachments: input.attachments ?? [],
    createdAt: now,
  };

  await ref.set(message);
  await PROJECTS.doc(project.id).set(
    {
      lastMessageAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  return { message };
}

export async function submitQuoteHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['contractor']);

  const input = parseOrThrow(submitQuoteInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);

  if (project.escrowState !== 'OPEN_FOR_QUOTES') {
    throw new HttpsError('failed-precondition', 'Project is not open for quotes.');
  }

  if (project.customerId === actor.uid) {
    throw new HttpsError('failed-precondition', 'Customer cannot quote own project.');
  }

  const now = nowIso();
  const quoteRef = PROJECTS.doc(project.id).collection('quotes').doc();

  const quote: Quote = {
    id: quoteRef.id,
    projectId: project.id,
    contractorId: actor.uid,
    priceCents: input.priceCents,
    timelineDays: input.timelineDays,
    scopeNotes: input.scopeNotes,
    lineItems: input.lineItems,
    status: 'SUBMITTED',
    createdAt: now,
    updatedAt: now,
  };

  await quoteRef.set(quote);

  return { quote };
}

export async function listQuotesHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  const input = parseOrThrow(listQuotesInputSchema, req.data);

  const project = await getProjectOrThrow(input.projectId);
  if (actor.role === 'customer' && project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Access denied.');
  }

  const quotesSnap = await PROJECTS.doc(project.id).collection('quotes').get();
  let quotes = quotesSnap.docs.map((d) => d.data());

  if (actor.role === 'contractor' && project.contractorId !== actor.uid) {
    quotes = quotes.filter((q) => q.contractorId === actor.uid);
  }

  return { quotes };
}

export async function selectContractorHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);

  const input = parseOrThrow(selectContractorInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);

  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only project customer can select contractor.');
  }

  if (project.escrowState !== 'OPEN_FOR_QUOTES') {
    throw new HttpsError('failed-precondition', 'Project must be open for quotes.');
  }

  const quoteRef = PROJECTS.doc(project.id).collection('quotes').doc(input.quoteId);
  const quoteSnap = await quoteRef.get();
  if (!quoteSnap.exists) {
    throw new HttpsError('not-found', 'Quote not found.');
  }

  const quote = quoteSnap.data() as Quote;
  const now = nowIso();

  await PROJECTS.doc(project.id).update({
    contractorId: quote.contractorId,
    selectedQuoteId: quote.id,
    escrowState: 'CONTRACTOR_SELECTED',
    updatedAt: now,
  });

  const quotesSnap = await PROJECTS.doc(project.id).collection('quotes').get();
  for (const doc of quotesSnap.docs) {
    await doc.ref.update({
      status: doc.id === quote.id ? 'SELECTED' : 'DECLINED',
      updatedAt: now,
    });
  }

  const agreementRef = AGREEMENTS.doc(project.id);
  const feeConfig = await getPlatformFeeConfig();
  const holdPolicy = await getHoldPolicyConfig();

  await agreementRef.set(
    {
      id: agreementRef.id,
      projectId: project.id,
      customerId: project.customerId,
      contractorId: quote.contractorId,
      scopeSummary: `${project.title}: ${quote.scopeNotes}`,
      priceCents: quote.priceCents,
      timelineDays: quote.timelineDays,
      policySummary: `Customer has ${holdPolicy.approvalWindowDays} days after completion request to approve or report issue.`,
      feeDisclosure: `Platform fee ${feeConfig.percentBps / 100}% + ${feeConfig.fixedFeeCents / 100} USD applied at release time.`,
      changeScopeGuidance: 'Change orders are feature-flagged in Phase 2.',
      agreementVersion: 'v1',
      createdAt: now,
    },
    { merge: false }
  );

  return { projectId: project.id, selectedQuoteId: quote.id, agreementId: project.id };
}

export async function acceptAgreementHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor']);

  const input = parseOrThrow(acceptAgreementInputSchema, req.data);
  const agreementRef = AGREEMENTS.doc(input.agreementId);
  const agreementSnap = await agreementRef.get();

  if (!agreementSnap.exists) {
    throw new HttpsError('not-found', 'Agreement not found.');
  }

  const agreement = agreementSnap.data() as any;
  if (actor.uid !== agreement.customerId && actor.uid !== agreement.contractorId) {
    throw new HttpsError('permission-denied', 'Agreement access denied.');
  }

  const now = nowIso();
  const updates: Record<string, unknown> = {};

  if (actor.uid === agreement.customerId) {
    updates.acceptedByCustomerAt = agreement.acceptedByCustomerAt ?? now;
  }
  if (actor.uid === agreement.contractorId) {
    updates.acceptedByContractorAt = agreement.acceptedByContractorAt ?? now;
  }

  await agreementRef.update(updates);

  const refreshed = (await agreementRef.get()).data() as any;
  const bothAccepted = Boolean(refreshed.acceptedByCustomerAt && refreshed.acceptedByContractorAt);
  if (bothAccepted) {
    await PROJECTS.doc(refreshed.projectId).update({
      escrowState: 'AGREEMENT_ACCEPTED',
      agreementId: agreementRef.id,
      updatedAt: nowIso(),
    });
  }

  return {
    agreementId: agreementRef.id,
    acceptedByCustomerAt: refreshed.acceptedByCustomerAt,
    acceptedByContractorAt: refreshed.acceptedByContractorAt,
    readyToFund: bothAccepted,
  };
}

export async function fundHoldHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);

  const input = parseOrThrow(fundHoldInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);

  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can fund hold.');
  }

  if (project.escrowState !== 'AGREEMENT_ACCEPTED') {
    throw new HttpsError('failed-precondition', 'Project must be in AGREEMENT_ACCEPTED state.');
  }

  const quote = await getSelectedQuoteOrThrow(project);
  const provider = await getPaymentProvider();

  const holdResult = await provider.createHold({
    projectId: project.id,
    customerId: project.customerId,
    contractorId: project.contractorId,
    amountCents: quote.priceCents,
    metadata: { paymentMethodId: input.paymentMethodId ?? 'mock_default' },
  });

  await PROJECTS.doc(project.id).update({
    escrowState: 'FUNDED_HELD',
    heldAmountCents: quote.priceCents,
    providerHoldId: holdResult.providerHoldId,
    updatedAt: nowIso(),
  });

  await writeLedgerEvent({
    projectId: project.id,
    type: 'HOLD_CREATED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: quote.priceCents,
    metadata: { provider: provider.providerName, providerHoldId: holdResult.providerHoldId },
  });

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'fundHold',
    targetType: 'project',
    targetId: project.id,
    details: { amountCents: quote.priceCents, provider: provider.providerName },
  });

  const feeConfig = await getPlatformFeeConfig();
  const fees = calculateFee({
    amountCents: quote.priceCents,
    percentBps: feeConfig.percentBps,
    fixedFeeCents: feeConfig.fixedFeeCents,
  });

  return {
    projectId: project.id,
    holdStatus: holdResult.status,
    providerHoldId: holdResult.providerHoldId,
    feePreview: fees,
  };
}

export async function requestCompletionHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['contractor']);

  const input = parseOrThrow(requestCompletionInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);

  if (project.contractorId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only selected contractor can request completion.');
  }

  if (!['FUNDED_HELD', 'IN_PROGRESS'].includes(project.escrowState)) {
    throw new HttpsError('failed-precondition', 'Project must be FUNDED_HELD or IN_PROGRESS.');
  }

  const now = nowIso();

  await PROJECTS.doc(project.id).update({
    escrowState: 'COMPLETION_REQUESTED',
    completionRequestedAt: now,
    completionProofPhotoUrls: input.proofPhotoUrls ?? [],
    completionNote: input.note ?? '',
    updatedAt: now,
  });

  return {
    projectId: project.id,
    escrowState: 'COMPLETION_REQUESTED',
    completionRequestedAt: now,
  };
}

export async function approveReleaseHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);

  const input = parseOrThrow(approveReleaseInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);

  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can approve release.');
  }

  if (project.escrowState !== 'COMPLETION_REQUESTED') {
    throw new HttpsError('failed-precondition', 'Project must be COMPLETION_REQUESTED.');
  }

  const heldAmountCents = getHeldAmountCents(project);
  if (heldAmountCents <= 0) {
    throw new HttpsError('failed-precondition', 'Held amount missing.');
  }

  const feeConfig = await getPlatformFeeConfig();
  const feeSummary = calculateFee({
    amountCents: heldAmountCents,
    percentBps: feeConfig.percentBps,
    fixedFeeCents: feeConfig.fixedFeeCents,
  });

  const provider = await getPaymentProvider();
  await provider.release({
    projectId: project.id,
    providerHoldId: project.providerHoldId,
    amountCents: feeSummary.netPayoutCents,
    destinationAccountRef: project.contractorId,
    metadata: { flow: 'approveRelease' },
  });

  await PROJECTS.doc(project.id).update({
    escrowState: 'RELEASED_PAID',
    releasedAt: nowIso(),
    updatedAt: nowIso(),
  });

  await writeLedgerEvent({
    projectId: project.id,
    type: 'RELEASE_FULL',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: heldAmountCents,
    feeCents: feeSummary.feeCents,
    metadata: { netPayoutCents: feeSummary.netPayoutCents },
  });

  await writeLedgerEvent({
    projectId: project.id,
    type: 'PLATFORM_FEE_CHARGED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: feeSummary.feeCents,
    metadata: { source: 'approveRelease' },
  });

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'approveRelease',
    targetType: 'project',
    targetId: project.id,
    details: { grossAmountCents: heldAmountCents, feeCents: feeSummary.feeCents },
  });

  return {
    projectId: project.id,
    escrowState: 'RELEASED_PAID',
    grossAmountCents: heldAmountCents,
    feeCents: feeSummary.feeCents,
    netPayoutCents: feeSummary.netPayoutCents,
  };
}

export async function raiseIssueHoldHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);

  const input = parseOrThrow(raiseIssueHoldInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);

  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can raise issue hold.');
  }

  if (!['COMPLETION_REQUESTED', 'IN_PROGRESS'].includes(project.escrowState)) {
    throw new HttpsError('failed-precondition', 'Issue hold can be raised only after work starts.');
  }

  const now = nowIso();
  await PROJECTS.doc(project.id).update({
    escrowState: 'ISSUE_RAISED_HOLD',
    issueRaisedAt: now,
    issueReason: input.reason,
    updatedAt: now,
  });

  const caseRef = CASES.doc(project.id);
  await caseRef.set(
    {
      id: project.id,
      projectId: project.id,
      type: 'ISSUE_HOLD',
      status: 'WAITING_JOINT_RELEASE',
      openedByUserId: actor.uid,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'raiseIssueHold',
    targetType: 'project',
    targetId: project.id,
    details: { reason: input.reason },
  });

  return {
    caseId: project.id,
    projectId: project.id,
    escrowState: 'ISSUE_RAISED_HOLD',
  };
}

export async function proposeJointReleaseHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor']);

  const input = parseOrThrow(proposeJointReleaseInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  ensureProjectParty(project, actor);

  if (!['ISSUE_RAISED_HOLD', 'RESOLUTION_PENDING_EXTERNAL', 'RESOLUTION_SUBMITTED'].includes(project.escrowState)) {
    throw new HttpsError('failed-precondition', 'Joint release can only be proposed when funds are held in issue state.');
  }

  const heldAmount = getHeldAmountCents(project);
  if (input.releaseToContractorCents + input.refundToCustomerCents !== heldAmount) {
    throw new HttpsError('invalid-argument', 'Joint release split must equal total held amount.');
  }

  const caseRef = CASES.doc(project.id);
  const now = nowIso();
  await caseRef.set(
    {
      id: project.id,
      projectId: project.id,
      type: 'ISSUE_HOLD',
      status: 'WAITING_JOINT_RELEASE',
      openedByUserId: project.customerId,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  const proposalRef = caseRef.collection('jointReleaseProposals').doc();
  await proposalRef.set({
    id: proposalRef.id,
    projectId: project.id,
    proposedBy: actor.uid,
    releaseToContractorCents: input.releaseToContractorCents,
    refundToCustomerCents: input.refundToCustomerCents,
    status: 'PENDING_SIGNATURES',
    createdAt: now,
    updatedAt: now,
  });

  await writeLedgerEvent({
    projectId: project.id,
    type: 'JOINT_RELEASE_PROPOSED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: heldAmount,
    metadata: {
      proposalId: proposalRef.id,
      releaseToContractorCents: input.releaseToContractorCents,
      refundToCustomerCents: input.refundToCustomerCents,
    },
  });

  return {
    caseId: project.id,
    proposalId: proposalRef.id,
    status: 'PENDING_SIGNATURES',
  };
}

export async function signJointReleaseHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor']);

  const input = parseOrThrow(signJointReleaseInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  ensureProjectParty(project, actor);

  const caseRef = CASES.doc(project.id);
  const proposalRef = caseRef.collection('jointReleaseProposals').doc(input.proposalId);
  const proposalSnap = await proposalRef.get();

  if (!proposalSnap.exists) {
    throw new HttpsError('not-found', 'Joint release proposal not found.');
  }

  const proposal = proposalSnap.data() as any;
  const now = nowIso();
  const updates: Record<string, unknown> = { updatedAt: now };
  if (actor.uid === project.customerId) {
    updates.signedByCustomerAt = proposal.signedByCustomerAt ?? now;
  }
  if (actor.uid === project.contractorId) {
    updates.signedByContractorAt = proposal.signedByContractorAt ?? now;
  }

  await proposalRef.update(updates);

  const refreshed = (await proposalRef.get()).data() as any;
  const fullySigned = Boolean(refreshed.signedByCustomerAt && refreshed.signedByContractorAt);

  await writeLedgerEvent({
    projectId: project.id,
    type: 'JOINT_RELEASE_SIGNED',
    actorId: actor.uid,
    actorRole: actor.role,
    metadata: { proposalId: refreshed.id, fullySigned },
  });

  if (!fullySigned) {
    return {
      proposalId: refreshed.id,
      status: 'PENDING_SIGNATURES',
      fullySigned: false,
    };
  }

  const outcome = await executeOutcome({
    actor,
    project,
    releaseToContractorCents: refreshed.releaseToContractorCents,
    refundToCustomerCents: refreshed.refundToCustomerCents,
    reason: 'joint_release',
  });

  await proposalRef.update({
    status: 'EXECUTED',
    executedAt: nowIso(),
    updatedAt: nowIso(),
  });

  await caseRef.set(
    {
      status: 'CLOSED',
      updatedAt: nowIso(),
    },
    { merge: true }
  );

  return {
    proposalId: refreshed.id,
    status: 'EXECUTED',
    fullySigned: true,
    outcomeState: outcome.outcomeState,
    feeCents: outcome.feeCents,
    netReleaseCents: outcome.netReleaseCents,
  };
}

export async function uploadResolutionDocumentHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor']);

  const input = parseOrThrow(uploadResolutionDocumentInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  ensureProjectParty(project, actor);

  if (!['ISSUE_RAISED_HOLD', 'RESOLUTION_PENDING_EXTERNAL', 'RESOLUTION_SUBMITTED'].includes(project.escrowState)) {
    throw new HttpsError('failed-precondition', 'Resolution upload requires issue hold state.');
  }

  const now = nowIso();
  await CASES.doc(project.id).set(
    {
      id: project.id,
      projectId: project.id,
      type: 'ISSUE_HOLD',
      status: 'RESOLUTION_SUBMITTED',
      resolutionDocumentUrl: input.documentUrl,
      resolutionSummary: input.summary,
      resolutionType: input.resolutionType,
      updatedAt: now,
      createdAt: now,
    },
    { merge: true }
  );

  await PROJECTS.doc(project.id).update({
    escrowState: 'RESOLUTION_SUBMITTED',
    updatedAt: now,
  });

  await writeLedgerEvent({
    projectId: project.id,
    type: 'EXTERNAL_RESOLUTION_SUBMITTED',
    actorId: actor.uid,
    actorRole: actor.role,
    supportingDocRefs: [input.documentUrl],
    metadata: {
      resolutionType: input.resolutionType,
      summary: input.summary,
    },
  });

  return {
    caseId: project.id,
    projectId: project.id,
    escrowState: 'RESOLUTION_SUBMITTED',
  };
}

export async function adminExecuteOutcomeHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin']);

  const input = parseOrThrow(adminExecuteOutcomeInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  const caseSnap = await CASES.doc(input.caseId).get();
  if (!caseSnap.exists) {
    throw new HttpsError('not-found', 'Case not found.');
  }

  const caseData = caseSnap.data() as any;
  if (!caseData.resolutionDocumentUrl && !input.docReference) {
    throw new HttpsError('failed-precondition', 'Resolution document reference is required.');
  }

  const outcome = await executeOutcome({
    actor,
    project,
    releaseToContractorCents: input.releaseToContractorCents,
    refundToCustomerCents: input.refundToCustomerCents,
    docRefs: [input.docReference],
    reason: `admin_execute_${input.outcomeType}`,
  });

  await CASES.doc(input.caseId).set(
    {
      status: 'CLOSED',
      executedOutcomeType: input.outcomeType,
      executedAt: nowIso(),
      executedBy: actor.uid,
      updatedAt: nowIso(),
    },
    { merge: true }
  );

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'adminExecuteOutcome',
    targetType: 'case',
    targetId: input.caseId,
    details: {
      outcomeType: input.outcomeType,
      releaseToContractorCents: input.releaseToContractorCents,
      refundToCustomerCents: input.refundToCustomerCents,
      docReference: input.docReference,
    },
  });

  return {
    caseId: input.caseId,
    projectId: input.projectId,
    outcomeState: outcome.outcomeState,
    feeCents: outcome.feeCents,
    netReleaseCents: outcome.netReleaseCents,
  };
}

export async function submitReviewHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);

  const input = parseOrThrow(submitReviewInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);

  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can submit review for this project.');
  }

  if (!project.contractorId) {
    throw new HttpsError('failed-precondition', 'Contractor must be selected before review submission.');
  }

  assertFinalProjectStateForReview(project.escrowState as EscrowState);

  const ref = REVIEWS.doc();
  const now = nowIso();
  await ref.set({
    id: ref.id,
    projectId: project.id,
    customerId: actor.uid,
    contractorId: project.contractorId,
    rating: input.rating,
    feedback: input.feedback,
    tags: input.tags,
    verified: true,
    flagged: false,
    moderationStatus: 'VISIBLE',
    createdAt: now,
  });

  return { reviewId: ref.id };
}

export async function flagReviewHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  const input = parseOrThrow(flagReviewInputSchema, req.data);

  const reviewRef = REVIEWS.doc(input.reviewId);
  const reviewSnap = await reviewRef.get();
  if (!reviewSnap.exists) {
    throw new HttpsError('not-found', 'Review not found.');
  }

  await reviewRef.update({
    flagged: true,
    flagReason: input.reason,
    flaggedBy: actor.uid,
    flaggedAt: nowIso(),
  });

  return { reviewId: input.reviewId, flagged: true };
}

export async function adminModerateReviewHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin']);

  const input = parseOrThrow(adminModerateReviewInputSchema, req.data);
  const reviewRef = REVIEWS.doc(input.reviewId);
  const reviewSnap = await reviewRef.get();
  if (!reviewSnap.exists) {
    throw new HttpsError('not-found', 'Review not found.');
  }

  await reviewRef.update({
    moderationStatus: input.moderationStatus,
    moderationReason: input.reason,
    moderatedBy: actor.uid,
    moderatedAt: nowIso(),
  });

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'adminModerateReview',
    targetType: 'review',
    targetId: input.reviewId,
    details: { moderationStatus: input.moderationStatus, reason: input.reason },
  });

  return { reviewId: input.reviewId, moderationStatus: input.moderationStatus };
}

export async function adminSetConfigHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin']);

  const input = parseOrThrow(adminSetConfigInputSchema, req.data);
  const now = nowIso();

  if (input.platformFees) {
    await db.collection('config').doc('platformFees').set({
      ...input.platformFees,
      updatedAt: now,
      updatedBy: actor.uid,
    });
  }

  if (input.holdPolicy) {
    await db.collection('config').doc('holdPolicy').set({
      ...input.holdPolicy,
      updatedAt: now,
      updatedBy: actor.uid,
    });
  }

  if (input.featureFlags) {
    await db.collection('config').doc('featureFlags').set({
      ...input.featureFlags,
      updatedAt: now,
      updatedBy: actor.uid,
    });
  }

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'adminSetConfig',
    targetType: 'config',
    targetId: 'global',
    details: { input },
  });

  return { updated: true };
}

export async function getAdminSessionHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin']);
  return { uid: actor.uid, role: actor.role, adminVerified: actor.adminVerified };
}

export async function adminSetUserRoleHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin']);

  const input = parseOrThrow(adminSetUserRoleInputSchema, req.data);
  const now = nowIso();
  let claimsSynced = false;

  await db
    .collection('users')
    .doc(input.userId)
    .set(
      {
        role: input.role,
        disabled: input.disabled ?? false,
        updatedAt: now,
        updatedBy: actor.uid,
      },
      { merge: true }
    );

  try {
    const authClient = getAuth();
    try {
      await authClient.getUser(input.userId);
    } catch (error) {
      if (!String(error).includes('auth/user-not-found')) {
        throw error;
      }
      const seededUser = (await db.collection('users').doc(input.userId).get()).data() as any;
      await authClient.createUser({
        uid: input.userId,
        email: seededUser?.email ?? `${input.userId}@trustvibe.local`,
        displayName: seededUser?.name ?? input.userId,
        disabled: input.disabled ?? false,
      });
    }

    await authClient.setCustomUserClaims(input.userId, { role: input.role });

    if (typeof input.disabled === 'boolean') {
      await authClient.updateUser(input.userId, { disabled: input.disabled });
    }
    claimsSynced = true;
  } catch (error) {
    const authUnavailable =
      String(error).includes('metadata.google.internal') ||
      String(error).includes('Credential implementation') ||
      String(error).includes('UNAUTHENTICATED');

    if (!authUnavailable) {
      throw error;
    }

    await db.collection('users').doc(input.userId).set(
      {
        claimsSyncStatus: 'PENDING',
        claimsSyncError: String(error),
        updatedAt: nowIso(),
      },
      { merge: true }
    );
  }

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'adminSetUserRole',
    targetType: 'user',
    targetId: input.userId,
    details: { role: input.role, disabled: input.disabled ?? false },
  });

  return { userId: input.userId, role: input.role, disabled: input.disabled ?? false, claimsSynced };
}

export async function createMilestonesHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);
  await requireFeatureFlag('milestonePaymentsEnabled', 'Milestone payments are disabled.');

  const input = parseOrThrow(createMilestonesInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can define milestones.');
  }
  if (!project.contractorId) {
    throw new HttpsError('failed-precondition', 'Contractor must be selected before creating milestones.');
  }

  const now = nowIso();
  const milestoneRef = AGREEMENTS.doc(project.id).collection('milestones');
  const created: Milestone[] = [];

  for (const milestone of input.milestones) {
    const ref = milestoneRef.doc();
    const item: Milestone = {
      id: ref.id,
      projectId: project.id,
      title: milestone.title,
      amountCents: milestone.amountCents,
      acceptanceCriteria: milestone.acceptanceCriteria,
      dueDate: milestone.dueDate,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(item);
    created.push(item);
  }

  await AGREEMENTS.doc(project.id).set(
    {
      milestonesEnabled: true,
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'createMilestones',
    targetType: 'project',
    targetId: project.id,
    details: { count: created.length, totalCents: created.reduce((sum, m) => sum + m.amountCents, 0) },
  });

  return { projectId: project.id, milestones: created };
}

export async function approveMilestoneHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);
  await requireFeatureFlag('milestonePaymentsEnabled', 'Milestone payments are disabled.');

  const input = parseOrThrow(approveMilestoneInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can approve milestone payment.');
  }

  const milestoneRef = AGREEMENTS.doc(project.id).collection('milestones').doc(input.milestoneId);
  const milestoneSnap = await milestoneRef.get();
  if (!milestoneSnap.exists) {
    throw new HttpsError('not-found', 'Milestone not found.');
  }

  const milestone = milestoneSnap.data() as Milestone;
  if (milestone.status === 'RELEASED') {
    throw new HttpsError('failed-precondition', 'Milestone is already released.');
  }

  const heldAmountCents = getHeldAmountCents(project);
  if (heldAmountCents <= 0) {
    throw new HttpsError('failed-precondition', 'Project has no held funds.');
  }

  const releaseAmountCents = Math.min(milestone.amountCents, heldAmountCents);
  const feeConfig = await getPlatformFeeConfig();
  const feeSummary = calculateFee({
    amountCents: releaseAmountCents,
    percentBps: feeConfig.percentBps,
    fixedFeeCents: feeConfig.fixedFeeCents,
  });

  const provider = await getPaymentProvider();
  await provider.release({
    projectId: project.id,
    providerHoldId: project.providerHoldId,
    amountCents: feeSummary.netPayoutCents,
    destinationAccountRef: project.contractorId,
    metadata: { flow: 'approveMilestone', milestoneId: milestone.id },
  });

  const now = nowIso();
  const remainingCents = heldAmountCents - releaseAmountCents;
  await PROJECTS.doc(project.id).update({
    heldAmountCents: remainingCents,
    escrowState: remainingCents <= 0 ? 'RELEASED_PAID' : 'IN_PROGRESS',
    updatedAt: now,
  });

  await milestoneRef.update({
    status: 'RELEASED',
    releasedAt: now,
    updatedAt: now,
  });

  await writeLedgerEvent({
    projectId: project.id,
    type: remainingCents <= 0 ? 'RELEASE_FULL' : 'RELEASE_PARTIAL',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: releaseAmountCents,
    feeCents: feeSummary.feeCents,
    metadata: {
      milestoneId: milestone.id,
      title: milestone.title,
      netPayoutCents: feeSummary.netPayoutCents,
      remainingCents,
    },
  });

  if (feeSummary.feeCents > 0) {
    await writeLedgerEvent({
      projectId: project.id,
      type: 'PLATFORM_FEE_CHARGED',
      actorId: actor.uid,
      actorRole: actor.role,
      amountCents: feeSummary.feeCents,
      metadata: { source: 'approveMilestone', milestoneId: milestone.id },
    });
  }

  return {
    projectId: project.id,
    milestoneId: milestone.id,
    releasedAmountCents: releaseAmountCents,
    feeCents: feeSummary.feeCents,
    remainingHeldAmountCents: remainingCents,
  };
}

export async function proposeChangeOrderHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor']);
  await requireFeatureFlag('changeOrdersEnabled', 'Change orders are disabled.');

  const input = parseOrThrow(proposeChangeOrderInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  ensureProjectParty(project, actor);

  const now = nowIso();
  const ref = AGREEMENTS.doc(project.id).collection('changeOrders').doc();
  const item: ChangeOrder = {
    id: ref.id,
    projectId: project.id,
    proposedByUserId: actor.uid,
    scopeSummary: input.scopeSummary,
    amountDeltaCents: input.amountDeltaCents,
    timelineDeltaDays: input.timelineDeltaDays,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(item);

  return { changeOrder: item };
}

export async function acceptChangeOrderHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor']);
  await requireFeatureFlag('changeOrdersEnabled', 'Change orders are disabled.');

  const input = parseOrThrow(acceptChangeOrderInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  ensureProjectParty(project, actor);

  const changeOrderRef = AGREEMENTS.doc(project.id).collection('changeOrders').doc(input.changeOrderId);
  const changeOrderSnap = await changeOrderRef.get();
  if (!changeOrderSnap.exists) {
    throw new HttpsError('not-found', 'Change order not found.');
  }
  const changeOrder = changeOrderSnap.data() as ChangeOrder;
  if (changeOrder.status !== 'PENDING') {
    throw new HttpsError('failed-precondition', 'Change order is already finalized.');
  }
  if (changeOrder.proposedByUserId === actor.uid) {
    throw new HttpsError('failed-precondition', 'Proposer cannot approve their own change order.');
  }

  const now = nowIso();
  if (!input.accept) {
    await changeOrderRef.update({
      status: 'REJECTED',
      acceptedByUserId: actor.uid,
      updatedAt: now,
    });
    return { changeOrderId: changeOrder.id, status: 'REJECTED' };
  }

  await changeOrderRef.update({
    status: 'ACCEPTED',
    acceptedByUserId: actor.uid,
    updatedAt: now,
  });

  const agreementRef = AGREEMENTS.doc(project.id);
  const agreementSnap = await agreementRef.get();
  const agreement = agreementSnap.data() as any;
  const nextVersionNumber = parseVersion(agreement?.agreementVersion) + 1;
  const nextDeltaCents = Number(agreement?.changeOrderDeltaCents ?? 0) + changeOrder.amountDeltaCents;
  const nextTimelineDeltaDays = Number(agreement?.changeOrderTimelineDeltaDays ?? 0) + changeOrder.timelineDeltaDays;

  await agreementRef.set(
    {
      agreementVersion: `v${nextVersionNumber}`,
      changeOrderDeltaCents: nextDeltaCents,
      changeOrderTimelineDeltaDays: nextTimelineDeltaDays,
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'acceptChangeOrder',
    targetType: 'changeOrder',
    targetId: changeOrder.id,
    details: {
      amountDeltaCents: changeOrder.amountDeltaCents,
      timelineDeltaDays: changeOrder.timelineDeltaDays,
      agreementVersion: `v${nextVersionNumber}`,
    },
  });

  return {
    changeOrderId: changeOrder.id,
    status: 'ACCEPTED',
    agreementVersion: `v${nextVersionNumber}`,
    cumulativeAmountDeltaCents: nextDeltaCents,
    cumulativeTimelineDeltaDays: nextTimelineDeltaDays,
  };
}

export async function createBookingRequestHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);
  await requireFeatureFlag('schedulingEnabled', 'Scheduling is disabled.');

  const input = parseOrThrow(createBookingRequestInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can create booking request.');
  }
  if (!project.contractorId) {
    throw new HttpsError('failed-precondition', 'Contractor must be selected before booking.');
  }
  if (new Date(input.startAt).getTime() >= new Date(input.endAt).getTime()) {
    throw new HttpsError('invalid-argument', 'startAt must be before endAt.');
  }

  const now = nowIso();
  const ref = PROJECTS.doc(project.id).collection('bookingRequests').doc();
  const bookingRequest: BookingRequest = {
    id: ref.id,
    projectId: project.id,
    customerId: project.customerId,
    contractorId: project.contractorId,
    startAt: input.startAt,
    endAt: input.endAt,
    note: input.note,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(bookingRequest);

  return { bookingRequest };
}

export async function respondBookingRequestHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['contractor']);
  await requireFeatureFlag('schedulingEnabled', 'Scheduling is disabled.');

  const input = parseOrThrow(respondBookingRequestInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  if (project.contractorId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only selected contractor can respond to booking.');
  }

  const ref = PROJECTS.doc(project.id).collection('bookingRequests').doc(input.bookingRequestId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Booking request not found.');
  }
  const booking = snap.data() as BookingRequest;
  if (booking.status !== 'PENDING') {
    throw new HttpsError('failed-precondition', 'Booking request already resolved.');
  }

  const status = input.response === 'confirm' ? 'CONFIRMED' : 'DECLINED';
  await ref.update({
    status,
    respondedByUserId: actor.uid,
    respondedAt: nowIso(),
    updatedAt: nowIso(),
  });

  return { bookingRequestId: booking.id, status };
}

export async function getRecommendationsHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);
  await requireFeatureFlag('recommendationsEnabled', 'Recommendations are disabled.');

  const input = parseOrThrow(getRecommendationsInputSchema, req.data ?? {});
  const limit = input.limit ?? 10;
  const target = input.target ?? actor.role;

  if (target === 'customer') {
    const contractorSnap = await db.collection('contractorProfiles').limit(100).get();
    const contractors = contractorSnap.docs
      .map((d) => d.data() as any)
      .filter((c) => {
        if (input.municipality && !(c.serviceMunicipalities ?? []).includes(input.municipality)) {
          return false;
        }
        if (input.category && !String(c.skills ?? '').toLowerCase().includes(String(input.category).toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => Number(b.ratingAvg ?? 0) - Number(a.ratingAvg ?? 0))
      .slice(0, limit)
      .map((c) => ({
        id: c.userId,
        type: 'contractor' as const,
        contractorId: c.userId,
        score: Number(c.ratingAvg ?? 0),
        reason: 'Matched by municipality/skills/rating.',
      }));

    return { target: 'customer', recommendations: contractors };
  }

  const openSnap = await PROJECTS.where('escrowState', '==', 'OPEN_FOR_QUOTES').limit(200).get();
  const projects = openSnap.docs
    .map((d) => d.data() as any)
    .filter((p) => {
      if (input.municipality && p.municipality !== input.municipality) {
        return false;
      }
      if (input.category && p.category !== input.category) {
        return false;
      }
      return true;
    })
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      type: 'project' as const,
      projectId: p.id,
      score: 1,
      reason: 'Open project matching current filters.',
    }));

  return { target: 'contractor', recommendations: projects };
}

export async function adminSetPromotionHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin']);
  await requireFeatureFlag('growthEnabled', 'Growth features are disabled.');

  const input = parseOrThrow(adminSetPromotionInputSchema, req.data);
  const now = nowIso();
  const code = input.code.trim().toUpperCase();

  await PROMOTIONS.doc(code).set({
    code,
    type: input.type,
    percentOffBps: input.percentOffBps ?? null,
    amountOffCents: input.amountOffCents ?? null,
    featuredContractorId: input.featuredContractorId ?? null,
    active: input.active,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    updatedAt: now,
    createdAt: now,
    updatedBy: actor.uid,
  });

  return { code, active: input.active };
}

export async function applyReferralCodeHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor']);
  await requireFeatureFlag('growthEnabled', 'Growth features are disabled.');

  const input = parseOrThrow(applyReferralCodeInputSchema, req.data);
  const code = input.code.trim().toUpperCase();
  const promoSnap = await PROMOTIONS.doc(code).get();
  if (!promoSnap.exists) {
    throw new HttpsError('not-found', 'Referral or promotion code not found.');
  }

  const promo = promoSnap.data() as any;
  if (!promo.active) {
    throw new HttpsError('failed-precondition', 'Code is not active.');
  }

  const userRef = db.collection('users').doc(actor.uid);
  const userSnap = await userRef.get();
  const applied = (userSnap.data()?.appliedCodes ?? []) as string[];
  if (applied.includes(code)) {
    throw new HttpsError('failed-precondition', 'Code already applied.');
  }

  await userRef.set(
    {
      appliedCodes: [...applied, code],
      updatedAt: nowIso(),
    },
    { merge: true }
  );

  return {
    code,
    type: promo.type,
    percentOffBps: promo.percentOffBps ?? 0,
    amountOffCents: promo.amountOffCents ?? 0,
    projectId: input.projectId ?? null,
  };
}

export async function listFeaturedListingsHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);
  await requireFeatureFlag('growthEnabled', 'Growth features are disabled.');

  const input = parseOrThrow(listFeaturedListingsInputSchema, req.data ?? {});
  const limit = input.limit ?? 20;
  const snap = await PROMOTIONS.where('type', '==', 'featured').where('active', '==', true).limit(limit).get();

  const featured = await Promise.all(
    snap.docs.map(async (doc) => {
      const item = doc.data() as any;
      const profileSnap = item.featuredContractorId ? await db.collection('contractorProfiles').doc(item.featuredContractorId).get() : null;
      return {
        code: item.code,
        contractorId: item.featuredContractorId ?? null,
        contractorProfile: profileSnap?.exists ? profileSnap.data() : null,
      };
    })
  );

  return { featured };
}

async function executeAutoReleaseForProject(project: any, holdPolicy: HoldPolicyConfig): Promise<void> {
  if (!project.completionRequestedAt) {
    return;
  }

  const shouldAutoRelease = isApprovalDeadlinePassed(nowIso(), project.completionRequestedAt, holdPolicy.approvalWindowDays);
  if (!shouldAutoRelease) {
    return;
  }

  const actor: Actor = { uid: 'system-auto-release', role: 'admin', adminVerified: true };
  const outcome = await executeOutcome({
    actor,
    project,
    releaseToContractorCents: getHeldAmountCents(project),
    refundToCustomerCents: 0,
    reason: 'auto_release_deadline',
  });

  await writeLedgerEvent({
    projectId: project.id,
    type: 'AUTO_RELEASE_EXECUTED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: getHeldAmountCents(project),
    feeCents: outcome.feeCents,
    metadata: {
      completionRequestedAt: project.completionRequestedAt,
      approvalWindowDays: holdPolicy.approvalWindowDays,
    },
  });

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'autoRelease',
    targetType: 'project',
    targetId: project.id,
    details: {
      approvalWindowDays: holdPolicy.approvalWindowDays,
      feeCents: outcome.feeCents,
    },
  });
}

export async function checkAutoReleaseHandler(): Promise<{ processed: number }> {
  const holdPolicy = await getHoldPolicyConfig();
  if (!holdPolicy.autoReleaseEnabled) {
    return { processed: 0 };
  }

  const snap = await PROJECTS.where('escrowState', '==', 'COMPLETION_REQUESTED').limit(200).get();
  for (const doc of snap.docs) {
    await executeAutoReleaseForProject(doc.data(), holdPolicy);
  }

  return { processed: snap.size };
}

export async function sendIssueRemindersHandler(): Promise<{ processed: number; adminAttentionRequired: number }> {
  const holdPolicy = await getHoldPolicyConfig();
  const casesSnap = await CASES.limit(200).get();
  let escalated = 0;

  for (const doc of casesSnap.docs) {
    const item = doc.data() as any;
    if (item.status === 'CLOSED') {
      continue;
    }

    const project = await getProjectOrThrow(item.projectId);
    const issueRaisedAt = project.issueRaisedAt as string | undefined;

    if (!issueRaisedAt) {
      continue;
    }

    const needsAdminAttention = isAdminAttentionRequired(nowIso(), issueRaisedAt, holdPolicy.adminAttentionDays);
    if (needsAdminAttention && item.status !== 'ADMIN_ATTENTION_REQUIRED') {
      escalated += 1;
      await doc.ref.update({
        status: 'ADMIN_ATTENTION_REQUIRED',
        adminAttentionAt: nowIso(),
        updatedAt: nowIso(),
      });
    }
  }

  return { processed: casesSnap.size, adminAttentionRequired: escalated };
}

export async function getCurrentConfigHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin', 'customer', 'contractor']);

  const [fees, holdPolicy, featureFlags] = await Promise.all([getPlatformFeeConfig(), getHoldPolicyConfig(), getFeatureFlags()]);

  return { fees, holdPolicy, featureFlags };
}
