import type { EmailInput, NotificationProvider } from './NotificationProvider';

export class SendGridProvider implements NotificationProvider {
  providerName = 'sendgrid';

  async sendEmail(_input: EmailInput): Promise<void> {
    throw new Error('SendGridProvider not implemented. Configure API key and template mapping in Phase 2.');
  }
}
