'use client';

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import type { CallableRequest, CallableResponse } from '@trustvibe/shared';
import { adminFunctions, maybeConnectAdminEmulators } from '../../../lib/firebase';
import { useCollectionData } from '../../../lib/useCollectionData';

export default function SubscriptionsPage() {
  const subscriptions = useCollectionData('subscriptions');
  const invoices = useCollectionData('billingInvoices');
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');

  async function cancel(subscriptionId: string) {
    setBusyId(subscriptionId);
    setMessage('');
    try {
      maybeConnectAdminEmulators();
      const fn = httpsCallable<CallableRequest<'cancelSubscription'>, CallableResponse<'cancelSubscription'>>(
        adminFunctions,
        'cancelSubscription'
      );
      await fn({ subscriptionId, cancelAtPeriodEnd: false });
      await subscriptions.refresh();
      setMessage(`Canceled subscription ${subscriptionId}.`);
    } catch (err) {
      setMessage(String(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card">
      <h1>Subscriptions</h1>
      <p className="muted">Recurring plans and invoicing.</p>
      {subscriptions.loading || invoices.loading ? <p className="muted">Loading...</p> : null}
      {subscriptions.error ? <p className="muted">{subscriptions.error}</p> : null}
      {invoices.error ? <p className="muted">{invoices.error}</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      <h3>Plans</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Account</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.accountId}</td>
              <td>{row.planId}</td>
              <td>{row.status}</td>
              <td>
                <button className="btn btn-secondary" disabled={busyId === row.id} onClick={() => cancel(row.id)}>
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Invoices</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Subscription</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.subscriptionId}</td>
              <td>{typeof row.amountCents === 'number' ? `$${(row.amountCents / 100).toFixed(2)}` : '-'}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
