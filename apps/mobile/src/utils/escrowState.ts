import type { TFunction } from 'i18next';

const escrowStateKeyByValue: Record<string, string> = {
  OPEN_FOR_QUOTES: 'escrow.state.openForQuotes',
  CONTRACTOR_SELECTED: 'escrow.state.contractorSelected',
  AGREEMENT_ACCEPTED: 'escrow.state.agreementAccepted',
  FUNDED_HELD: 'escrow.state.fundedHeld',
  COMPLETION_REQUESTED: 'escrow.state.completionRequested',
  RELEASED_PAID: 'escrow.state.releasedPaid',
  ISSUE_RAISED_HOLD: 'escrow.state.issueRaisedHold',
  EXECUTED_RELEASE_FULL: 'escrow.state.executedReleaseFull',
  EXECUTED_RELEASE_PARTIAL: 'escrow.state.executedReleasePartial',
  EXECUTED_REFUND_FULL: 'escrow.state.executedRefundFull',
  EXECUTED_REFUND_PARTIAL: 'escrow.state.executedRefundPartial',
};

export function getEscrowStateLabel(t: TFunction, escrowState: string | null | undefined): string {
  const key = escrowStateKeyByValue[String(escrowState ?? '').toUpperCase()];
  if (!key) {
    return t('escrow.state.unknown', { state: String(escrowState ?? 'N/A') });
  }

  return t(key);
}
