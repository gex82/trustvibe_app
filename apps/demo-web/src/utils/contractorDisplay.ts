import type { Contractor, User } from "../types";

type ContractorLike = User | Contractor | null | undefined;

export function formatContractorDisplay(
  contractor: ContractorLike,
  pendingLabel: string
): string {
  if (
    !contractor ||
    contractor.role !== "contractor" ||
    !("businessName" in contractor)
  ) {
    return pendingLabel;
  }
  const business = contractor.businessName?.trim();
  const person = contractor.name?.trim();
  if (business && person) {
    return `${business} - ${person}`;
  }
  return person || business || pendingLabel;
}
