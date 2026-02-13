'use client';

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { adminFunctions, maybeConnectAdminEmulators } from '../../../lib/firebase';
import { useCollectionData } from '../../../lib/useCollectionData';

export default function UsersPage() {
  const { rows, loading, error, refresh } = useCollectionData('users');
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');

  async function setRole(userId: string, role: 'customer' | 'contractor' | 'admin', disabled?: boolean) {
    setSavingId(userId);
    setMessage('');
    try {
      maybeConnectAdminEmulators();
      const fn = httpsCallable(adminFunctions, 'adminSetUserRole');
      await fn({ userId, role, disabled });
      await refresh();
      setMessage(`Updated user ${userId}.`);
    } catch (err) {
      setMessage(String(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="card">
      <h1>Users</h1>
      <p className="muted">View, disable, and role management with custom-claim sync.</p>
      {loading ? <p data-testid="users-loading" className="muted">Loading...</p> : null}
      {error ? <p data-testid="users-error" className="muted">{error}</p> : null}
      {message ? <p data-testid="users-message" className="muted">{message}</p> : null}
      <table data-testid="users-table" className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Municipality</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name ?? '-'}</td>
              <td>{row.email ?? '-'}</td>
              <td>{row.role ?? '-'}</td>
              <td>{row.municipality ?? '-'}</td>
              <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" disabled={savingId === row.id} onClick={() => setRole(row.id, 'customer', false)}>
                  Customer
                </button>
                <button className="btn btn-secondary" disabled={savingId === row.id} onClick={() => setRole(row.id, 'contractor', false)}>
                  Contractor
                </button>
                <button className="btn btn-secondary" disabled={savingId === row.id} onClick={() => setRole(row.id, 'admin', false)}>
                  Admin
                </button>
                <button className="btn" disabled={savingId === row.id} onClick={() => setRole(row.id, row.role ?? 'customer', !(row.disabled ?? false))}>
                  {row.disabled ? 'Enable' : 'Disable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
