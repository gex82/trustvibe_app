import { describe, expect, it } from "vitest";
import { formatContractorDisplay } from "../contractorDisplay";

describe("formatContractorDisplay", () => {
  it("returns business and person name for contractor records", () => {
    const result = formatContractorDisplay(
      {
        id: "user-juan",
        role: "contractor",
        name: "Juan Reyes",
        businessName: "Juan's Home Services",
      } as any,
      "Pending"
    );

    expect(result).toBe("Juan's Home Services - Juan Reyes");
  });

  it("falls back to pending label when contractor cannot be resolved", () => {
    expect(formatContractorDisplay(null, "Pending")).toBe("Pending");
    expect(
      formatContractorDisplay(
        {
          id: "user-maria",
          role: "customer",
          name: "Maria Rodriguez",
        } as any,
        "Pending"
      )
    ).toBe("Pending");
  });
});
