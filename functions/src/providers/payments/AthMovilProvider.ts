import {
  type CreateConnectedAccountInput,
  type CreateConnectedAccountResult,
  type CreateHoldInput,
  type CreateHoldResult,
  type CreateInvoiceInput,
  type CreateInvoiceResult,
  type CreateSubscriptionInput,
  type CreateSubscriptionResult,
  type GetOnboardingLinkInput,
  type GetOnboardingLinkResult,
  type PaymentProvider,
  type RefundInput,
  type RefundResult,
  type ReleaseInput,
  type ReleaseResult,
  type UpdateSubscriptionInput,
} from './PaymentProvider';

function notEnabled(): never {
  throw new Error('ATH Movil provider is not enabled in this environment.');
}

export class AthMovilProvider implements PaymentProvider {
  providerName = 'ath_movil';

  supports(): boolean {
    return true;
  }

  async createHold(_input: CreateHoldInput): Promise<CreateHoldResult> {
    notEnabled();
  }

  async release(_input: ReleaseInput): Promise<ReleaseResult> {
    notEnabled();
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    notEnabled();
  }

  async createConnectedAccount(_input: CreateConnectedAccountInput): Promise<CreateConnectedAccountResult> {
    notEnabled();
  }

  async getOnboardingLink(_input: GetOnboardingLinkInput): Promise<GetOnboardingLinkResult> {
    notEnabled();
  }

  async createSubscription(_input: CreateSubscriptionInput): Promise<CreateSubscriptionResult> {
    notEnabled();
  }

  async updateSubscription(_input: UpdateSubscriptionInput): Promise<void> {
    notEnabled();
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<void> {
    notEnabled();
  }

  async createInvoice(_input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
    notEnabled();
  }
}
