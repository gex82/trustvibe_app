export interface EmailInput {
  to: string;
  templateKey: string;
  locale: 'en' | 'es';
  variables: Record<string, unknown>;
}

export interface NotificationProvider {
  providerName: string;
  sendEmail(input: EmailInput): Promise<void>;
}
