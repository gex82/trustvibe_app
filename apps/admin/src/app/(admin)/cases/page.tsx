'use client';

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import type { CallableRequest, CallableResponse } from '@trustvibe/shared';
import { adminFunctions, maybeConnectAdminEmulators } from '../../../lib/firebase';
import { useCollectionData } from '../../../lib/useCollectionData';

type CaseRow = {
  id: string;
  projectId: string;
  status?: string;
  heldAmountCents?: number;
  resolutionDocumentUrl?: string;
};

export default function CasesPage() {
  const { rows, loading, error } = useCollectionData('cases');
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<string>('');

  async function executeRefund(caseRow: CaseRow) {
    setBusyId(caseRow.id);
    setResult('');
    try {
      maybeConnectAdminEmulators();
      const fn = httpsCallable<CallableRequest<'adminExecuteOutcome'>, CallableResponse<'adminExecuteOutcome'>>(
        adminFunctions,
        'adminExecuteOutcome'
      );
      const projectId = caseRow.projectId;
      await fn({
        projectId,
        caseId: caseRow.id,
        outcomeType: 'refund_full',
        releaseToContractorCents: 0,
        refundToCustomerCents: caseRow.heldAmountCents ?? 0,
        docReference: caseRow.resolutionDocumentUrl ?? 'manual-doc-reference',
      });
      setResult(`Executed refund for case ${caseRow.id}`);
    } catch (err) {
      setResult(String(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card">
      <h1>Cases</h1>
      <p className="muted">Neutral execution only from signed release or external final resolution.</p>
      {loading ? <p data-testid="cases-loading" className="muted">Loading...</p> : null}
      {error ? <p data-testid="cases-error" className="muted">{error}</p> : null}
      {result ? <p data-testid="cases-result" className="muted">{result}</p> : null}
      <table data-testid="cases-table" className="table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Project</th>
            <th>Status</th>
            <th>Resolution Doc</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.projectId}</td>
              <td>{row.status}</td>
              <td>{row.resolutionDocumentUrl ?? '-'}</td>
              <td>
                <button
                  data-testid={`cases-execute-${row.id}`}
                  className="btn btn-secondary"
                  disabled={busyId === row.id}
                  onClick={() => executeRefund(row as CaseRow)}
                >
                  Execute Outcome
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
