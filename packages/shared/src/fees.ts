export interface FeeInput {
  amountCents: number;
  percentBps: number;
  fixedFeeCents: number;
}

export interface FeeOutput {
  grossAmountCents: number;
  feeCents: number;
  netPayoutCents: number;
}

export interface FeeTierInput {
  id: string;
  minAmountCents: number;
  maxAmountCents?: number;
  percentBps: number;
  fixedFeeCents: number;
  planOverrides?: Record<
    string,
    {
      percentBps?: number;
      fixedFeeCents?: number;
    }
  >;
}

export function calculateFee(input: FeeInput): FeeOutput {
  if (input.amountCents <= 0) {
    throw new Error('amountCents must be positive');
  }

  if (input.percentBps < 0 || input.fixedFeeCents < 0) {
    throw new Error('Fee config values must be non-negative');
  }

  const percentFee = Math.floor((input.amountCents * input.percentBps) / 10000);
  const feeCents = percentFee + input.fixedFeeCents;
  const netPayoutCents = Math.max(0, input.amountCents - feeCents);

  return {
    grossAmountCents: input.amountCents,
    feeCents,
    netPayoutCents,
  };
}

function resolveTier(amountCents: number, tiers: FeeTierInput[]): FeeTierInput {
  if (!tiers.length) {
    throw new Error('At least one tier is required');
  }

  const sorted = [...tiers].sort((a, b) => a.minAmountCents - b.minAmountCents);
  const matched =
    sorted.find((tier) => {
      const inLowerBound = amountCents >= tier.minAmountCents;
      const inUpperBound = typeof tier.maxAmountCents === 'number' ? amountCents <= tier.maxAmountCents : true;
      return inLowerBound && inUpperBound;
    }) ?? sorted[sorted.length - 1];
  return matched;
}

export function calculateTieredFee(input: {
  amountCents: number;
  tiers: FeeTierInput[];
  subscriptionPlanId?: string;
}): FeeOutput & { tierId: string; appliedPercentBps: number; appliedFixedFeeCents: number } {
  const tier = resolveTier(input.amountCents, input.tiers);
  const override = input.subscriptionPlanId ? tier.planOverrides?.[input.subscriptionPlanId] : undefined;
  const appliedPercentBps = override?.percentBps ?? tier.percentBps;
  const appliedFixedFeeCents = override?.fixedFeeCents ?? tier.fixedFeeCents;
  const summary = calculateFee({
    amountCents: input.amountCents,
    percentBps: appliedPercentBps,
    fixedFeeCents: appliedFixedFeeCents,
  });

  return {
    ...summary,
    tierId: tier.id,
    appliedPercentBps,
    appliedFixedFeeCents,
  };
}
