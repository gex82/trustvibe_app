import { describe, expect, it } from "vitest";
import { buildCreateProjectPayload } from "../ProjectsContext";

describe("buildCreateProjectPayload", () => {
  it("includes contractorId when project is linked from hire flow", () => {
    const payload = buildCreateProjectPayload({
      customerId: "user-maria",
      contractorId: "user-juan",
      title: "Bathroom project",
      description: "Need tile and plumbing support.",
      category: "Bathroom",
      location: "San Juan, PR",
      budget: "$2,500 - $3,500",
      timeline: "2 weeks",
      photos: [],
      acceptedQuoteId: undefined,
      escrowAmount: undefined,
      trustvibeFee: undefined,
      estimateDeposit: undefined,
      completionPhotos: undefined,
      completionNote: undefined,
    });

    expect(payload.contractorId).toBe("user-juan");
    expect(payload.budgetMinCents).toBe(250000);
    expect(payload.budgetMaxCents).toBe(350000);
  });

  it("omits contractorId when no linked contractor is provided", () => {
    const payload = buildCreateProjectPayload({
      customerId: "user-maria",
      title: "General request",
      description: "No contractor pre-linked.",
      category: "Painting",
      location: "Bayamon, PR",
      budget: "",
      timeline: "Flexible",
      photos: [],
      acceptedQuoteId: undefined,
      escrowAmount: undefined,
      trustvibeFee: undefined,
      estimateDeposit: undefined,
      completionPhotos: undefined,
      completionNote: undefined,
    });

    expect(payload.contractorId).toBeUndefined();
    expect(payload.budgetMinCents).toBeUndefined();
    expect(payload.budgetMaxCents).toBeUndefined();
  });
});
