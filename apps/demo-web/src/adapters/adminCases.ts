import type { CallableRequest } from "@trustvibe/shared";
import type {
  AdminCaseActionState,
  AdminCaseStatus,
  AdminCaseViewModel,
} from "../types/adminCases";

export type AdminCaseOutcomeAction = "release" | "refund" | "split";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function normalizeEvidence(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function deriveStatus(raw: unknown): AdminCaseStatus {
  const status = parseString(raw, "UNKNOWN").toUpperCase();
  switch (status) {
    case "OPEN":
    case "WAITING_JOINT_RELEASE":
    case "WAITING_EXTERNAL_RESOLUTION":
    case "RESOLUTION_SUBMITTED":
    case "ADMIN_ATTENTION_REQUIRED":
    case "PENDING_RESOLUTION":
    case "RESOLVED":
    case "CLOSED":
      return status;
    default:
      return "UNKNOWN";
  }
}

function deriveDaysOpen(value: unknown): number {
  const dateValue = parseString(value);
  if (!dateValue) {
    return 0;
  }
  const parsed = new Date(dateValue).getTime();
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  const elapsed = Date.now() - parsed;
  return Math.max(0, Math.floor(elapsed / DAY_MS));
}

function deriveActionState(status: AdminCaseStatus): AdminCaseActionState {
  return status === "RESOLVED" || status === "CLOSED" ? "resolved" : "idle";
}

export function mapCaseRecordToViewModel(
  row: Record<string, unknown>,
  index = 0
): AdminCaseViewModel {
  const id = parseString(row.id, `case-${String(index + 1).padStart(3, "0")}`);
  const projectId = parseString(row.projectId, id);
  const amountCents = Math.max(
    0,
    Math.floor(
      parseNumber(
        row.heldAmountCents ?? row.amountCents ?? row.amount,
        0
      )
    )
  );

  const status = deriveStatus(row.status);

  const summary = parseString(
    row.summary ?? row.description ?? row.resolutionSummary,
    "Case is awaiting admin review."
  );

  return {
    id,
    projectId,
    title: parseString(row.projectTitle ?? row.title, `Project ${projectId}`),
    customerName: parseString(
      row.customerName ?? row.customer ?? row.customerId,
      "Customer"
    ),
    contractorName: parseString(
      row.contractorName ?? row.contractor ?? row.contractorId,
      "Contractor"
    ),
    amountCents,
    status,
    daysOpen: deriveDaysOpen(row.createdAt ?? row.openedAt),
    summary,
    evidence: normalizeEvidence(row.evidence),
    resolutionSummary: parseString(row.resolutionSummary, "") || undefined,
    resolutionDocumentUrl:
      parseString(row.resolutionDocumentUrl, "") || undefined,
    actionState: deriveActionState(status),
  };
}

export function mapCaseRecordsToViewModels(
  rows: Array<Record<string, unknown>>
): AdminCaseViewModel[] {
  return rows.map((row, index) => mapCaseRecordToViewModel(row, index));
}

export function buildFallbackAdminCases(
  t: (key: string) => string
): AdminCaseViewModel[] {
  return [
    {
      id: "case-001",
      projectId: "proj-exterior-paint",
      title: t("case1.title"),
      customerName: t("case1.customer"),
      contractorName: t("case1.contractor"),
      amountCents: 320000,
      status: "OPEN",
      daysOpen: 15,
      summary: t("case1.description"),
      evidence: [t("case1.evidence1"), t("case1.evidence2")],
      actionState: "idle",
    },
    {
      id: "case-002",
      projectId: "proj-hvac-office",
      title: t("case2.title"),
      customerName: t("case2.customer"),
      contractorName: t("case2.contractor"),
      amountCents: 185000,
      status: "PENDING_RESOLUTION",
      daysOpen: 7,
      summary: t("case2.description"),
      evidence: [t("case2.evidence1"), t("case2.evidence2"), t("case2.evidence3")],
      resolutionSummary: t("case2.resolution"),
      actionState: "idle",
    },
  ];
}

export function resolveAdminCases(
  rows: Array<Record<string, unknown>>,
  t: (key: string) => string,
  useFallback: boolean
): AdminCaseViewModel[] {
  const mapped = mapCaseRecordsToViewModels(rows);
  if (!mapped.length && useFallback) {
    return buildFallbackAdminCases(t);
  }
  return mapped;
}

export function buildOutcomePayload(
  caseItem: Pick<AdminCaseViewModel, "id" | "projectId" | "amountCents" | "resolutionDocumentUrl">,
  action: AdminCaseOutcomeAction
): CallableRequest<"adminExecuteOutcome"> {
  const heldAmountCents = Math.max(0, Math.floor(caseItem.amountCents));
  const splitReleaseCents = Math.floor(heldAmountCents / 2);
  const splitRefundCents = heldAmountCents - splitReleaseCents;

  if (action === "release") {
    return {
      caseId: caseItem.id,
      projectId: caseItem.projectId,
      outcomeType: "release_full",
      releaseToContractorCents: heldAmountCents,
      refundToCustomerCents: 0,
      docReference: caseItem.resolutionDocumentUrl ?? "demo-web-case-reference",
    };
  }

  if (action === "refund") {
    return {
      caseId: caseItem.id,
      projectId: caseItem.projectId,
      outcomeType: "refund_full",
      releaseToContractorCents: 0,
      refundToCustomerCents: heldAmountCents,
      docReference: caseItem.resolutionDocumentUrl ?? "demo-web-case-reference",
    };
  }

  return {
    caseId: caseItem.id,
    projectId: caseItem.projectId,
    outcomeType: "release_partial",
    releaseToContractorCents: splitReleaseCents,
    refundToCustomerCents: splitRefundCents,
    docReference: caseItem.resolutionDocumentUrl ?? "demo-web-case-reference",
  };
}

export function formatCaseTestIdSuffix(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function isResolvedStatus(status: AdminCaseStatus): boolean {
  return status === "RESOLVED" || status === "CLOSED";
}

export function isOpenStatus(status: AdminCaseStatus): boolean {
  return status === "OPEN" || status === "ADMIN_ATTENTION_REQUIRED";
}

export function isPendingStatus(status: AdminCaseStatus): boolean {
  return (
    status === "WAITING_JOINT_RELEASE" ||
    status === "WAITING_EXTERNAL_RESOLUTION" ||
    status === "RESOLUTION_SUBMITTED" ||
    status === "PENDING_RESOLUTION"
  );
}
