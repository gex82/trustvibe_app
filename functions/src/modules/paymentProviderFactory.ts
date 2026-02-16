import { getFeatureFlags } from './config';
import { AthMovilProvider } from '../providers/payments/AthMovilProvider';
import { MockPaymentProvider } from '../providers/payments/MockPaymentProvider';
import { StripeConnectProvider } from '../providers/payments/StripeConnectProvider';
import type { PaymentProvider } from '../providers/payments/PaymentProvider';

function resolveProviderName(flags: { stripeConnectEnabled: boolean }): 'mock' | 'stripe' | 'ath_movil' {
  const env = (process.env.PAYMENT_PROVIDER ?? '').toLowerCase();
  if (env === 'mock' || env === 'stripe' || env === 'ath_movil') {
    return env;
  }

  if (flags.stripeConnectEnabled) {
    return 'stripe';
  }
  return 'mock';
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  const flags = await getFeatureFlags();
  const providerName = resolveProviderName({ stripeConnectEnabled: flags.stripeConnectEnabled });
  if (providerName === 'ath_movil') {
    return new AthMovilProvider();
  }
  if (providerName === 'stripe') {
    return new StripeConnectProvider();
  }
  return new MockPaymentProvider();
}
