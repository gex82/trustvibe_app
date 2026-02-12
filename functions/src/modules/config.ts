import {
  DEFAULT_FEATURE_FLAGS,
  type DepositPolicyConfig,
  type FeatureFlags,
  type HighTicketPolicyConfig,
  type HoldPolicyConfig,
  type PlatformFeeConfig,
  type PlatformFeeConfigV2,
  type ReliabilityWeightConfig,
  type SubscriptionPlansConfig,
} from '@trustvibe/shared';
import { db } from '../utils/firebase';

const EPOCH = new Date(0).toISOString();

const defaultFeeConfig: PlatformFeeConfig = {
  percentBps: 500,
  fixedFeeCents: 0,
  schemaVersion: 1,
  updatedAt: EPOCH,
  updatedBy: 'system',
};

const defaultHoldPolicy: HoldPolicyConfig = {
  approvalWindowDays: 7,
  adminAttentionDays: 30,
  autoReleaseEnabled: true,
  updatedAt: EPOCH,
  updatedBy: 'system',
};

const defaultDepositPolicies: DepositPolicyConfig = {
  schemaVersion: 1,
  rules: [],
  updatedAt: EPOCH,
  updatedBy: 'system',
};

const defaultPlatformFeesV2: PlatformFeeConfigV2 = {
  schemaVersion: 2,
  tiers: [],
  updatedAt: EPOCH,
  updatedBy: 'system',
};

const defaultSubscriptionPlans: SubscriptionPlansConfig = {
  schemaVersion: 1,
  plans: [],
  updatedAt: EPOCH,
  updatedBy: 'system',
};

const defaultReliabilityWeights: ReliabilityWeightConfig = {
  schemaVersion: 1,
  showUpRateWeight: 0.3,
  responseTimeWeight: 0.2,
  disputeFrequencyWeight: 0.2,
  proofCompletenessWeight: 0.15,
  onTimeCompletionWeight: 0.15,
  autoReleaseThreshold: 80,
  largeJobThreshold: 75,
  highTicketThreshold: 85,
  updatedAt: EPOCH,
  updatedBy: 'system',
};

const defaultHighTicketPolicy: HighTicketPolicyConfig = {
  schemaVersion: 1,
  thresholdCents: 500000,
  feeMode: 'intake_success',
  intakeFeeCents: 9900,
  successFeeBps: 300,
  contractorReferralFeeBps: 600,
  updatedAt: EPOCH,
  updatedBy: 'system',
};

async function getOrSetConfig<T>(docId: string, fallback: T): Promise<T> {
  const ref = db.collection('config').doc(docId);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set(fallback as any);
    return fallback;
  }
  return snap.data() as T;
}

export async function getPlatformFeeConfig(): Promise<PlatformFeeConfig> {
  return getOrSetConfig<PlatformFeeConfig>('platformFees', defaultFeeConfig);
}

export async function getHoldPolicyConfig(): Promise<HoldPolicyConfig> {
  return getOrSetConfig<HoldPolicyConfig>('holdPolicy', defaultHoldPolicy);
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  return getOrSetConfig<FeatureFlags>('featureFlags', DEFAULT_FEATURE_FLAGS);
}

export async function getDepositPolicyConfig(): Promise<DepositPolicyConfig> {
  return getOrSetConfig<DepositPolicyConfig>('depositPolicies', defaultDepositPolicies);
}

export async function getPlatformFeeConfigV2(): Promise<PlatformFeeConfigV2> {
  const configured = await getOrSetConfig<PlatformFeeConfigV2>('platformFeesV2', defaultPlatformFeesV2);
  if (configured.tiers.length > 0) {
    return configured;
  }

  const v1 = await getPlatformFeeConfig();
  return {
    schemaVersion: 2,
    tiers: [
      {
        id: 'default',
        minAmountCents: 0,
        percentBps: v1.percentBps,
        fixedFeeCents: v1.fixedFeeCents,
      },
    ],
    updatedAt: configured.updatedAt,
    updatedBy: configured.updatedBy,
  };
}

export async function getSubscriptionPlansConfig(): Promise<SubscriptionPlansConfig> {
  return getOrSetConfig<SubscriptionPlansConfig>('subscriptionPlans', defaultSubscriptionPlans);
}

export async function getReliabilityWeightsConfig(): Promise<ReliabilityWeightConfig> {
  return getOrSetConfig<ReliabilityWeightConfig>('reliabilityWeights', defaultReliabilityWeights);
}

export async function getHighTicketPolicyConfig(): Promise<HighTicketPolicyConfig> {
  return getOrSetConfig<HighTicketPolicyConfig>('highTicketPolicy', defaultHighTicketPolicy);
}
