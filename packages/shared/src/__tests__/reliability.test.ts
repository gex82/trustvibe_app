import { computeReliabilityEligibility, computeReliabilityMetrics, computeReliabilityScore } from '../reliability';

describe('reliability scoring', () => {
  const weights = {
    schemaVersion: 1,
    showUpRateWeight: 0.3,
    responseTimeWeight: 0.2,
    disputeFrequencyWeight: 0.2,
    proofCompletenessWeight: 0.15,
    onTimeCompletionWeight: 0.15,
    autoReleaseThreshold: 80,
    largeJobThreshold: 75,
    highTicketThreshold: 85,
    updatedAt: '2026-01-01T00:00:00.000Z',
    updatedBy: 'test',
  };

  it('computes score and eligibility', () => {
    const metrics = computeReliabilityMetrics({
      appointmentsTotal: 10,
      appointmentsAttended: 9,
      disputesTotal: 1,
      completionsTotal: 10,
      completionsOnTime: 9,
      proofSubmissionsTotal: 10,
      proofSubmissionsComplete: 10,
      responseMedianMinutes: 25,
    });
    const score = computeReliabilityScore(metrics, weights);
    const eligibility = computeReliabilityEligibility(score, weights);

    expect(score).toBeGreaterThanOrEqual(80);
    expect(eligibility.autoRelease).toBe(true);
    expect(eligibility.largeJobs).toBe(true);
  });

  it('penalizes no-shows and slow response', () => {
    const metrics = computeReliabilityMetrics({
      appointmentsTotal: 10,
      appointmentsAttended: 4,
      disputesTotal: 4,
      completionsTotal: 10,
      completionsOnTime: 5,
      proofSubmissionsTotal: 10,
      proofSubmissionsComplete: 4,
      responseMedianMinutes: 900,
    });
    const score = computeReliabilityScore(metrics, weights);
    const eligibility = computeReliabilityEligibility(score, weights);

    expect(score).toBeLessThan(75);
    expect(eligibility.autoRelease).toBe(false);
    expect(eligibility.highTicket).toBe(false);
  });
});
