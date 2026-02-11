"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeApprovalDeadline = computeApprovalDeadline;
exports.isApprovalDeadlinePassed = isApprovalDeadlinePassed;
exports.computeAdminAttentionDate = computeAdminAttentionDate;
exports.isAdminAttentionRequired = isAdminAttentionRequired;
function addDaysUTC(isoDate, days) {
    const dt = new Date(isoDate);
    if (Number.isNaN(dt.getTime())) {
        throw new Error('Invalid ISO date');
    }
    dt.setUTCDate(dt.getUTCDate() + days);
    return dt.toISOString();
}
function computeApprovalDeadline(completionRequestedAtIso, approvalWindowDays) {
    if (approvalWindowDays <= 0) {
        throw new Error('approvalWindowDays must be positive');
    }
    return addDaysUTC(completionRequestedAtIso, approvalWindowDays);
}
function isApprovalDeadlinePassed(nowIso, completionRequestedAtIso, approvalWindowDays) {
    const now = new Date(nowIso);
    const deadline = new Date(computeApprovalDeadline(completionRequestedAtIso, approvalWindowDays));
    return now.getTime() > deadline.getTime();
}
function computeAdminAttentionDate(issueRaisedAtIso, adminAttentionDays) {
    if (adminAttentionDays <= 0) {
        throw new Error('adminAttentionDays must be positive');
    }
    return addDaysUTC(issueRaisedAtIso, adminAttentionDays);
}
function isAdminAttentionRequired(nowIso, issueRaisedAtIso, adminAttentionDays) {
    const now = new Date(nowIso);
    const attentionDate = new Date(computeAdminAttentionDate(issueRaisedAtIso, adminAttentionDays));
    return now.getTime() >= attentionDate.getTime();
}
