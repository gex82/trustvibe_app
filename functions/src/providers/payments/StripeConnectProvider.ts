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

function randomId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function isStripeSimulationEnabled(): boolean {
  return process.env.STRIPE_SIMULATE === 'true' || process.env.FUNCTIONS_EMULATOR === 'true';
}

function requireStripeSecret(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is required when Stripe provider is enabled.');
  }
  return key;
}

function getStripeClient(): any {
  const key = requireStripeSecret();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require('stripe');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

export class StripeConnectProvider implements PaymentProvider {
  providerName = 'stripe_connect';

  supports(): boolean {
    return true;
  }

  async createHold(input: CreateHoldInput): Promise<CreateHoldResult> {
    if (isStripeSimulationEnabled()) {
      return {
        providerHoldId: randomId('pi_mock'),
        status: 'HELD',
      };
    }

    const stripe = getStripeClient();
    const intent = await stripe.paymentIntents.create(
      {
        amount: input.amountCents,
        currency: 'usd',
        capture_method: 'manual',
        metadata: {
          projectId: input.projectId,
          customerId: input.customerId,
          contractorId: input.contractorId,
          flow: 'hold',
        },
      },
      { idempotencyKey: input.idempotencyKey }
    );

    return {
      providerHoldId: intent.id,
      status: 'HELD',
    };
  }

  async release(input: ReleaseInput): Promise<ReleaseResult> {
    if (isStripeSimulationEnabled()) {
      return {
        providerTransferId: randomId('tr_mock'),
        status: 'RELEASED',
      };
    }

    const stripe = getStripeClient();
    const capture = await stripe.paymentIntents.capture(
      input.providerHoldId,
      {
        amount_to_capture: input.amountCents,
        metadata: {
          destinationAccountRef: input.destinationAccountRef,
          flow: 'release',
          ...(input.metadata ?? {}),
        },
      },
      { idempotencyKey: input.idempotencyKey }
    );

    return {
      providerTransferId: capture.latest_charge ?? capture.id,
      status: 'RELEASED',
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    if (isStripeSimulationEnabled()) {
      return {
        providerRefundId: randomId('re_mock'),
        status: 'REFUNDED',
      };
    }

    const stripe = getStripeClient();
    const refund = await stripe.refunds.create(
      {
        payment_intent: input.providerHoldId,
        amount: input.amountCents,
        metadata: {
          destinationCustomerRef: input.destinationCustomerRef,
          flow: 'refund',
          ...(input.metadata ?? {}),
        },
      },
      { idempotencyKey: input.idempotencyKey }
    );

    return {
      providerRefundId: refund.id,
      status: 'REFUNDED',
    };
  }

  async createConnectedAccount(input: CreateConnectedAccountInput): Promise<CreateConnectedAccountResult> {
    if (isStripeSimulationEnabled()) {
      return {
        providerAccountId: randomId('acct_mock'),
        onboardingStatus: 'ACTIVE',
      };
    }

    const stripe = getStripeClient();
    const account = await stripe.accounts.create({
      type: input.type ?? 'express',
      country: input.country ?? 'US',
      email: input.email,
      metadata: {
        trustvibeUserId: input.userId,
      },
    });

    return {
      providerAccountId: account.id,
      onboardingStatus: account.charges_enabled && account.payouts_enabled ? 'ACTIVE' : 'PENDING',
    };
  }

  async getOnboardingLink(input: GetOnboardingLinkInput): Promise<GetOnboardingLinkResult> {
    if (isStripeSimulationEnabled()) {
      return {
        url: `https://example.com/stripe-onboarding/${input.providerAccountId}`,
      };
    }

    const stripe = getStripeClient();
    const accountLink = await stripe.accountLinks.create({
      account: input.providerAccountId,
      refresh_url: input.refreshUrl,
      return_url: input.returnUrl,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult> {
    if (isStripeSimulationEnabled()) {
      const now = new Date();
      return {
        providerSubscriptionId: randomId('sub_mock'),
        status: 'active',
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    const stripe = getStripeClient();
    const customer = await stripe.customers.create({
      metadata: {
        accountRef: input.accountRef,
      },
    });
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: input.planCode, quantity: input.quantity ?? 1 }],
      collection_method: 'charge_automatically',
    });
    const periodStart =
      typeof subscription.current_period_start === 'number'
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : new Date().toISOString();
    const periodEnd =
      typeof subscription.current_period_end === 'number'
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      providerSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    };
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<void> {
    if (isStripeSimulationEnabled()) {
      return;
    }

    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(input.providerSubscriptionId);
    const firstItem = subscription.items.data[0];
    await stripe.subscriptions.update(input.providerSubscriptionId, {
      cancel_at_period_end: input.cancelAtPeriodEnd,
      items: firstItem
        ? [
            {
              id: firstItem.id,
              price: input.planCode ?? firstItem.price?.id,
              quantity: input.quantity ?? firstItem.quantity,
            },
          ]
        : undefined,
    });
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    if (isStripeSimulationEnabled()) {
      return;
    }
    const stripe = getStripeClient();
    await stripe.subscriptions.cancel(providerSubscriptionId);
  }

  async createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
    if (isStripeSimulationEnabled()) {
      return {
        providerInvoiceId: randomId('in_mock'),
        status: 'paid',
      };
    }

    const stripe = getStripeClient();
    const invoiceItem = await stripe.invoiceItems.create({
      customer: input.accountRef,
      amount: input.amountCents,
      currency: 'usd',
      description: input.description,
    });
    const invoice = await stripe.invoices.create({
      customer: input.accountRef,
      auto_advance: true,
      metadata: {
        providerSubscriptionId: input.providerSubscriptionId,
        invoiceItemId: invoiceItem.id,
      },
    });

    return {
      providerInvoiceId: invoice.id,
      status: invoice.status === 'paid' ? 'paid' : 'open',
    };
  }
}
