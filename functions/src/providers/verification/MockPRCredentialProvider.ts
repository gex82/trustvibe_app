import type { CredentialVerificationProvider, VerificationLookupInput, VerificationLookupResult } from './CredentialVerificationProvider';

const DACO_FIXTURES: Record<string, VerificationLookupResult> = {
  'DACO-PR-1001': {
    status: 'VERIFIED',
    matchedName: 'Luis Ramos',
    expiresAt: '2027-12-31T00:00:00.000Z',
    details: { registry: 'DACO', category: 'home_repair' },
  },
  'DACO-PR-1002': {
    status: 'VERIFIED',
    matchedName: 'Ana Santiago',
    expiresAt: '2026-08-30T00:00:00.000Z',
    details: { registry: 'DACO', category: 'electrical' },
  },
  'DACO-PR-EXPIRED': {
    status: 'REJECTED',
    matchedName: 'Expired Example',
    expiresAt: '2023-01-01T00:00:00.000Z',
    details: { reason: 'expired' },
  },
};

const PERITO_FIXTURES: Record<string, VerificationLookupResult> = {
  'PERITO-PR-2001': {
    status: 'VERIFIED',
    matchedName: 'Miguel Torres',
    expiresAt: '2028-05-10T00:00:00.000Z',
    details: { board: 'Peritos PR', specialty: 'construction' },
  },
  'PERITO-PR-2002': {
    status: 'VERIFIED',
    matchedName: 'Maria Perez',
    expiresAt: '2026-11-15T00:00:00.000Z',
    details: { board: 'Peritos PR', specialty: 'insurance' },
  },
  'PERITO-PR-PENDING': {
    status: 'PENDING',
    matchedName: 'Pending Review',
    details: { reason: 'upstream_review' },
  },
};

function resolveFixture(source: Record<string, VerificationLookupResult>, input: VerificationLookupInput): VerificationLookupResult {
  const key = input.identifier.trim().toUpperCase();
  return (
    source[key] ?? {
      status: 'MANUAL_REVIEW',
      details: { reason: 'not_found_in_fixture' },
    }
  );
}

export class MockPRCredentialProvider implements CredentialVerificationProvider {
  providerName = 'mock_pr_verifier';

  async verifyDacoRegistration(input: VerificationLookupInput): Promise<VerificationLookupResult> {
    return resolveFixture(DACO_FIXTURES, input);
  }

  async verifyPeritoLicense(input: VerificationLookupInput): Promise<VerificationLookupResult> {
    return resolveFixture(PERITO_FIXTURES, input);
  }
}
