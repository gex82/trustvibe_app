import {
  DEFAULT_FEATURE_FLAGS,
  type FeatureFlags,
  type HoldPolicyConfig,
  type PlatformFeeConfig,
} from '@trustvibe/shared';
import { db } from '../utils/firebase';

const defaultFeeConfig: PlatformFeeConfig = {
  percentBps: 500,
  fixedFeeCents: 0,
  updatedAt: new Date(0).toISOString(),
  updatedBy: 'system',
};

const defaultHoldPolicy: HoldPolicyConfig = {
  approvalWindowDays: 7,
  adminAttentionDays: 30,
  autoReleaseEnabled: true,
  updatedAt: new Date(0).toISOString(),
  updatedBy: 'system',
};

export async function getPlatformFeeConfig(): Promise<PlatformFeeConfig> {
  const ref = db.collection('config').doc('platformFees');
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set(defaultFeeConfig);
    return defaultFeeConfig;
  }
  return snap.data() as PlatformFeeConfig;
}

export async function getHoldPolicyConfig(): Promise<HoldPolicyConfig> {
  const ref = db.collection('config').doc('holdPolicy');
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set(defaultHoldPolicy);
    return defaultHoldPolicy;
  }
  return snap.data() as HoldPolicyConfig;
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const ref = db.collection('config').doc('featureFlags');
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set(DEFAULT_FEATURE_FLAGS);
    return DEFAULT_FEATURE_FLAGS;
  }
  return snap.data() as FeatureFlags;
}
