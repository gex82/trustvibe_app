import { describe, expect, it } from "vitest";
import {
  buildFallbackAdminCases,
  buildOutcomePayload,
  mapCaseRecordToViewModel,
  resolveAdminCases,
} from "../adminCases";

const t = (key: string) => key;

describe("adminCases adapter", () => {
  it("maps case rows with safe defaults", () => {
    const mapped = mapCaseRecordToViewModel(
      {
        id: "case-x",
        projectId: "proj-1",
        status: "OPEN",
        heldAmountCents: 123400,
        evidence: ["Photo", "Contract"],
      },
      0
    );

    expect(mapped.id).toBe("case-x");
    expect(mapped.projectId).toBe("proj-1");
    expect(mapped.status).toBe("OPEN");
    expect(mapped.amountCents).toBe(123400);
    expect(mapped.evidence).toEqual(["Photo", "Contract"]);
    expect(mapped.title).toBe("Project proj-1");
    expect(mapped.customerName).toBe("Customer");
    expect(mapped.contractorName).toBe("Contractor");
  });

  it("uses fallback records when rows are empty and fallback is enabled", () => {
    const fallbackCases = resolveAdminCases([], t, true);
    expect(fallbackCases).toHaveLength(2);
    expect(fallbackCases[0].id).toBe("case-001");

    const directFallback = buildFallbackAdminCases(t);
    expect(directFallback.map((item) => item.id)).toEqual(
      fallbackCases.map((item) => item.id)
    );
  });

  it("builds release/refund/split payloads with deterministic cents", () => {
    const caseItem = {
      id: "case-001",
      projectId: "proj-abc",
      amountCents: 999,
      resolutionDocumentUrl: "https://example.com/doc",
    };

    const release = buildOutcomePayload(caseItem, "release");
    expect(release.outcomeType).toBe("release_full");
    expect(release.releaseToContractorCents).toBe(999);
    expect(release.refundToCustomerCents).toBe(0);

    const refund = buildOutcomePayload(caseItem, "refund");
    expect(refund.outcomeType).toBe("refund_full");
    expect(refund.releaseToContractorCents).toBe(0);
    expect(refund.refundToCustomerCents).toBe(999);

    const split = buildOutcomePayload(caseItem, "split");
    expect(split.outcomeType).toBe("release_partial");
    expect(split.releaseToContractorCents + split.refundToCustomerCents).toBe(999);
    expect(split.releaseToContractorCents).toBe(499);
    expect(split.refundToCustomerCents).toBe(500);
  });
});
