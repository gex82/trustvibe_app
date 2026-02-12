'use client';

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { adminFunctions, maybeConnectAdminEmulators } from '../../../lib/firebase';
import { useCollectionData } from '../../../lib/useCollectionData';

export default function ConciergePage() {
  const { rows, loading, error, refresh } = useCollectionData('highTicketCases');
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');

  async function assign(caseId: string) {
    setBusyId(caseId);
    setMessage('');
    try {
      maybeConnectAdminEmulators();
      const fn = httpsCallable(adminFunctions, 'assignConciergeManager');
      await fn({ caseId, adminUserId: 'admin-concierge-001' });
      await refresh();
      setMessage(`Assigned concierge manager for ${caseId}.`);
    } catch (err) {
      setMessage(String(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card">
      <h1>Concierge Cases</h1>
      <p className="muted">High-ticket intake, bidding, and managed workflows.</p>
      {loading ? <p className="muted">Loading...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {message ? <p className="muted">{message}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Case</th>
            <th>Project</th>
            <th>Status</th>
            <th>Bids</th>
            <th>Manager</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.projectId}</td>
              <td>{row.status}</td>
              <td>{row.bidsCount ?? 0}</td>
              <td>{row.conciergeManagerId ?? '-'}</td>
              <td>
                <button className="btn btn-secondary" disabled={busyId === row.id} onClick={() => assign(row.id)}>
                  Assign Manager
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
