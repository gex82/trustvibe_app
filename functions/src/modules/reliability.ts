import {
  computeReliabilityEligibility,
  computeReliabilityMetrics,
  computeReliabilityScore,
  type ReliabilityScore,
  type ReliabilityWeightConfig,
} from '@trustvibe/shared';
import { db } from '../utils/firebase';

interface ReliabilityCounterDelta {
  appointmentsTotal?: number;
  appointmentsAttended?: number;
  disputesTotal?: number;
  completionsTotal?: number;
  completionsOnTime?: number;
  proofSubmissionsTotal?: number;
  proofSubmissionsComplete?: number;
  responseSamples?: number;
  responseMedianMinutes?: number;
}

function defaultScore(contractorId: string): ReliabilityScore {
  const now = new Date().toISOString();
  return {
    contractorId,
    score: 50,
    metrics: {
      showUpRate: 50,
      responseTimeScore: 50,
      disputeScore: 50,
      proofScore: 50,
      onTimeScore: 50,
    },
    counters: {
      appointmentsTotal: 0,
      appointmentsAttended: 0,
      disputesTotal: 0,
      completionsTotal: 0,
      completionsOnTime: 0,
      proofSubmissionsTotal: 0,
      proofSubmissionsComplete: 0,
      responseSamples: 0,
      responseMedianMinutes: 120,
    },
    eligibility: {
      autoRelease: false,
      largeJobs: false,
      highTicket: false,
    },
    schemaVersion: 1,
    updatedAt: now,
    updatedBy: 'system',
  };
}

export async function getReliabilityScore(contractorId: string): Promise<ReliabilityScore> {
  const ref = db.collection('reliabilityScores').doc(contractorId);
  const snap = await ref.get();
  if (!snap.exists) {
    const fallback = defaultScore(contractorId);
    await ref.set(fallback);
    return fallback;
  }
  return snap.data() as ReliabilityScore;
}

export async function updateReliabilityScore(input: {
  contractorId: string;
  weights: ReliabilityWeightConfig;
  updatedBy: string;
  delta?: ReliabilityCounterDelta;
}): Promise<ReliabilityScore> {
  const current = await getReliabilityScore(input.contractorId);
  const nextCounters: ReliabilityScore['counters'] = {
    ...current.counters,
    appointmentsTotal: current.counters.appointmentsTotal + (input.delta?.appointmentsTotal ?? 0),
    appointmentsAttended: current.counters.appointmentsAttended + (input.delta?.appointmentsAttended ?? 0),
    disputesTotal: current.counters.disputesTotal + (input.delta?.disputesTotal ?? 0),
    completionsTotal: current.counters.completionsTotal + (input.delta?.completionsTotal ?? 0),
    completionsOnTime: current.counters.completionsOnTime + (input.delta?.completionsOnTime ?? 0),
    proofSubmissionsTotal: current.counters.proofSubmissionsTotal + (input.delta?.proofSubmissionsTotal ?? 0),
    proofSubmissionsComplete: current.counters.proofSubmissionsComplete + (input.delta?.proofSubmissionsComplete ?? 0),
    responseSamples: current.counters.responseSamples + (input.delta?.responseSamples ?? 0),
    responseMedianMinutes: input.delta?.responseMedianMinutes ?? current.counters.responseMedianMinutes,
  };

  const metrics = computeReliabilityMetrics(nextCounters);
  const score = computeReliabilityScore(metrics, input.weights);
  const now = new Date().toISOString();
  const updated: ReliabilityScore = {
    ...current,
    score,
    metrics,
    counters: nextCounters,
    eligibility: computeReliabilityEligibility(score, input.weights),
    updatedAt: now,
    updatedBy: input.updatedBy,
    schemaVersion: 1,
  };

  const scoreRef = db.collection('reliabilityScores').doc(input.contractorId);
  await scoreRef.set(updated, { merge: true });
  await scoreRef.collection('history').add({
    score,
    metrics,
    counters: nextCounters,
    createdAt: now,
    updatedBy: input.updatedBy,
  });

  return updated;
}
