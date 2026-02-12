import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, maybeConnectEmulators } from './firebase';
import type { Role } from '@trustvibe/shared';

maybeConnectEmulators();

export type AuthPayload = {
  email: string;
  password: string;
};

export async function login(payload: AuthPayload): Promise<void> {
  await signInWithEmailAndPassword(auth, payload.email, payload.password);
}

export async function register(payload: AuthPayload & { role: Role; name: string }): Promise<void> {
  const result = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  await updateProfile(result.user, { displayName: payload.name });
  const now = new Date().toISOString();
  await setDoc(doc(db, 'users', result.user.uid), {
    id: result.user.uid,
    role: payload.role,
    email: payload.email,
    name: payload.name,
    createdAt: now,
    updatedAt: now,
  });
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: { uid: string; email: string | null } | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback(null);
      return;
    }

    callback({ uid: user.uid, email: user.email });
  });
}

async function call<TInput extends object, TOutput>(name: string, payload: TInput): Promise<TOutput> {
  const fn = httpsCallable<TInput, TOutput>(functions, name);
  const result = await fn(payload);
  return result.data;
}

export function listProjects(payload: {
  mineOnly?: boolean;
  municipality?: string;
  category?: string;
  budgetMinCents?: number;
  budgetMaxCents?: number;
  limit?: number;
}): Promise<{ projects: any[] }> {
  return call('listProjects', payload);
}

export function createProject(payload: {
  category: string;
  title: string;
  description: string;
  photos: string[];
  municipality: string;
  desiredTimeline: string;
  budgetMinCents?: number;
  budgetMaxCents?: number;
}): Promise<{ project: any }> {
  return call('createProject', payload);
}

export function getProject(payload: { projectId: string }): Promise<{ project: any; quotes: any[] }> {
  return call('getProject', payload);
}

export function submitQuote(payload: {
  projectId: string;
  priceCents: number;
  timelineDays: number;
  scopeNotes: string;
}): Promise<{ quote: any }> {
  return call('submitQuote', payload);
}

export function selectContractor(payload: { projectId: string; quoteId: string }): Promise<{ agreementId: string }> {
  return call('selectContractor', payload);
}

export function acceptAgreement(payload: { agreementId: string }): Promise<{ readyToFund: boolean }> {
  return call('acceptAgreement', payload);
}

export function fundHold(payload: { projectId: string }): Promise<any> {
  return call('fundHold', payload);
}

export function requestCompletion(payload: { projectId: string; proofPhotoUrls?: string[] }): Promise<any> {
  return call('requestCompletion', payload);
}

export function approveRelease(payload: { projectId: string }): Promise<any> {
  return call('approveRelease', payload);
}

export function raiseIssueHold(payload: { projectId: string; reason: string }): Promise<any> {
  return call('raiseIssueHold', payload);
}

export function proposeJointRelease(payload: {
  projectId: string;
  releaseToContractorCents: number;
  refundToCustomerCents: number;
}): Promise<{ proposalId: string }> {
  return call('proposeJointRelease', payload);
}

export function signJointRelease(payload: { projectId: string; proposalId: string }): Promise<any> {
  return call('signJointRelease', payload);
}

export function uploadResolutionDocument(payload: {
  projectId: string;
  documentUrl: string;
  resolutionType: 'court_order' | 'mediator_decision' | 'signed_settlement';
  summary: string;
}): Promise<any> {
  return call('uploadResolutionDocument', payload);
}

export function listMessages(payload: { projectId: string; limit?: number }): Promise<{ projectId: string; messages: any[] }> {
  return call('listMessages', payload);
}

export function sendMessage(payload: { projectId: string; body: string; attachments?: string[] }): Promise<{ message: any }> {
  return call('sendMessage', payload);
}

export function createMilestones(payload: {
  projectId: string;
  milestones: Array<{ title: string; amountCents: number; acceptanceCriteria: string; dueDate?: string }>;
}): Promise<{ projectId: string; milestones: any[] }> {
  return call('createMilestones', payload);
}

export function approveMilestone(payload: {
  projectId: string;
  milestoneId: string;
}): Promise<{ projectId: string; milestoneId: string; releasedAmountCents: number }> {
  return call('approveMilestone', payload);
}

export function proposeChangeOrder(payload: {
  projectId: string;
  scopeSummary: string;
  amountDeltaCents: number;
  timelineDeltaDays: number;
}): Promise<{ changeOrder: any }> {
  return call('proposeChangeOrder', payload);
}

export function acceptChangeOrder(payload: {
  projectId: string;
  changeOrderId: string;
  accept: boolean;
}): Promise<{ changeOrderId: string; status: string }> {
  return call('acceptChangeOrder', payload);
}

export function createBookingRequest(payload: {
  projectId: string;
  startAt: string;
  endAt: string;
  estimateDepositId?: string;
  note?: string;
}): Promise<{ bookingRequest: any }> {
  return call('createBookingRequest', payload);
}

export function respondBookingRequest(payload: {
  projectId: string;
  bookingRequestId: string;
  response: 'confirm' | 'decline';
}): Promise<{ bookingRequestId: string; status: string }> {
  return call('respondBookingRequest', payload);
}

export function recordBookingAttendance(payload: {
  projectId: string;
  bookingRequestId: string;
  attendeeRole: 'customer' | 'contractor';
  attended: boolean;
  note?: string;
}): Promise<{ bookingRequestId: string; attended: boolean }> {
  return call('recordBookingAttendance', payload);
}

export function createEstimateDeposit(payload: {
  projectId: string;
  category?: string;
  appointmentStartAt?: string;
}): Promise<{ deposit: any }> {
  return call('createEstimateDeposit', payload);
}

export function captureEstimateDeposit(payload: { depositId: string; paymentMethodId?: string }): Promise<{ deposit: any }> {
  return call('captureEstimateDeposit', payload);
}

export function markEstimateAttendance(payload: {
  depositId: string;
  attendance: 'customer_present' | 'contractor_present' | 'customer_no_show' | 'contractor_no_show';
  note?: string;
}): Promise<{ deposit: any }> {
  return call('markEstimateAttendance', payload);
}

export function refundEstimateDeposit(payload: { depositId: string; reason: string }): Promise<{ deposit: any }> {
  return call('refundEstimateDeposit', payload);
}

export function applyEstimateDepositToJob(payload: {
  projectId: string;
  depositId: string;
}): Promise<{ projectId: string; creditedAmountCents: number }> {
  return call('applyEstimateDepositToJob', payload);
}

export function createConnectedPaymentAccount(payload: {
  country?: string;
  type?: 'express' | 'standard';
}): Promise<{ paymentAccountId: string; providerAccountId: string }> {
  return call('createConnectedPaymentAccount', payload);
}

export function getPaymentOnboardingLink(payload: {
  accountId?: string;
  returnUrl?: string;
  refreshUrl?: string;
}): Promise<{ onboardingUrl: string }> {
  return call('getPaymentOnboardingLink', payload);
}

export function getReliabilityScore(payload: { contractorId?: string }): Promise<{ score: any }> {
  return call('getReliabilityScore', payload);
}

export function submitCredentialForVerification(payload: {
  credentialType: 'daco_registration' | 'perito_license';
  identifier: string;
  documentUrl?: string;
  expiresAt?: string;
}): Promise<{ verification: any }> {
  return call('submitCredentialForVerification', payload);
}

export function createSubscription(payload: {
  audience: 'contractor' | 'property_manager';
  planId: string;
  billingEmail?: string;
  unitCount?: number;
}): Promise<{ subscriptionId: string }> {
  return call('createSubscription', payload);
}

export function updateSubscription(payload: {
  subscriptionId: string;
  planId?: string;
  unitCount?: number;
}): Promise<{ subscriptionId: string; updated: boolean }> {
  return call('updateSubscription', payload);
}

export function cancelSubscription(payload: {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
}): Promise<{ subscriptionId: string; status: string }> {
  return call('cancelSubscription', payload);
}

export function listInvoices(payload: { subscriptionId?: string; limit?: number }): Promise<{ invoices: any[] }> {
  return call('listInvoices', payload);
}

export function createHighTicketCase(payload: {
  projectId: string;
  intakeNotes: string;
  preferredStartDate?: string;
}): Promise<{ highTicketCase: any }> {
  return call('createHighTicketCase', payload);
}

export function submitConciergeBid(payload: {
  caseId: string;
  projectId: string;
  amountCents: number;
  milestoneTemplate?: Array<{ title: string; amountCents: number; acceptanceCriteria: string }>;
}): Promise<{ caseId: string; bidId: string }> {
  return call('submitConciergeBid', payload);
}

export function getRecommendations(payload: {
  target?: 'customer' | 'contractor';
  municipality?: string;
  category?: string;
  limit?: number;
}): Promise<{ target: string; recommendations: any[] }> {
  return call('getRecommendations', payload);
}

export function applyReferralCode(payload: { code: string; projectId?: string }): Promise<any> {
  return call('applyReferralCode', payload);
}

export function listFeaturedListings(payload: { limit?: number }): Promise<{ featured: any[] }> {
  return call('listFeaturedListings', payload);
}

export function submitReview(payload: {
  projectId: string;
  rating: number;
  feedback: string;
  tags: Array<'quality' | 'communication' | 'timeliness'>;
}): Promise<{ reviewId: string }> {
  return call('submitReview', payload);
}
