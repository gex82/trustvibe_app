import { calculateFee } from '../fees';

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
});
