function addDaysUTC(isoDate: string, days: number): string {
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) {
    throw new Error('Invalid ISO date');
  }
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString();
}

export function computeApprovalDeadline(completionRequestedAtIso: string, approvalWindowDays: number): string {
  if (approvalWindowDays <= 0) {
    throw new Error('approvalWindowDays must be positive');
  }
  return addDaysUTC(completionRequestedAtIso, approvalWindowDays);
}

export function isApprovalDeadlinePassed(nowIso: string, completionRequestedAtIso: string, approvalWindowDays: number): boolean {
  const now = new Date(nowIso);
  const deadline = new Date(computeApprovalDeadline(completionRequestedAtIso, approvalWindowDays));
  return now.getTime() > deadline.getTime();
}

export function computeAdminAttentionDate(issueRaisedAtIso: string, adminAttentionDays: number): string {
  if (adminAttentionDays <= 0) {
    throw new Error('adminAttentionDays must be positive');
  }
  return addDaysUTC(issueRaisedAtIso, adminAttentionDays);
}

export function isAdminAttentionRequired(nowIso: string, issueRaisedAtIso: string, adminAttentionDays: number): boolean {
  const now = new Date(nowIso);
  const attentionDate = new Date(computeAdminAttentionDate(issueRaisedAtIso, adminAttentionDays));
  return now.getTime() >= attentionDate.getTime();
}
