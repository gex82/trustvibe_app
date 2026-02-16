import { resolveDepositAmountByCategory } from '../deposits';

describe('deposit policy resolution', () => {
  const rules = [
    { category: 'plumbing', amountCents: 2900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
    { category: 'electrical', amountCents: 3900, currency: 'USD', refundableOnContractorNoShow: true, creditToJobOnProceed: true },
  ] as const;

  it('returns category-specific amount', () => {
    expect(resolveDepositAmountByCategory([...rules], 'plumbing')).toBe(2900);
    expect(resolveDepositAmountByCategory([...rules], 'electrical')).toBe(3900);
  });

  it('throws when category missing', () => {
    expect(() => resolveDepositAmountByCategory([...rules], 'roofing')).toThrow('Deposit policy missing');
  });
});
