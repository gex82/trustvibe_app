import type { EmailInput, NotificationProvider } from './NotificationProvider';

export class MockEmailProvider implements NotificationProvider {
  providerName = 'mock_email';

  async sendEmail(input: EmailInput): Promise<void> {
    console.log('[MockEmailProvider]', JSON.stringify(input));
  }
}
