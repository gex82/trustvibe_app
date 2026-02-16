import { calculateTieredFee, resolveDepositAmountByCategory, type ProjectCategory } from '@trustvibe/shared';
import { HttpsError } from 'firebase-functions/v2/https';
import { getDepositPolicyConfig, getPlatformFeeConfigV2 } from './config';

export async function resolveDepositAmountCents(category: ProjectCategory): Promise<number> {
  const policies = await getDepositPolicyConfig();
  try {
    return resolveDepositAmountByCategory(policies.rules, category);
  } catch (error) {
    throw new HttpsError('failed-precondition', String(error));
  }
}

export async function resolveTieredFee(input: {
  amountCents: number;
  subscriptionPlanId?: string;
}): Promise<{
  tierId: string;
  feeCents: number;
  netPayoutCents: number;
  appliedPercentBps: number;
  appliedFixedFeeCents: number;
}> {
  const config = await getPlatformFeeConfigV2();
  if (!config.tiers.length) {
    throw new HttpsError('failed-precondition', 'Platform fee tiers are not configured.');
  }

  const summary = calculateTieredFee({
    amountCents: input.amountCents,
    tiers: config.tiers,
    subscriptionPlanId: input.subscriptionPlanId,
  });

  return {
    tierId: summary.tierId,
    feeCents: summary.feeCents,
    netPayoutCents: summary.netPayoutCents,
    appliedPercentBps: summary.appliedPercentBps,
    appliedFixedFeeCents: summary.appliedFixedFeeCents,
  };
}
