import { MockPRCredentialProvider } from '../providers/verification/MockPRCredentialProvider';
import type { CredentialVerificationProvider } from '../providers/verification/CredentialVerificationProvider';

export async function getCredentialVerificationProvider(): Promise<CredentialVerificationProvider> {
  return new MockPRCredentialProvider();
}
