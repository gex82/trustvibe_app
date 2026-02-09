import { getFeatureFlags } from '../modules/config';
import { MockPaymentProvider } from '../providers/payments/MockPaymentProvider';
import { StripeConnectProvider } from '../providers/payments/StripeConnectProvider';
import type { PaymentProvider } from '../providers/payments/PaymentProvider';

export async function getPaymentProvider(): Promise<PaymentProvider> {
  const flags = await getFeatureFlags();
  if (flags.stripeConnectEnabled) {
    return new StripeConnectProvider();
  }
  return new MockPaymentProvider();
}
