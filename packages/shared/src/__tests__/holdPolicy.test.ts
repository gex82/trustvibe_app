import {
  computeAdminAttentionDate,
  computeApprovalDeadline,
  isAdminAttentionRequired,
  isApprovalDeadlinePassed,
} from '../holdPolicy';

describe('hold policy deadlines', () => {
  const completionRequestedAt = '2026-02-01T12:00:00.000Z';
  const issueRaisedAt = '2026-02-01T12:00:00.000Z';

  it('computes approval deadline', () => {
    expect(computeApprovalDeadline(completionRequestedAt, 7)).toBe('2026-02-08T12:00:00.000Z');
  });

  it('detects approval deadline pass', () => {
    expect(isApprovalDeadlinePassed('2026-02-09T12:00:00.000Z', completionRequestedAt, 7)).toBe(true);
    expect(isApprovalDeadlinePassed('2026-02-07T12:00:00.000Z', completionRequestedAt, 7)).toBe(false);
  });

  it('computes admin attention date', () => {
    expect(computeAdminAttentionDate(issueRaisedAt, 30)).toBe('2026-03-03T12:00:00.000Z');
  });

  it('detects admin attention threshold', () => {
    expect(isAdminAttentionRequired('2026-03-03T12:00:00.000Z', issueRaisedAt, 30)).toBe(true);
    expect(isAdminAttentionRequired('2026-03-01T12:00:00.000Z', issueRaisedAt, 30)).toBe(false);
  });
});
