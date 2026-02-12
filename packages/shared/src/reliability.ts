import type { ReliabilityWeightConfig } from './types';

export interface ReliabilityCounters {
  appointmentsTotal: number;
  appointmentsAttended: number;
  disputesTotal: number;
  completionsTotal: number;
  completionsOnTime: number;
  proofSubmissionsTotal: number;
  proofSubmissionsComplete: number;
  responseMedianMinutes: number;
}

export interface ReliabilityMetrics {
  showUpRate: number;
  responseTimeScore: number;
  disputeScore: number;
  proofScore: number;
  onTimeScore: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeReliabilityMetrics(counters: ReliabilityCounters): ReliabilityMetrics {
  const showUpRate =
    counters.appointmentsTotal <= 0 ? 50 : Math.round((counters.appointmentsAttended / counters.appointmentsTotal) * 100);
  const onTimeScore =
    counters.completionsTotal <= 0 ? 50 : Math.round((counters.completionsOnTime / counters.completionsTotal) * 100);
  const proofScore =
    counters.proofSubmissionsTotal <= 0
      ? 50
      : Math.round((counters.proofSubmissionsComplete / counters.proofSubmissionsTotal) * 100);
  const responseTimeScore = clamp(Math.round(100 - counters.responseMedianMinutes / 6), 0, 100);
  const disputePenalty = counters.completionsTotal <= 0 ? 0 : Math.round((counters.disputesTotal / counters.completionsTotal) * 100);
  const disputeScore = clamp(100 - disputePenalty, 0, 100);

  return {
    showUpRate: clamp(showUpRate, 0, 100),
    responseTimeScore,
    disputeScore,
    proofScore: clamp(proofScore, 0, 100),
    onTimeScore: clamp(onTimeScore, 0, 100),
  };
}

export function computeReliabilityScore(metrics: ReliabilityMetrics, weights: ReliabilityWeightConfig): number {
  const totalWeight =
    weights.showUpRateWeight +
    weights.responseTimeWeight +
    weights.disputeFrequencyWeight +
    weights.proofCompletenessWeight +
    weights.onTimeCompletionWeight;
  const normalizedWeight = totalWeight <= 0 ? 1 : totalWeight;
  const raw =
    metrics.showUpRate * weights.showUpRateWeight +
    metrics.responseTimeScore * weights.responseTimeWeight +
    metrics.disputeScore * weights.disputeFrequencyWeight +
    metrics.proofScore * weights.proofCompletenessWeight +
    metrics.onTimeScore * weights.onTimeCompletionWeight;
  return Math.round(raw / normalizedWeight);
}

export function computeReliabilityEligibility(score: number, weights: ReliabilityWeightConfig): {
  autoRelease: boolean;
  largeJobs: boolean;
  highTicket: boolean;
} {
  return {
    autoRelease: score >= weights.autoReleaseThreshold,
    largeJobs: score >= weights.largeJobThreshold,
    highTicket: score >= weights.highTicketThreshold,
  };
}
