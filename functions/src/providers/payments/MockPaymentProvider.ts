import type {
  CreateHoldInput,
  CreateHoldResult,
  PaymentProvider,
  RefundInput,
  RefundResult,
  ReleaseInput,
  ReleaseResult,
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
}
