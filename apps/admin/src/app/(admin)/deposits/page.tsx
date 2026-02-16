'use client';

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import type { CallableRequest, CallableResponse } from '@trustvibe/shared';
import { adminFunctions, maybeConnectAdminEmulators } from '../../../lib/firebase';
import { useCollectionData } from '../../../lib/useCollectionData';

export default function DepositsPage() {
  const { rows, loading, error, refresh } = useCollectionData('estimateDeposits');
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');

  async function refund(depositId: string) {
    setBusyId(depositId);
    setMessage('');
    try {
      maybeConnectAdminEmulators();
      const fn = httpsCallable<CallableRequest<'refundEstimateDeposit'>, CallableResponse<'refundEstimateDeposit'>>(
        adminFunctions,
        'refundEstimateDeposit'
      );
      await fn({ depositId, reason: 'admin_override' });
      await refresh();
      setMessage(`Refund executed for ${depositId}.`);
    } catch (err) {
      setMessage(String(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card">
      <h1>Estimate Deposits</h1>
      <p className="muted">Deposit lifecycle monitoring and manual override refunds.</p>
      {loading ? <p className="muted">Loading...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {message ? <p className="muted">{message}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.projectId}</td>
              <td>{typeof row.amountCents === 'number' ? `$${(row.amountCents / 100).toFixed(2)}` : '-'}</td>
              <td>{row.status ?? '-'}</td>
              <td>
                <button className="btn btn-secondary" disabled={busyId === row.id} onClick={() => refund(row.id)}>
                  Refund
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
