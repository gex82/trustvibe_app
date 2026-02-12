import type {
  CreateConnectedAccountInput,
  CreateConnectedAccountResult,
  CreateHoldInput,
  CreateHoldResult,
  CreateInvoiceInput,
  CreateInvoiceResult,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  GetOnboardingLinkInput,
  GetOnboardingLinkResult,
  PaymentProvider,
  RefundInput,
  RefundResult,
  ReleaseInput,
  ReleaseResult,
  UpdateSubscriptionInput,
} from './PaymentProvider';

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export class MockPaymentProvider implements PaymentProvider {
  providerName = 'mock';

  supports(): boolean {
    return true;
  }

  async createHold(_input: CreateHoldInput): Promise<CreateHoldResult> {
    return {
      providerHoldId: id('mock_hold'),
      status: 'HELD',
    };
  }

  async release(_input: ReleaseInput): Promise<ReleaseResult> {
    return {
      providerTransferId: id('mock_transfer'),
      status: 'RELEASED',
    };
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    return {
      providerRefundId: id('mock_refund'),
      status: 'REFUNDED',
    };
  }

  async createConnectedAccount(_input: CreateConnectedAccountInput): Promise<CreateConnectedAccountResult> {
    return {
      providerAccountId: id('mock_acct'),
      onboardingStatus: 'ACTIVE',
    };
  }

  async getOnboardingLink(_input: GetOnboardingLinkInput): Promise<GetOnboardingLinkResult> {
    return { url: 'https://example.com/mock-onboarding' };
  }

  async createSubscription(_input: CreateSubscriptionInput): Promise<CreateSubscriptionResult> {
    const now = new Date();
    const start = now.toISOString();
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    return {
      providerSubscriptionId: id('mock_sub'),
      status: 'active',
      currentPeriodStart: start,
      currentPeriodEnd: end,
    };
  }

  async updateSubscription(_input: UpdateSubscriptionInput): Promise<void> {
    return;
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<void> {
    return;
  }

  async createInvoice(_input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
    return {
      providerInvoiceId: id('mock_invoice'),
      status: 'paid',
    };
  }
}
