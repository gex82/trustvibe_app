import type { EstimateDepositView } from "../types";

export type BookingDisabledReasonKey =
  | "detail.bookingDisabledNeedsContractor"
  | "detail.bookingDisabledNeedsDeposit"
  | "detail.bookingDisabledNeedsCapturedDeposit";

const CAPTURED_DEPOSIT_STATUSES = new Set<EstimateDepositView["status"]>([
  "CAPTURED",
  "CONTRACTOR_ATTENDED",
  "CUSTOMER_ATTENDED",
  "CREDITED_TO_JOB",
  "CLOSED",
]);

const MOCK_DEPOSIT_AMOUNT_BY_CATEGORY: Record<string, number> = {
  plumbing: 2900,
  electrical: 3900,
  painting: 2900,
  roofing: 7900,
  carpentry: 3900,
  hvac: 5900,
  landscaping: 2900,
  cleaning: 2900,
  general: 3900,
  bathroom: 3900,
  kitchen: 3900,
  tiling: 3900,
  other: 3900,
};

export function isDepositCaptured(
  deposit: EstimateDepositView | null | undefined
): boolean {
  if (!deposit) {
    return false;
  }
  return CAPTURED_DEPOSIT_STATUSES.has(deposit.status);
}

export function resolveBookingDisabledReasonKey(input: {
  contractorId?: string | null;
  estimateDeposit?: EstimateDepositView | null;
}): BookingDisabledReasonKey | null {
  if (!input.contractorId) {
    return "detail.bookingDisabledNeedsContractor";
  }
  if (!input.estimateDeposit) {
    return "detail.bookingDisabledNeedsDeposit";
  }
  if (!isDepositCaptured(input.estimateDeposit)) {
    return "detail.bookingDisabledNeedsCapturedDeposit";
  }
  return null;
}

export function getMockDepositAmountCents(category: string): number {
  const normalized = category.trim().toLowerCase();
  if (!normalized) {
    return MOCK_DEPOSIT_AMOUNT_BY_CATEGORY.general;
  }
  return (
    MOCK_DEPOSIT_AMOUNT_BY_CATEGORY[normalized] ??
    MOCK_DEPOSIT_AMOUNT_BY_CATEGORY.general
  );
}

export function buildBookingWindow(baseDate = new Date()): {
  startAt: string;
  endAt: string;
} {
  const start = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  const end = new Date(baseDate.getTime() + 26 * 60 * 60 * 1000);

  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}

export function resolveDepositStatusLabelKey(
  status: EstimateDepositView["status"]
): string {
  switch (status) {
    case "CREATED":
      return "detail.depositStatusCreated";
    case "CAPTURED":
      return "detail.depositStatusCaptured";
    case "CONTRACTOR_ATTENDED":
      return "detail.depositStatusContractorAttended";
    case "CUSTOMER_ATTENDED":
      return "detail.depositStatusCustomerAttended";
    case "CONTRACTOR_NO_SHOW":
      return "detail.depositStatusContractorNoShow";
    case "CUSTOMER_NO_SHOW":
      return "detail.depositStatusCustomerNoShow";
    case "REFUNDED":
      return "detail.depositStatusRefunded";
    case "CREDITED_TO_JOB":
      return "detail.depositStatusCredited";
    case "CLOSED":
      return "detail.depositStatusClosed";
    default:
      return "detail.depositStatusUnknown";
  }
}
