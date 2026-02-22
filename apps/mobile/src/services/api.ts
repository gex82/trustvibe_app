import {
  createUserWithEmailAndPassword,
  type AuthError,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import i18n from 'i18next';
import {
  DEFAULT_FEATURE_FLAGS,
  type CallableName,
  type CallableRequest,
  type CallableResponse,
  type FeatureFlags,
  type Role,
} from '@trustvibe/shared';
import { auth, db, functions, maybeConnectEmulators } from './firebase';

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

export type UserProfile = {
  id: string;
  role: Role;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) {
    return null;
  }
  const data = snap.data() as Record<string, unknown>;
  return {
    id: uid,
    role: (data.role as Role | undefined) ?? 'customer',
    email: String(data.email ?? ''),
    name: String(data.name ?? ''),
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
  };
}

async function call<TName extends CallableName>(
  name: TName,
  payload: CallableRequest<TName>
): Promise<CallableResponse<TName>> {
  const fn = httpsCallable<CallableRequest<TName>, CallableResponse<TName>>(functions, name);
  const result = await fn(payload);
  return result.data;
}

export async function getCurrentConfig(): Promise<{
  featureFlags: FeatureFlags;
}> {
  try {
    const result = await call('getCurrentConfig', {});
    return {
      featureFlags: result.featureFlags ?? DEFAULT_FEATURE_FLAGS,
    };
  } catch {
    return { featureFlags: DEFAULT_FEATURE_FLAGS };
  }
}

export function mapApiError(error: unknown): string {
  const maybeError = error as Partial<AuthError> & { message?: string };
  const code = maybeError.code ?? '';
  const message = maybeError.message ?? String(error);

  if (code.includes('network-request-failed') || message.includes('network-request-failed')) {
    return i18n.t('errors.networkUnavailable');
  }
  if (code.includes('too-many-requests')) {
    return i18n.t('errors.tooManyRequests');
  }
  if (code.includes('invalid-credential') || code.includes('wrong-password')) {
    return i18n.t('errors.invalidCredentials');
  }
  if (code.includes('email-already-in-use')) {
    return i18n.t('errors.emailInUse');
  }
  if (code.includes('failed-precondition')) {
    return i18n.t('errors.failedPrecondition');
  }
  if (code.includes('permission-denied')) {
    return i18n.t('errors.permissionDenied');
  }

  return message;
}

export function listProjects(
  payload: CallableRequest<'listProjects'>
): Promise<CallableResponse<'listProjects'>> {
  return call('listProjects', payload);
}

export function createProject(
  payload: CallableRequest<'createProject'>
): Promise<CallableResponse<'createProject'>> {
  return call('createProject', payload);
}

export function getProject(payload: CallableRequest<'getProject'>): Promise<CallableResponse<'getProject'>> {
  return call('getProject', payload);
}

export function submitQuote(payload: CallableRequest<'submitQuote'>): Promise<CallableResponse<'submitQuote'>> {
  return call('submitQuote', payload);
}

export function selectContractor(
  payload: CallableRequest<'selectContractor'>
): Promise<CallableResponse<'selectContractor'>> {
  return call('selectContractor', payload);
}

export function acceptAgreement(
  payload: CallableRequest<'acceptAgreement'>
): Promise<CallableResponse<'acceptAgreement'>> {
  return call('acceptAgreement', payload);
}

export function fundHold(payload: CallableRequest<'fundHold'>): Promise<CallableResponse<'fundHold'>> {
  return call('fundHold', payload);
}

export function requestCompletion(
  payload: CallableRequest<'requestCompletion'>
): Promise<CallableResponse<'requestCompletion'>> {
  return call('requestCompletion', payload);
}

export function approveRelease(
  payload: CallableRequest<'approveRelease'>
): Promise<CallableResponse<'approveRelease'>> {
  return call('approveRelease', payload);
}

export function raiseIssueHold(
  payload: CallableRequest<'raiseIssueHold'>
): Promise<CallableResponse<'raiseIssueHold'>> {
  return call('raiseIssueHold', payload);
}

export function proposeJointRelease(
  payload: CallableRequest<'proposeJointRelease'>
): Promise<CallableResponse<'proposeJointRelease'>> {
  return call('proposeJointRelease', payload);
}

export function signJointRelease(
  payload: CallableRequest<'signJointRelease'>
): Promise<CallableResponse<'signJointRelease'>> {
  return call('signJointRelease', payload);
}

export function uploadResolutionDocument(
  payload: CallableRequest<'uploadResolutionDocument'>
): Promise<CallableResponse<'uploadResolutionDocument'>> {
  return call('uploadResolutionDocument', payload);
}

export function listMessages(
  payload: CallableRequest<'listMessages'>
): Promise<CallableResponse<'listMessages'>> {
  return call('listMessages', payload);
}

export function sendMessage(payload: CallableRequest<'sendMessage'>): Promise<CallableResponse<'sendMessage'>> {
  return call('sendMessage', payload);
}

export function createMilestones(
  payload: CallableRequest<'createMilestones'>
): Promise<CallableResponse<'createMilestones'>> {
  return call('createMilestones', payload);
}

export function approveMilestone(
  payload: CallableRequest<'approveMilestone'>
): Promise<CallableResponse<'approveMilestone'>> {
  return call('approveMilestone', payload);
}

export function proposeChangeOrder(
  payload: CallableRequest<'proposeChangeOrder'>
): Promise<CallableResponse<'proposeChangeOrder'>> {
  return call('proposeChangeOrder', payload);
}

export function acceptChangeOrder(
  payload: CallableRequest<'acceptChangeOrder'>
): Promise<CallableResponse<'acceptChangeOrder'>> {
  return call('acceptChangeOrder', payload);
}

export function createBookingRequest(
  payload: CallableRequest<'createBookingRequest'>
): Promise<CallableResponse<'createBookingRequest'>> {
  return call('createBookingRequest', payload);
}

export function respondBookingRequest(
  payload: CallableRequest<'respondBookingRequest'>
): Promise<CallableResponse<'respondBookingRequest'>> {
  return call('respondBookingRequest', payload);
}

export function recordBookingAttendance(
  payload: CallableRequest<'recordBookingAttendance'>
): Promise<CallableResponse<'recordBookingAttendance'>> {
  return call('recordBookingAttendance', payload);
}

export function createEstimateDeposit(
  payload: CallableRequest<'createEstimateDeposit'>
): Promise<CallableResponse<'createEstimateDeposit'>> {
  return call('createEstimateDeposit', payload);
}

export function previewEstimateDeposit(
  payload: CallableRequest<'previewEstimateDeposit'>
): Promise<CallableResponse<'previewEstimateDeposit'>> {
  return call('previewEstimateDeposit', payload);
}

export function captureEstimateDeposit(
  payload: CallableRequest<'captureEstimateDeposit'>
): Promise<CallableResponse<'captureEstimateDeposit'>> {
  return call('captureEstimateDeposit', payload);
}

export function markEstimateAttendance(
  payload: CallableRequest<'markEstimateAttendance'>
): Promise<CallableResponse<'markEstimateAttendance'>> {
  return call('markEstimateAttendance', payload);
}

export function refundEstimateDeposit(
  payload: CallableRequest<'refundEstimateDeposit'>
): Promise<CallableResponse<'refundEstimateDeposit'>> {
  return call('refundEstimateDeposit', payload);
}

export function applyEstimateDepositToJob(
  payload: CallableRequest<'applyEstimateDepositToJob'>
): Promise<CallableResponse<'applyEstimateDepositToJob'>> {
  return call('applyEstimateDepositToJob', payload);
}

export function createConnectedPaymentAccount(
  payload: CallableRequest<'createConnectedPaymentAccount'>
): Promise<CallableResponse<'createConnectedPaymentAccount'>> {
  return call('createConnectedPaymentAccount', payload);
}

export function getPaymentOnboardingLink(
  payload: CallableRequest<'getPaymentOnboardingLink'>
): Promise<CallableResponse<'getPaymentOnboardingLink'>> {
  return call('getPaymentOnboardingLink', payload);
}

export function getReliabilityScore(
  payload: CallableRequest<'getReliabilityScore'>
): Promise<CallableResponse<'getReliabilityScore'>> {
  return call('getReliabilityScore', payload);
}

export function submitCredentialForVerification(
  payload: CallableRequest<'submitCredentialForVerification'>
): Promise<CallableResponse<'submitCredentialForVerification'>> {
  return call('submitCredentialForVerification', payload);
}

export function createSubscription(
  payload: CallableRequest<'createSubscription'>
): Promise<CallableResponse<'createSubscription'>> {
  return call('createSubscription', payload);
}

export function updateSubscription(
  payload: CallableRequest<'updateSubscription'>
): Promise<CallableResponse<'updateSubscription'>> {
  return call('updateSubscription', payload);
}

export function cancelSubscription(
  payload: CallableRequest<'cancelSubscription'>
): Promise<CallableResponse<'cancelSubscription'>> {
  return call('cancelSubscription', payload);
}

export function listInvoices(payload: CallableRequest<'listInvoices'>): Promise<CallableResponse<'listInvoices'>> {
  return call('listInvoices', payload);
}

export function createHighTicketCase(
  payload: CallableRequest<'createHighTicketCase'>
): Promise<CallableResponse<'createHighTicketCase'>> {
  return call('createHighTicketCase', payload);
}

export function submitConciergeBid(
  payload: CallableRequest<'submitConciergeBid'>
): Promise<CallableResponse<'submitConciergeBid'>> {
  return call('submitConciergeBid', payload);
}

export function getRecommendations(
  payload: CallableRequest<'getRecommendations'>
): Promise<CallableResponse<'getRecommendations'>> {
  return call('getRecommendations', payload);
}

export function applyReferralCode(
  payload: CallableRequest<'applyReferralCode'>
): Promise<CallableResponse<'applyReferralCode'>> {
  return call('applyReferralCode', payload);
}

export function listFeaturedListings(
  payload: CallableRequest<'listFeaturedListings'>
): Promise<CallableResponse<'listFeaturedListings'>> {
  return call('listFeaturedListings', payload);
}

export function submitReview(payload: CallableRequest<'submitReview'>): Promise<CallableResponse<'submitReview'>> {
  return call('submitReview', payload);
}
