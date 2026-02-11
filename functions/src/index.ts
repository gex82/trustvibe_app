import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  acceptChangeOrderHandler,
  acceptAgreementHandler,
  adminSetPromotionHandler,
  adminSetUserRoleHandler,
  adminExecuteOutcomeHandler,
  adminModerateReviewHandler,
  adminSetConfigHandler,
  applyReferralCodeHandler,
  approveMilestoneHandler,
  approveReleaseHandler,
  checkAutoReleaseHandler,
  createBookingRequestHandler,
  createMilestonesHandler,
  createProjectHandler,
  flagReviewHandler,
  fundHoldHandler,
  getAdminSessionHandler,
  getCurrentConfigHandler,
  getRecommendationsHandler,
  getProjectHandler,
  listFeaturedListingsHandler,
  listMessagesHandler,
  listProjectsHandler,
  listQuotesHandler,
  proposeChangeOrderHandler,
  proposeJointReleaseHandler,
  raiseIssueHoldHandler,
  respondBookingRequestHandler,
  requestCompletionHandler,
  selectContractorHandler,
  sendMessageHandler,
  sendIssueRemindersHandler,
  signJointReleaseHandler,
  submitQuoteHandler,
  submitReviewHandler,
  uploadResolutionDocumentHandler,
} from './http/handlers';

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
export const getRecommendations = onCall(callOptions, getRecommendationsHandler);
export const adminSetPromotion = onCall(callOptions, adminSetPromotionHandler);
export const applyReferralCode = onCall(callOptions, applyReferralCodeHandler);
export const listFeaturedListings = onCall(callOptions, listFeaturedListingsHandler);

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
