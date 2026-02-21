export type AdminCaseStatus =
  | "OPEN"
  | "WAITING_JOINT_RELEASE"
  | "WAITING_EXTERNAL_RESOLUTION"
  | "RESOLUTION_SUBMITTED"
  | "ADMIN_ATTENTION_REQUIRED"
  | "PENDING_RESOLUTION"
  | "RESOLVED"
  | "CLOSED"
  | "UNKNOWN";

export type AdminCaseActionState = "idle" | "executing" | "resolved" | "mock";

export interface AdminCaseViewModel {
  id: string;
  projectId: string;
  title: string;
  customerName: string;
  contractorName: string;
  amountCents: number;
  status: AdminCaseStatus;
  daysOpen: number;
  summary: string;
  evidence: string[];
  resolutionSummary?: string;
  resolutionDocumentUrl?: string;
  actionState: AdminCaseActionState;
}
