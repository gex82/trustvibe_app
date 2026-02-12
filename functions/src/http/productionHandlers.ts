import {
  applyEstimateDepositToJobInputSchema,
  assignConciergeManagerInputSchema,
  cancelSubscriptionInputSchema,
  captureEstimateDepositInputSchema,
  createConnectedPaymentAccountInputSchema,
  markEstimateAttendanceInputSchema,
  createHighTicketCaseInputSchema,
  createSubscriptionInputSchema,
  getPaymentOnboardingLinkInputSchema,
  getReliabilityScoreInputSchema,
  listInvoicesInputSchema,
  refundEstimateDepositInputSchema,
  recordBookingAttendanceInputSchema,
  submitConciergeBidInputSchema,
  submitCredentialForVerificationInputSchema,
  createEstimateDepositInputSchema,
  updateSubscriptionInputSchema,
  verifyCredentialInputSchema,
  type BookingRequest,
  type CredentialVerification,
  type EstimateDeposit,
  type HighTicketCase,
  type Subscription,
} from '@trustvibe/shared';
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { db } from '../utils/firebase';
import { getActor, requireRole, type Actor } from '../utils/auth';
import { parseOrThrow } from '../utils/validation';
import {
  getFeatureFlags,
  getHighTicketPolicyConfig,
  getReliabilityWeightsConfig,
  getSubscriptionPlansConfig,
} from '../modules/config';
import { writeAuditLog } from '../modules/audit';
import { writeLedgerEvent } from '../modules/ledger';
import { getPaymentProvider } from '../modules/paymentProviderFactory';
import { resolveDepositAmountCents } from '../modules/pricing';
import { getCredentialVerificationProvider } from '../modules/credentialVerificationProviderFactory';
import { getReliabilityScore, updateReliabilityScore } from '../modules/reliability';

const PROJECTS = db.collection('projects');
const ESTIMATE_DEPOSITS = db.collection('estimateDeposits');
const PAYMENT_ACCOUNTS = db.collection('paymentAccounts');
const CREDENTIAL_VERIFICATIONS = db.collection('credentialVerifications');
const SUBSCRIPTIONS = db.collection('subscriptions');
const BILLING_INVOICES = db.collection('billingInvoices');
const HIGH_TICKET_CASES = db.collection('highTicketCases');

function nowIso(): string {
  return new Date().toISOString();
}

async function requireFeatureFlag<K extends keyof Awaited<ReturnType<typeof getFeatureFlags>>>(
  key: K,
  message: string
): Promise<Awaited<ReturnType<typeof getFeatureFlags>>> {
  const flags = await getFeatureFlags();
  if (!flags[key]) {
    throw new HttpsError('failed-precondition', message);
  }
  return flags;
}

async function getProjectOrThrow(projectId: string): Promise<any> {
  const snap = await PROJECTS.doc(projectId).get();
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Project not found.');
  }
  return snap.data();
}

function ensureProjectParty(project: any, actor: Actor): void {
  if (actor.role === 'admin') {
    return;
  }
  const isCustomer = project.customerId === actor.uid;
  const isContractor = project.contractorId === actor.uid;
  if (!isCustomer && !isContractor) {
    throw new HttpsError('permission-denied', 'Project access denied.');
  }
}

async function getEstimateDepositOrThrow(depositId: string): Promise<EstimateDeposit> {
  const snap = await ESTIMATE_DEPOSITS.doc(depositId).get();
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Estimate deposit not found.');
  }
  return snap.data() as EstimateDeposit;
}

async function autoRefundEstimateDepositIfNeeded(input: {
  actor: Actor;
  deposit: EstimateDeposit;
  reason: string;
}): Promise<EstimateDeposit> {
  if (!input.deposit.providerHoldId) {
    return input.deposit;
  }
  if (input.deposit.status === 'REFUNDED' || input.deposit.status === 'CREDITED_TO_JOB') {
    return input.deposit;
  }

  const provider = await getPaymentProvider();
  await provider.refund({
    projectId: input.deposit.projectId,
    providerHoldId: input.deposit.providerHoldId,
    amountCents: input.deposit.amountCents,
    destinationCustomerRef: input.deposit.customerId,
    metadata: { reason: input.reason, flow: 'estimate_refund' },
  });

  const now = nowIso();
  const updated: EstimateDeposit = {
    ...input.deposit,
    status: 'REFUNDED',
    refundedAt: now,
    updatedAt: now,
    updatedBy: input.actor.uid,
  };
  await ESTIMATE_DEPOSITS.doc(input.deposit.id).set(updated, { merge: true });

  await writeLedgerEvent({
    projectId: input.deposit.projectId,
    type: 'ESTIMATE_DEPOSIT_REFUNDED',
    actorId: input.actor.uid,
    actorRole: input.actor.role,
    amountCents: input.deposit.amountCents,
    metadata: { depositId: input.deposit.id, reason: input.reason },
  });

  return updated;
}

export async function createEstimateDepositHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);
  await requireFeatureFlag('estimateDepositsEnabled', 'Estimate deposits are disabled.');

  const input = parseOrThrow(createEstimateDepositInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can create estimate deposit.');
  }
  if (!project.contractorId) {
    throw new HttpsError('failed-precondition', 'Contractor must be selected for estimate deposit.');
  }

  const amountCents = await resolveDepositAmountCents(input.category ?? project.category);
  const now = nowIso();
  const ref = ESTIMATE_DEPOSITS.doc();
  const deposit: EstimateDeposit = {
    id: ref.id,
    projectId: project.id,
    customerId: project.customerId,
    contractorId: project.contractorId,
    category: input.category ?? project.category,
    amountCents,
    currency: 'USD',
    status: 'CREATED',
    createdAt: now,
    updatedAt: now,
    schemaVersion: 1,
    updatedBy: actor.uid,
  };

  await ref.set(deposit);
  await PROJECTS.doc(project.id).set(
    {
      estimateDepositId: deposit.id,
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  await writeLedgerEvent({
    projectId: project.id,
    type: 'ESTIMATE_DEPOSIT_CREATED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: deposit.amountCents,
    metadata: { depositId: deposit.id, category: deposit.category, appointmentStartAt: input.appointmentStartAt ?? null },
  });

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'createEstimateDeposit',
    targetType: 'estimateDeposit',
    targetId: deposit.id,
    details: { projectId: project.id, amountCents: deposit.amountCents },
  });

  return { deposit };
}

export async function captureEstimateDepositHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);
  await requireFeatureFlag('estimateDepositsEnabled', 'Estimate deposits are disabled.');

  const input = parseOrThrow(captureEstimateDepositInputSchema, req.data);
  const deposit = await getEstimateDepositOrThrow(input.depositId);
  if (deposit.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can capture estimate deposit.');
  }
  if (deposit.status !== 'CREATED') {
    throw new HttpsError('failed-precondition', 'Estimate deposit is already processed.');
  }

  const provider = await getPaymentProvider();
  const hold = await provider.createHold({
    projectId: deposit.projectId,
    customerId: deposit.customerId,
    contractorId: deposit.contractorId,
    amountCents: deposit.amountCents,
    metadata: {
      flow: 'estimate_deposit',
      paymentMethodId: input.paymentMethodId ?? 'default',
      depositId: deposit.id,
    },
  });

  const now = nowIso();
  const updated: EstimateDeposit = {
    ...deposit,
    providerHoldId: hold.providerHoldId,
    status: 'CAPTURED',
    updatedAt: now,
    updatedBy: actor.uid,
  };
  await ESTIMATE_DEPOSITS.doc(deposit.id).set(updated, { merge: true });

  await writeLedgerEvent({
    projectId: deposit.projectId,
    type: 'ESTIMATE_DEPOSIT_CAPTURED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: deposit.amountCents,
    metadata: { depositId: deposit.id, providerHoldId: hold.providerHoldId },
  });

  return { deposit: updated };
}

export async function markEstimateAttendanceHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);
  await requireFeatureFlag('estimateDepositsEnabled', 'Estimate deposits are disabled.');

  const input = parseOrThrow(markEstimateAttendanceInputSchema, req.data);
  const deposit = await getEstimateDepositOrThrow(input.depositId);
  const project = await getProjectOrThrow(deposit.projectId);
  ensureProjectParty(project, actor);

  const now = nowIso();
  const nextStatusMap: Record<string, EstimateDeposit['status']> = {
    customer_present: 'CUSTOMER_ATTENDED',
    contractor_present: 'CONTRACTOR_ATTENDED',
    customer_no_show: 'CUSTOMER_NO_SHOW',
    contractor_no_show: 'CONTRACTOR_NO_SHOW',
  };
  const nextStatus = nextStatusMap[input.attendance];
  let updated: EstimateDeposit = {
    ...deposit,
    status: nextStatus,
    updatedAt: now,
    updatedBy: actor.uid,
  };
  await ESTIMATE_DEPOSITS.doc(deposit.id).set(updated, { merge: true });

  if (input.attendance === 'contractor_no_show') {
    updated = await autoRefundEstimateDepositIfNeeded({
      actor,
      deposit: updated,
      reason: 'contractor_no_show',
    });
  }

  if (project.contractorId && (input.attendance === 'contractor_present' || input.attendance === 'contractor_no_show')) {
    const weights = await getReliabilityWeightsConfig();
    await updateReliabilityScore({
      contractorId: project.contractorId,
      weights,
      updatedBy: actor.uid,
      delta: {
        appointmentsTotal: 1,
        appointmentsAttended: input.attendance === 'contractor_present' ? 1 : 0,
      },
    });
    await writeLedgerEvent({
      projectId: project.id,
      type: 'RELIABILITY_UPDATED',
      actorId: actor.uid,
      actorRole: actor.role,
      metadata: {
        contractorId: project.contractorId,
        source: 'estimate_attendance',
        attendance: input.attendance,
      },
    });
  }

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'markEstimateAttendance',
    targetType: 'estimateDeposit',
    targetId: deposit.id,
    details: { attendance: input.attendance, note: input.note ?? null },
  });

  return { deposit: updated };
}

export async function refundEstimateDepositHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'admin']);
  await requireFeatureFlag('estimateDepositsEnabled', 'Estimate deposits are disabled.');

  const input = parseOrThrow(refundEstimateDepositInputSchema, req.data);
  const deposit = await getEstimateDepositOrThrow(input.depositId);
  if (actor.role !== 'admin' && deposit.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only project customer or admin can refund estimate deposit.');
  }

  const updated = await autoRefundEstimateDepositIfNeeded({
    actor,
    deposit,
    reason: input.reason,
  });

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'refundEstimateDeposit',
    targetType: 'estimateDeposit',
    targetId: deposit.id,
    details: { reason: input.reason },
  });

  return { deposit: updated };
}

export async function applyEstimateDepositToJobHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);
  await requireFeatureFlag('estimateDepositsEnabled', 'Estimate deposits are disabled.');

  const input = parseOrThrow(applyEstimateDepositToJobInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can apply estimate deposit credit.');
  }

  const deposit = await getEstimateDepositOrThrow(input.depositId);
  if (deposit.projectId !== project.id) {
    throw new HttpsError('invalid-argument', 'Deposit does not belong to the provided project.');
  }
  if (!['CAPTURED', 'CONTRACTOR_ATTENDED', 'CUSTOMER_ATTENDED'].includes(deposit.status)) {
    throw new HttpsError('failed-precondition', 'Deposit must be captured before applying credit.');
  }

  const now = nowIso();
  await ESTIMATE_DEPOSITS.doc(deposit.id).set(
    {
      status: 'CREDITED_TO_JOB',
      creditedAt: now,
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  await PROJECTS.doc(project.id).set(
    {
      estimateDepositId: deposit.id,
      estimateDepositCreditCents: deposit.amountCents,
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  await writeLedgerEvent({
    projectId: project.id,
    type: 'ESTIMATE_DEPOSIT_CREDITED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: deposit.amountCents,
    metadata: { depositId: deposit.id },
  });

  return { projectId: project.id, depositId: deposit.id, creditedAmountCents: deposit.amountCents };
}

export async function createConnectedPaymentAccountHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['contractor', 'admin']);
  await requireFeatureFlag('stripeConnectEnabled', 'Stripe Connect is disabled.');

  const input = parseOrThrow(createConnectedPaymentAccountInputSchema, req.data ?? {});
  const provider = await getPaymentProvider();
  const userId = actor.uid;

  const account = await provider.createConnectedAccount({
    userId,
    country: input.country,
    type: input.type,
  });
  const now = nowIso();
  await PAYMENT_ACCOUNTS.doc(userId).set(
    {
      userId,
      provider: provider.providerName.includes('stripe') ? 'stripe' : provider.providerName,
      providerAccountId: account.providerAccountId,
      onboardingStatus: account.onboardingStatus,
      payoutsEnabled: account.onboardingStatus === 'ACTIVE',
      chargesEnabled: account.onboardingStatus === 'ACTIVE',
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'createConnectedPaymentAccount',
    targetType: 'paymentAccount',
    targetId: userId,
    details: { providerAccountId: account.providerAccountId },
  });

  return { paymentAccountId: userId, providerAccountId: account.providerAccountId, onboardingStatus: account.onboardingStatus };
}

export async function getPaymentOnboardingLinkHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['contractor', 'admin']);
  await requireFeatureFlag('stripeConnectEnabled', 'Stripe Connect is disabled.');

  const input = parseOrThrow(getPaymentOnboardingLinkInputSchema, req.data ?? {});
  const accountId = input.accountId ?? actor.uid;
  if (actor.role !== 'admin' && accountId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Cannot access payment onboarding for another user.');
  }

  const accountSnap = await PAYMENT_ACCOUNTS.doc(accountId).get();
  if (!accountSnap.exists) {
    throw new HttpsError('not-found', 'Payment account not found.');
  }
  const account = accountSnap.data() as any;
  const provider = await getPaymentProvider();
  const onboarding = await provider.getOnboardingLink({
    providerAccountId: account.providerAccountId,
    returnUrl: input.returnUrl ?? 'https://trustvibe.app/onboarding/complete',
    refreshUrl: input.refreshUrl ?? 'https://trustvibe.app/onboarding/retry',
  });

  await PAYMENT_ACCOUNTS.doc(accountId).set(
    {
      lastOnboardingLink: onboarding.url,
      updatedAt: nowIso(),
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  return { accountId, onboardingUrl: onboarding.url };
}

export async function recordBookingAttendanceHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);
  await requireFeatureFlag('schedulingEnabled', 'Scheduling is disabled.');

  const input = parseOrThrow(recordBookingAttendanceInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  ensureProjectParty(project, actor);

  const bookingRef = PROJECTS.doc(project.id).collection('bookingRequests').doc(input.bookingRequestId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new HttpsError('not-found', 'Booking request not found.');
  }
  const booking = bookingSnap.data() as BookingRequest;
  if (input.attendeeRole === 'customer' && actor.role !== 'customer' && actor.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only customer can report customer attendance.');
  }
  if (input.attendeeRole === 'contractor' && actor.role !== 'contractor' && actor.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only contractor can report contractor attendance.');
  }

  const now = nowIso();
  const attendanceField = input.attendeeRole === 'customer' ? 'customerAttendanceAt' : 'contractorAttendanceAt';
  const noShowBy = input.attended ? null : input.attendeeRole;
  await bookingRef.set(
    {
      [attendanceField]: now,
      noShowBy,
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  if (project.contractorId && input.attendeeRole === 'contractor') {
    const weights = await getReliabilityWeightsConfig();
    await updateReliabilityScore({
      contractorId: project.contractorId,
      weights,
      updatedBy: actor.uid,
      delta: {
        appointmentsTotal: 1,
        appointmentsAttended: input.attended ? 1 : 0,
      },
    });
  }

  if (!input.attended && input.attendeeRole === 'contractor' && booking.estimateDepositId) {
    const deposit = await getEstimateDepositOrThrow(booking.estimateDepositId);
    await autoRefundEstimateDepositIfNeeded({
      actor,
      deposit,
      reason: 'contractor_no_show_booking',
    });
  }

  await writeLedgerEvent({
    projectId: project.id,
    type: 'BOOKING_ATTENDANCE_RECORDED',
    actorId: actor.uid,
    actorRole: actor.role,
    metadata: {
      bookingRequestId: booking.id,
      attendeeRole: input.attendeeRole,
      attended: input.attended,
      note: input.note ?? null,
    },
  });

  return { projectId: project.id, bookingRequestId: booking.id, attendeeRole: input.attendeeRole, attended: input.attended };
}

export async function getReliabilityScoreHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);

  const input = parseOrThrow(getReliabilityScoreInputSchema, req.data ?? {});
  const contractorId = input.contractorId ?? (actor.role === 'contractor' ? actor.uid : undefined);
  if (!contractorId) {
    throw new HttpsError('invalid-argument', 'contractorId is required.');
  }
  const score = await getReliabilityScore(contractorId);
  return { score };
}

function mapVerificationStatus(status: CredentialVerification['status']): 'UNVERIFIED' | 'VERIFIED' | 'REJECTED' {
  if (status === 'VERIFIED') {
    return 'VERIFIED';
  }
  if (status === 'REJECTED') {
    return 'REJECTED';
  }
  return 'UNVERIFIED';
}

export async function submitCredentialForVerificationHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['contractor']);
  await requireFeatureFlag('credentialVerificationEnabled', 'Credential verification is disabled.');

  const input = parseOrThrow(submitCredentialForVerificationInputSchema, req.data);
  const profileRef = db.collection('contractorProfiles').doc(actor.uid);
  const profileSnap = await profileRef.get();
  const profile = (profileSnap.data() ?? { credentials: [] }) as any;
  const credentials: any[] = Array.isArray(profile.credentials) ? profile.credentials : [];
  const duplicate = credentials.find(
    (item) => item.type === input.credentialType && String(item.identifier ?? '').toUpperCase() === input.identifier.toUpperCase()
  );
  if (duplicate) {
    throw new HttpsError('failed-precondition', 'Credential identifier already submitted.');
  }

  const provider = await getCredentialVerificationProvider();
  const lookup =
    input.credentialType === 'daco_registration'
      ? await provider.verifyDacoRegistration({ identifier: input.identifier })
      : await provider.verifyPeritoLicense({ identifier: input.identifier });

  const now = nowIso();
  const ref = CREDENTIAL_VERIFICATIONS.doc();
  const verification: CredentialVerification = {
    id: ref.id,
    contractorId: actor.uid,
    credentialType: input.credentialType,
    identifier: input.identifier.toUpperCase(),
    status: lookup.status,
    source: 'mock_provider',
    matchedName: lookup.matchedName,
    expiresAt: input.expiresAt ?? lookup.expiresAt,
    verificationDetails: lookup.details,
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    updatedBy: actor.uid,
  };
  await ref.set(verification);

  credentials.push({
    type: input.credentialType,
    identifier: verification.identifier,
    fileUrl: input.documentUrl ?? '',
    status: mapVerificationStatus(verification.status),
    source: 'provider_lookup',
    expiresAt: verification.expiresAt,
    verifiedAt: verification.status === 'VERIFIED' ? now : undefined,
    verificationId: verification.id,
  });
  await profileRef.set(
    {
      userId: actor.uid,
      credentials,
      updatedAt: now,
      updatedBy: actor.uid,
      hasVerifiedCredentials: credentials.some((item) => item.status === 'VERIFIED'),
    },
    { merge: true }
  );

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'submitCredentialForVerification',
    targetType: 'credentialVerification',
    targetId: verification.id,
    details: { credentialType: verification.credentialType, status: verification.status },
  });

  return { verification };
}

export async function verifyCredentialHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin']);
  await requireFeatureFlag('credentialVerificationEnabled', 'Credential verification is disabled.');

  const input = parseOrThrow(verifyCredentialInputSchema, req.data);
  const verificationSnap = await CREDENTIAL_VERIFICATIONS.doc(input.verificationId).get();
  if (!verificationSnap.exists) {
    throw new HttpsError('not-found', 'Credential verification not found.');
  }
  const current = verificationSnap.data() as CredentialVerification;
  const provider = await getCredentialVerificationProvider();
  const lookup =
    current.credentialType === 'daco_registration'
      ? await provider.verifyDacoRegistration({ identifier: current.identifier })
      : await provider.verifyPeritoLicense({ identifier: current.identifier });

  const now = nowIso();
  const updated: CredentialVerification = {
    ...current,
    status: lookup.status,
    source: 'mock_provider',
    matchedName: lookup.matchedName,
    expiresAt: lookup.expiresAt ?? current.expiresAt,
    verificationDetails: lookup.details,
    updatedAt: now,
    updatedBy: actor.uid,
  };
  await CREDENTIAL_VERIFICATIONS.doc(current.id).set(updated, { merge: true });

  const profileRef = db.collection('contractorProfiles').doc(current.contractorId);
  const profileSnap = await profileRef.get();
  const profile = (profileSnap.data() ?? { credentials: [] }) as any;
  const credentials = (profile.credentials ?? []).map((credential: any) => {
    if (credential.verificationId !== current.id) {
      return credential;
    }
    return {
      ...credential,
      status: mapVerificationStatus(updated.status),
      verifiedAt: updated.status === 'VERIFIED' ? now : credential.verifiedAt,
      expiresAt: updated.expiresAt ?? credential.expiresAt,
    };
  });
  await profileRef.set(
    {
      credentials,
      hasVerifiedCredentials: credentials.some((item: any) => item.status === 'VERIFIED'),
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  return { verification: updated };
}

export async function createSubscriptionHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);
  await requireFeatureFlag('subscriptionsEnabled', 'Subscriptions are disabled.');

  const input = parseOrThrow(createSubscriptionInputSchema, req.data);
  if (actor.role === 'contractor' && input.audience !== 'contractor') {
    throw new HttpsError('permission-denied', 'Contractor can only create contractor subscriptions.');
  }

  const plans = await getSubscriptionPlansConfig();
  const plan = plans.plans.find((item) => item.id === input.planId && item.audience === input.audience && item.active);
  if (!plan) {
    throw new HttpsError('failed-precondition', 'Subscription plan is not available.');
  }

  const accountId = actor.uid;
  const provider = await getPaymentProvider();
  const subResult = await provider.createSubscription({
    accountRef: accountId,
    planCode: plan.id,
    quantity: input.unitCount ?? 1,
  });
  const now = nowIso();
  const ref = SUBSCRIPTIONS.doc();
  const subscription: Subscription = {
    id: ref.id,
    accountId,
    audience: input.audience,
    planId: plan.id,
    status: subResult.status,
    provider: provider.providerName.includes('stripe') ? 'stripe' : 'mock',
    providerSubscriptionId: subResult.providerSubscriptionId,
    currentPeriodStart: subResult.currentPeriodStart,
    currentPeriodEnd: subResult.currentPeriodEnd,
    cancelAtPeriodEnd: false,
    unitCount: input.unitCount,
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    updatedBy: actor.uid,
  };
  await ref.set(subscription);

  const invoiceRef = BILLING_INVOICES.doc();
  await invoiceRef.set({
    id: invoiceRef.id,
    subscriptionId: subscription.id,
    accountId,
    provider: subscription.provider,
    amountCents: plan.monthlyPriceCents,
    currency: 'USD',
    status: 'open',
    lineItems: [{ code: plan.id, description: `${plan.name} monthly`, amountCents: plan.monthlyPriceCents }],
    issuedAt: now,
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    updatedBy: actor.uid,
  });

  await writeLedgerEvent({
    projectId: 'subscription',
    type: 'SUBSCRIPTION_INVOICE_POSTED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: plan.monthlyPriceCents,
    metadata: { subscriptionId: subscription.id, invoiceId: invoiceRef.id, planId: plan.id },
  });

  return { subscriptionId: subscription.id };
}

export async function updateSubscriptionHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);
  await requireFeatureFlag('subscriptionsEnabled', 'Subscriptions are disabled.');

  const input = parseOrThrow(updateSubscriptionInputSchema, req.data);
  const subRef = SUBSCRIPTIONS.doc(input.subscriptionId);
  const subSnap = await subRef.get();
  if (!subSnap.exists) {
    throw new HttpsError('not-found', 'Subscription not found.');
  }
  const subscription = subSnap.data() as Subscription;
  if (actor.role !== 'admin' && subscription.accountId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Cannot modify another account subscription.');
  }

  const provider = await getPaymentProvider();
  if (subscription.providerSubscriptionId) {
    await provider.updateSubscription({
      providerSubscriptionId: subscription.providerSubscriptionId,
      planCode: input.planId,
      quantity: input.unitCount,
    });
  }

  await subRef.set(
    {
      planId: input.planId ?? subscription.planId,
      unitCount: input.unitCount ?? subscription.unitCount,
      updatedAt: nowIso(),
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  return { subscriptionId: input.subscriptionId, updated: true };
}

export async function cancelSubscriptionHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);
  await requireFeatureFlag('subscriptionsEnabled', 'Subscriptions are disabled.');

  const input = parseOrThrow(cancelSubscriptionInputSchema, req.data);
  const subRef = SUBSCRIPTIONS.doc(input.subscriptionId);
  const subSnap = await subRef.get();
  if (!subSnap.exists) {
    throw new HttpsError('not-found', 'Subscription not found.');
  }
  const subscription = subSnap.data() as Subscription;
  if (actor.role !== 'admin' && subscription.accountId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Cannot cancel another account subscription.');
  }

  const provider = await getPaymentProvider();
  if (!input.cancelAtPeriodEnd && subscription.providerSubscriptionId) {
    await provider.cancelSubscription(subscription.providerSubscriptionId);
  } else if (subscription.providerSubscriptionId) {
    await provider.updateSubscription({
      providerSubscriptionId: subscription.providerSubscriptionId,
      cancelAtPeriodEnd: true,
    });
  }

  await subRef.set(
    {
      cancelAtPeriodEnd: input.cancelAtPeriodEnd,
      status: input.cancelAtPeriodEnd ? subscription.status : 'canceled',
      updatedAt: nowIso(),
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  return { subscriptionId: input.subscriptionId, status: input.cancelAtPeriodEnd ? 'cancel_pending' : 'canceled' };
}

export async function listInvoicesHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer', 'contractor', 'admin']);
  await requireFeatureFlag('subscriptionsEnabled', 'Subscriptions are disabled.');

  const input = parseOrThrow(listInvoicesInputSchema, req.data ?? {});
  const limit = input.limit ?? 30;
  let query = BILLING_INVOICES.limit(limit);
  if (input.subscriptionId) {
    query = BILLING_INVOICES.where('subscriptionId', '==', input.subscriptionId).limit(limit);
  }
  const snap = await query.get();
  const rows = snap.docs.map((doc) => doc.data() as any);
  const invoices = actor.role === 'admin' ? rows : rows.filter((item) => item.accountId === actor.uid);
  return { invoices };
}

function resolveHighTicketAmount(project: any): number {
  const selectedQuoteAmount = Number(project.selectedQuotePriceCents ?? 0);
  const budgetAmount = Number(project.budgetMaxCents ?? project.budgetMinCents ?? 0);
  return Math.max(selectedQuoteAmount, budgetAmount);
}

export async function createHighTicketCaseHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['customer']);
  await requireFeatureFlag('highTicketConciergeEnabled', 'High-ticket concierge is disabled.');

  const input = parseOrThrow(createHighTicketCaseInputSchema, req.data);
  const project = await getProjectOrThrow(input.projectId);
  if (project.customerId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only customer can create high-ticket case.');
  }

  const policy = await getHighTicketPolicyConfig();
  const amountCents = resolveHighTicketAmount(project);
  if (amountCents < policy.thresholdCents) {
    throw new HttpsError('failed-precondition', 'Project does not meet high-ticket threshold.');
  }

  const now = nowIso();
  const caseRef = HIGH_TICKET_CASES.doc();
  const record: HighTicketCase = {
    id: caseRef.id,
    projectId: project.id,
    customerId: actor.uid,
    contractorId: project.contractorId ?? undefined,
    status: 'INTAKE',
    intakeNotes: input.intakeNotes,
    preferredStartDate: input.preferredStartDate,
    intakeFeeCents: policy.intakeFeeCents,
    successFeeBps: policy.successFeeBps,
    referralFeeBps: policy.feeMode === 'contractor_referral' ? policy.contractorReferralFeeBps : undefined,
    bidsCount: 0,
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    updatedBy: actor.uid,
  };
  await caseRef.set(record);

  await PROJECTS.doc(project.id).set(
    {
      highTicket: true,
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  await writeLedgerEvent({
    projectId: project.id,
    type: 'CONCIERGE_INTAKE_FEE_CHARGED',
    actorId: actor.uid,
    actorRole: actor.role,
    amountCents: policy.intakeFeeCents,
    metadata: { highTicketCaseId: record.id },
  });

  return { highTicketCase: record };
}

export async function submitConciergeBidHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['contractor', 'admin']);
  await requireFeatureFlag('highTicketConciergeEnabled', 'High-ticket concierge is disabled.');

  const input = parseOrThrow(submitConciergeBidInputSchema, req.data);
  const caseRef = HIGH_TICKET_CASES.doc(input.caseId);
  const caseSnap = await caseRef.get();
  if (!caseSnap.exists) {
    throw new HttpsError('not-found', 'High-ticket case not found.');
  }
  const record = caseSnap.data() as HighTicketCase;
  const project = await getProjectOrThrow(record.projectId);
  if (actor.role === 'contractor' && project.contractorId && project.contractorId !== actor.uid) {
    throw new HttpsError('permission-denied', 'Only assigned contractor can submit bid for this case.');
  }

  const now = nowIso();
  const bidRef = caseRef.collection('bids').doc();
  await bidRef.set({
    id: bidRef.id,
    caseId: record.id,
    projectId: input.projectId,
    contractorId: actor.role === 'contractor' ? actor.uid : null,
    amountCents: input.amountCents,
    milestoneTemplate: input.milestoneTemplate ?? [],
    createdAt: now,
    updatedAt: now,
    updatedBy: actor.uid,
  });

  await caseRef.set(
    {
      bidsCount: (record.bidsCount ?? 0) + 1,
      status: 'BIDDING',
      updatedAt: now,
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  return { caseId: record.id, bidId: bidRef.id };
}

export async function assignConciergeManagerHandler(req: CallableRequest<unknown>) {
  const actor = await getActor(req.auth);
  requireRole(actor, ['admin']);
  await requireFeatureFlag('highTicketConciergeEnabled', 'High-ticket concierge is disabled.');

  const input = parseOrThrow(assignConciergeManagerInputSchema, req.data);
  const caseRef = HIGH_TICKET_CASES.doc(input.caseId);
  const caseSnap = await caseRef.get();
  if (!caseSnap.exists) {
    throw new HttpsError('not-found', 'High-ticket case not found.');
  }

  await caseRef.set(
    {
      conciergeManagerId: input.adminUserId,
      status: 'MILESTONE_SETUP',
      updatedAt: nowIso(),
      updatedBy: actor.uid,
    },
    { merge: true }
  );

  await writeAuditLog({
    actorId: actor.uid,
    actorRole: actor.role,
    action: 'assignConciergeManager',
    targetType: 'highTicketCase',
    targetId: input.caseId,
    details: { adminUserId: input.adminUserId },
  });

  return { caseId: input.caseId, conciergeManagerId: input.adminUserId };
}

export async function recomputeReliabilityScoresHandler(): Promise<{ processed: number }> {
  const flags = await getFeatureFlags();
  if (!flags.reliabilityScoringEnabled) {
    return { processed: 0 };
  }
  const weights = await getReliabilityWeightsConfig();
  const projectsSnap = await PROJECTS.where('contractorId', '!=', null).limit(300).get();
  const uniqueContractors = new Set<string>();
  projectsSnap.docs.forEach((doc) => {
    const data = doc.data() as any;
    if (data.contractorId) {
      uniqueContractors.add(data.contractorId);
    }
  });
  for (const contractorId of uniqueContractors.values()) {
    await updateReliabilityScore({
      contractorId,
      weights,
      updatedBy: 'system-recompute',
      delta: {},
    });
  }
  return { processed: uniqueContractors.size };
}
