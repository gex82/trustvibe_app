export interface VerificationLookupInput {
  identifier: string;
}

export interface VerificationLookupResult {
  status: 'VERIFIED' | 'REJECTED' | 'PENDING' | 'MANUAL_REVIEW';
  matchedName?: string;
  expiresAt?: string;
  details?: Record<string, unknown>;
}

export interface CredentialVerificationProvider {
  providerName: string;
  verifyDacoRegistration(input: VerificationLookupInput): Promise<VerificationLookupResult>;
  verifyPeritoLicense(input: VerificationLookupInput): Promise<VerificationLookupResult>;
}
