export declare function computeApprovalDeadline(completionRequestedAtIso: string, approvalWindowDays: number): string;
export declare function isApprovalDeadlinePassed(nowIso: string, completionRequestedAtIso: string, approvalWindowDays: number): boolean;
export declare function computeAdminAttentionDate(issueRaisedAtIso: string, adminAttentionDays: number): string;
export declare function isAdminAttentionRequired(nowIso: string, issueRaisedAtIso: string, adminAttentionDays: number): boolean;
