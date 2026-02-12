import { calculateFee, calculateTieredFee } from '../fees';

describe('fee calculations', () => {
  it('calculates percentage and fixed fees', () => {
    const output = calculateFee({ amountCents: 100000, percentBps: 500, fixedFeeCents: 300 });
    expect(output.grossAmountCents).toBe(100000);
    expect(output.feeCents).toBe(5300);
    expect(output.netPayoutCents).toBe(94700);
  });

  it('never returns negative payout', () => {
    const output = calculateFee({ amountCents: 1000, percentBps: 9000, fixedFeeCents: 1000 });
    expect(output.netPayoutCents).toBe(0);
  });

  it('applies tiered fee and plan override', () => {
    const output = calculateTieredFee({
      amountCents: 200000,
      subscriptionPlanId: 'contractor_pro',
      tiers: [
        { id: 'small', minAmountCents: 0, maxAmountCents: 99999, percentBps: 900, fixedFeeCents: 0 },
        {
          id: 'standard',
          minAmountCents: 100000,
          maxAmountCents: 500000,
          percentBps: 700,
          fixedFeeCents: 0,
          planOverrides: {
            contractor_pro: { percentBps: 500 },
          },
        },
      ],
    });
    expect(output.tierId).toBe('standard');
    expect(output.appliedPercentBps).toBe(500);
    expect(output.feeCents).toBe(10000);
    expect(output.netPayoutCents).toBe(190000);
  });
});
