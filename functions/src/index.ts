import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  acceptAgreementHandler,
  createProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  listQuotesHandler,
  selectContractorHandler,
  submitQuoteHandler,
} from './http/projectHandlers';
import { listMessagesHandler, sendMessageHandler } from './http/messageHandlers';
import {
  acceptChangeOrderHandler,
  approveMilestoneHandler,
  approveReleaseHandler,
  checkAutoReleaseHandler,
  createBookingRequestHandler,
  createMilestonesHandler,
  fundHoldHandler,
  proposeChangeOrderHandler,
  proposeJointReleaseHandler,
  raiseIssueHoldHandler,
  recordBookingAttendanceHandler,
  respondBookingRequestHandler,
  requestCompletionHandler,
  sendIssueRemindersHandler,
  signJointReleaseHandler,
  uploadResolutionDocumentHandler,
} from './http/escrowHandlers';
import {
  adminExecuteOutcomeHandler,
  adminModerateReviewHandler,
  adminSetConfigHandler,
  adminSetUserRoleHandler,
  flagReviewHandler,
  getAdminSessionHandler,
  getCurrentConfigHandler,
  submitReviewHandler,
} from './http/adminHandlers';
import {
  adminSetPromotionHandler,
  applyReferralCodeHandler,
  getRecommendationsHandler,
  listFeaturedListingsHandler,
} from './http/growthHandlers';
import {
  applyEstimateDepositToJobHandler,
  captureEstimateDepositHandler,
  createEstimateDepositHandler,
  markEstimateAttendanceHandler,
  refundEstimateDepositHandler,
} from './http/depositsHandlers';
import {
  createConnectedPaymentAccountHandler,
  getPaymentOnboardingLinkHandler,
  getReliabilityScoreHandler,
  recomputeReliabilityScoresHandler,
} from './http/paymentsHandlers';
import {
  submitCredentialForVerificationHandler,
  verifyCredentialHandler,
} from './http/verificationHandlers';
import {
  cancelSubscriptionHandler,
  createSubscriptionHandler,
  listInvoicesHandler,
  updateSubscriptionHandler,
} from './http/subscriptionsHandlers';
import {
  assignConciergeManagerHandler,
  createHighTicketCaseHandler,
  submitConciergeBidHandler,
} from './http/conciergeHandlers';

const callOptions = {
  region: 'us-central1' as const,
  timeoutSeconds: 60,
};

export const createProject = onCall(callOptions, createProjectHandler);
export const listProjects = onCall(callOptions, listProjectsHandler);
export const getProject = onCall(callOptions, getProjectHandler);
export const listMessages = onCall(callOptions, listMessagesHandler);
export const sendMessage = onCall(callOptions, sendMessageHandler);

export const submitQuote = onCall(callOptions, submitQuoteHandler);
export const listQuotes = onCall(callOptions, listQuotesHandler);
export const selectContractor = onCall(callOptions, selectContractorHandler);

export const acceptAgreement = onCall(callOptions, acceptAgreementHandler);
export const fundHold = onCall(callOptions, fundHoldHandler);

export const requestCompletion = onCall(callOptions, requestCompletionHandler);
export const approveRelease = onCall(callOptions, approveReleaseHandler);
export const raiseIssueHold = onCall(callOptions, raiseIssueHoldHandler);

export const proposeJointRelease = onCall(callOptions, proposeJointReleaseHandler);
export const signJointRelease = onCall(callOptions, signJointReleaseHandler);

export const uploadResolutionDocument = onCall(callOptions, uploadResolutionDocumentHandler);
export const adminExecuteOutcome = onCall(callOptions, adminExecuteOutcomeHandler);

export const submitReview = onCall(callOptions, submitReviewHandler);
export const flagReview = onCall(callOptions, flagReviewHandler);
export const adminModerateReview = onCall(callOptions, adminModerateReviewHandler);

export const adminSetConfig = onCall(callOptions, adminSetConfigHandler);
export const getCurrentConfig = onCall(callOptions, getCurrentConfigHandler);
export const getAdminSession = onCall(callOptions, getAdminSessionHandler);
export const adminSetUserRole = onCall(callOptions, adminSetUserRoleHandler);

export const createMilestones = onCall(callOptions, createMilestonesHandler);
export const approveMilestone = onCall(callOptions, approveMilestoneHandler);
export const proposeChangeOrder = onCall(callOptions, proposeChangeOrderHandler);
export const acceptChangeOrder = onCall(callOptions, acceptChangeOrderHandler);
export const createBookingRequest = onCall(callOptions, createBookingRequestHandler);
export const respondBookingRequest = onCall(callOptions, respondBookingRequestHandler);
export const recordBookingAttendance = onCall(callOptions, recordBookingAttendanceHandler);
export const getRecommendations = onCall(callOptions, getRecommendationsHandler);
export const adminSetPromotion = onCall(callOptions, adminSetPromotionHandler);
export const applyReferralCode = onCall(callOptions, applyReferralCodeHandler);
export const listFeaturedListings = onCall(callOptions, listFeaturedListingsHandler);
export const createEstimateDeposit = onCall(callOptions, createEstimateDepositHandler);
export const captureEstimateDeposit = onCall(callOptions, captureEstimateDepositHandler);
export const markEstimateAttendance = onCall(callOptions, markEstimateAttendanceHandler);
export const refundEstimateDeposit = onCall(callOptions, refundEstimateDepositHandler);
export const applyEstimateDepositToJob = onCall(callOptions, applyEstimateDepositToJobHandler);
export const createConnectedPaymentAccount = onCall(callOptions, createConnectedPaymentAccountHandler);
export const getPaymentOnboardingLink = onCall(callOptions, getPaymentOnboardingLinkHandler);
export const getReliabilityScore = onCall(callOptions, getReliabilityScoreHandler);
export const submitCredentialForVerification = onCall(callOptions, submitCredentialForVerificationHandler);
export const verifyCredential = onCall(callOptions, verifyCredentialHandler);
export const createSubscription = onCall(callOptions, createSubscriptionHandler);
export const updateSubscription = onCall(callOptions, updateSubscriptionHandler);
export const cancelSubscription = onCall(callOptions, cancelSubscriptionHandler);
export const listInvoices = onCall(callOptions, listInvoicesHandler);
export const createHighTicketCase = onCall(callOptions, createHighTicketCaseHandler);
export const submitConciergeBid = onCall(callOptions, submitConciergeBidHandler);
export const assignConciergeManager = onCall(callOptions, assignConciergeManagerHandler);

export const checkAutoRelease = onSchedule(
  { schedule: 'every 24 hours', region: 'us-central1', timeZone: 'America/Puerto_Rico' },
  async () => {
    await checkAutoReleaseHandler();
  }
);

export const sendIssueReminders = onSchedule(
  { schedule: 'every 24 hours', region: 'us-central1', timeZone: 'America/Puerto_Rico' },
  async () => {
    await sendIssueRemindersHandler();
  }
);

export const recomputeReliabilityScores = onSchedule(
  { schedule: 'every 24 hours', region: 'us-central1', timeZone: 'America/Puerto_Rico' },
  async () => {
    await recomputeReliabilityScoresHandler();
  }
);
