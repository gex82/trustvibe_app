import type {
  CreateHoldInput,
  CreateHoldResult,
  PaymentProvider,
  RefundInput,
  RefundResult,
  ReleaseInput,
  ReleaseResult,
} from './PaymentProvider';

export class StripeConnectProvider implements PaymentProvider {
  providerName = 'stripe_connect';

  supports(): boolean {
    return true;
  }

  async createHold(_input: CreateHoldInput): Promise<CreateHoldResult> {
    throw new Error('StripeConnectProvider.createHold not implemented. Enable in Phase 2 with Stripe setup.');
  }

  async release(_input: ReleaseInput): Promise<ReleaseResult> {
    throw new Error('StripeConnectProvider.release not implemented. Enable in Phase 2 with Stripe setup.');
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    throw new Error('StripeConnectProvider.refund not implemented. Enable in Phase 2 with Stripe setup.');
  }
}
