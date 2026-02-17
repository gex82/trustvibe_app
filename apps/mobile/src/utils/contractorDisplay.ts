type Translate = (key: string, options?: Record<string, unknown>) => string;

export function formatContractorFallbackName(contractorId: string | undefined, t: Translate): string {
  if (!contractorId) {
    return t('search.contractorFallbackUnknown');
  }
  const suffix = contractorId.match(/(\d+)$/)?.[1];
  if (!suffix) {
    return contractorId;
  }
  return t('search.contractorFallback', { id: suffix });
}

export function resolveContractorDisplayName(
  contractorName: string | undefined,
  contractorId: string | undefined,
  t: Translate
): string {
  if (typeof contractorName === 'string' && contractorName.trim()) {
    return contractorName;
  }
  return formatContractorFallbackName(contractorId, t);
}

export function getFeaturedBusinessName(contractorProfile: unknown): string | undefined {
  if (
    typeof contractorProfile === 'object' &&
    contractorProfile &&
    typeof (contractorProfile as Record<string, unknown>).businessName === 'string'
  ) {
    return String((contractorProfile as Record<string, unknown>).businessName);
  }
  return undefined;
}
