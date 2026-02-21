import type {
  CallableResponse,
  EscrowState,
  ProjectRecord,
  ProjectQuoteRecord,
} from "@trustvibe/shared";
import type { DemoProject, DemoQuote, LineItem, ProjectStatus } from "../types";

function toProjectStatus(escrowState: EscrowState | string): ProjectStatus {
  switch (escrowState) {
    case "OPEN_FOR_QUOTES":
      return "open";
    case "CONTRACTOR_SELECTED":
    case "AGREEMENT_ACCEPTED":
    case "FUNDED_HELD":
    case "IN_PROGRESS":
      return "in_progress";
    case "COMPLETION_REQUESTED":
      return "complete_requested";
    case "RELEASED_PAID":
    case "EXECUTED_RELEASE_FULL":
    case "EXECUTED_RELEASE_PARTIAL":
      return "completed";
    case "ISSUE_RAISED_HOLD":
    case "RESOLUTION_PENDING_EXTERNAL":
    case "RESOLUTION_SUBMITTED":
    case "EXECUTED_REFUND_PARTIAL":
    case "EXECUTED_REFUND_FULL":
      return "disputed";
    default:
      return "draft";
  }
}

function toBudgetLabel(min?: number, max?: number): string {
  const toUsd = (value: number) =>
    `$${Math.round(value / 100).toLocaleString("en-US")}`;
  if (min && max) {
    return `${toUsd(min)} - ${toUsd(max)}`;
  }
  if (max) {
    return `Up to ${toUsd(max)}`;
  }
  if (min) {
    return `${toUsd(min)}+`;
  }
  return "TBD";
}

function toLineItems(items?: Array<{ description: string; amountCents: number }>): LineItem[] {
  return (items ?? []).map((item) => ({
    label: item.description,
    amount: Math.round(item.amountCents / 100),
  }));
}

export function mapQuoteRecordToDemoQuote(record: ProjectQuoteRecord): DemoQuote {
  return {
    id: record.id,
    projectId: record.projectId,
    contractorId: record.contractorId,
    amount: Math.round(record.priceCents / 100),
    breakdown: toLineItems(record.lineItems),
    timeline: `${record.timelineDays} days`,
    notes: record.scopeNotes,
    status:
      record.status === "SELECTED"
        ? "accepted"
        : record.status === "DECLINED"
          ? "rejected"
          : "pending",
    submittedAt: record.createdAt,
  };
}

export function mapProjectRecordToDemoProject(
  record: ProjectRecord,
  quotes: ProjectQuoteRecord[] = []
): DemoProject {
  return {
    id: record.id,
    customerId: record.customerId,
    title: record.titleEn ?? record.title,
    description: record.descriptionEn ?? record.description,
    category: record.category,
    location: record.municipality,
    budget: toBudgetLabel(record.budgetMinCents, record.budgetMaxCents),
    timeline: record.desiredTimeline,
    status: toProjectStatus(record.escrowState),
    createdAt: record.createdAt,
    photos: record.photos ?? [],
    quotes: quotes.map(mapQuoteRecordToDemoQuote),
    acceptedQuoteId: record.selectedQuoteId,
    escrowAmount: record.selectedQuotePriceCents
      ? Math.round(record.selectedQuotePriceCents / 100)
      : undefined,
    trustvibeFee: undefined,
  };
}

export function mapProjectDetailResponse(
  response: CallableResponse<"getProject">
): DemoProject {
  return mapProjectRecordToDemoProject(response.project, response.quotes);
}
