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
