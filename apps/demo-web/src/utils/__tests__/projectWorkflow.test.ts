import { describe, expect, it } from "vitest";
import {
  buildBookingWindow,
  getMockDepositAmountCents,
  isDepositCaptured,
  resolveBookingDisabledReasonKey,
} from "../projectWorkflow";

describe("project workflow helpers", () => {
  it("detects captured deposit states", () => {
    expect(
      isDepositCaptured({
        id: "dep-1",
        projectId: "proj-1",
        customerId: "user-a",
        contractorId: "user-b",
        amountCents: 3900,
        status: "CREATED",
        createdAt: "2026-02-01T10:00:00.000Z",
        updatedAt: "2026-02-01T10:00:00.000Z",
      })
    ).toBe(false);

    expect(
      isDepositCaptured({
        id: "dep-1",
        projectId: "proj-1",
        customerId: "user-a",
        contractorId: "user-b",
        amountCents: 3900,
        status: "CAPTURED",
        createdAt: "2026-02-01T10:00:00.000Z",
        updatedAt: "2026-02-01T10:00:00.000Z",
      })
    ).toBe(true);
  });

  it("enforces disabled-reason precedence", () => {
    expect(
      resolveBookingDisabledReasonKey({
        contractorId: null,
        estimateDeposit: undefined,
      })
    ).toBe("detail.bookingDisabledNeedsContractor");

    expect(
      resolveBookingDisabledReasonKey({
        contractorId: "user-b",
        estimateDeposit: undefined,
      })
    ).toBe("detail.bookingDisabledNeedsDeposit");

    expect(
      resolveBookingDisabledReasonKey({
        contractorId: "user-b",
        estimateDeposit: {
          id: "dep-1",
          projectId: "proj-1",
          customerId: "user-a",
          contractorId: "user-b",
          amountCents: 3900,
          status: "CREATED",
          createdAt: "2026-02-01T10:00:00.000Z",
          updatedAt: "2026-02-01T10:00:00.000Z",
        },
      })
    ).toBe("detail.bookingDisabledNeedsCapturedDeposit");
  });

  it("builds deterministic split-second booking windows and mock amounts", () => {
    const window = buildBookingWindow(new Date("2026-02-01T10:00:00.000Z"));
    expect(window.startAt).toBe("2026-02-02T10:00:00.000Z");
    expect(window.endAt).toBe("2026-02-02T12:00:00.000Z");

    expect(getMockDepositAmountCents("roofing")).toBe(7900);
    expect(getMockDepositAmountCents("bathroom")).toBe(3900);
    expect(getMockDepositAmountCents("unknown")).toBe(3900);
  });
});
