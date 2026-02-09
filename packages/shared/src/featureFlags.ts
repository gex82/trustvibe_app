import type { FeatureFlags } from './types';

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  stripeConnectEnabled: false,
  milestonePaymentsEnabled: false,
  changeOrdersEnabled: false,
  credentialVerificationEnabled: false,
  schedulingEnabled: false,
  recommendationsEnabled: false,
  growthEnabled: false,
  updatedAt: new Date(0).toISOString(),
  updatedBy: 'system',
};

export function isPhase2Enabled(flags: FeatureFlags): boolean {
  return (
    flags.stripeConnectEnabled ||
    flags.milestonePaymentsEnabled ||
    flags.changeOrdersEnabled ||
    flags.credentialVerificationEnabled ||
    flags.schedulingEnabled ||
    flags.recommendationsEnabled ||
    flags.growthEnabled
  );
}
