import type { DepositPolicyRule, ProjectCategory } from './types';

export function resolveDepositAmountByCategory(rules: DepositPolicyRule[], category: ProjectCategory): number {
  const rule = rules.find((item) => item.category === category);
  if (!rule) {
    throw new Error(`Deposit policy missing for category "${category}"`);
  }
  return rule.amountCents;
}
