'use client';

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { adminFunctions, maybeConnectAdminEmulators } from '../../../lib/firebase';

export default function ConfigPage() {
  const [percent, setPercent] = React.useState('5');
  const [approvalDays, setApprovalDays] = React.useState('7');
  const [adminDays, setAdminDays] = React.useState('30');
  const [milestonesEnabled, setMilestonesEnabled] = React.useState(false);
  const [changeOrdersEnabled, setChangeOrdersEnabled] = React.useState(false);
  const [schedulingEnabled, setSchedulingEnabled] = React.useState(false);
  const [recommendationsEnabled, setRecommendationsEnabled] = React.useState(false);
  const [growthEnabled, setGrowthEnabled] = React.useState(false);
  const [stripeConnectEnabled, setStripeConnectEnabled] = React.useState(false);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    async function loadConfig() {
      try {
        maybeConnectAdminEmulators();
        const fn = httpsCallable(adminFunctions, 'getCurrentConfig');
        const result: any = await fn({});
        const fees = result.data?.fees;
        const holdPolicy = result.data?.holdPolicy;
        const featureFlags = result.data?.featureFlags;

        if (fees) {
          setPercent(String(Number(fees.percentBps ?? 0) / 100));
        }
        if (holdPolicy) {
          setApprovalDays(String(holdPolicy.approvalWindowDays ?? 7));
          setAdminDays(String(holdPolicy.adminAttentionDays ?? 30));
        }
        if (featureFlags) {
          setStripeConnectEnabled(Boolean(featureFlags.stripeConnectEnabled));
          setMilestonesEnabled(Boolean(featureFlags.milestonePaymentsEnabled));
          setChangeOrdersEnabled(Boolean(featureFlags.changeOrdersEnabled));
          setSchedulingEnabled(Boolean(featureFlags.schedulingEnabled));
          setRecommendationsEnabled(Boolean(featureFlags.recommendationsEnabled));
          setGrowthEnabled(Boolean(featureFlags.growthEnabled));
        }
      } catch (err) {
        setMessage(String(err));
      }
    }

    void loadConfig();
  }, []);

  async function save() {
    setMessage('');
    try {
      maybeConnectAdminEmulators();
      const fn = httpsCallable(adminFunctions, 'adminSetConfig');
      await fn({
        platformFees: {
          percentBps: Number(percent) * 100,
          fixedFeeCents: 0,
        },
        holdPolicy: {
          approvalWindowDays: Number(approvalDays),
          adminAttentionDays: Number(adminDays),
          autoReleaseEnabled: true,
        },
        featureFlags: {
          stripeConnectEnabled,
          milestonePaymentsEnabled: milestonesEnabled,
          changeOrdersEnabled,
          credentialVerificationEnabled: false,
          schedulingEnabled,
          recommendationsEnabled,
          growthEnabled,
        },
      });
      setMessage('Saved config.');
    } catch (err) {
      setMessage(String(err));
    }
  }

  return (
    <section className="card grid" style={{ maxWidth: 520 }}>
      <h1>Config</h1>
      <p className="muted">Fee and hold-policy configuration (server-side).</p>
      <label>
        Fee %
        <input value={percent} onChange={(e) => setPercent(e.target.value)} style={inputStyle} />
      </label>
      <label>
        Approval Window Days (N)
        <input value={approvalDays} onChange={(e) => setApprovalDays(e.target.value)} style={inputStyle} />
      </label>
      <label>
        Admin Attention Days (M)
        <input value={adminDays} onChange={(e) => setAdminDays(e.target.value)} style={inputStyle} />
      </label>
      <button className="btn btn-primary" onClick={save}>
        Save Config
      </button>
      <label>
        <input type="checkbox" checked={stripeConnectEnabled} onChange={(e) => setStripeConnectEnabled(e.target.checked)} style={{ marginRight: 8 }} />
        Stripe Connect Enabled
      </label>
      <label>
        <input type="checkbox" checked={milestonesEnabled} onChange={(e) => setMilestonesEnabled(e.target.checked)} style={{ marginRight: 8 }} />
        Milestone Payments Enabled
      </label>
      <label>
        <input type="checkbox" checked={changeOrdersEnabled} onChange={(e) => setChangeOrdersEnabled(e.target.checked)} style={{ marginRight: 8 }} />
        Change Orders Enabled
      </label>
      <label>
        <input type="checkbox" checked={schedulingEnabled} onChange={(e) => setSchedulingEnabled(e.target.checked)} style={{ marginRight: 8 }} />
        Scheduling Enabled
      </label>
      <label>
        <input type="checkbox" checked={recommendationsEnabled} onChange={(e) => setRecommendationsEnabled(e.target.checked)} style={{ marginRight: 8 }} />
        Recommendations Enabled
      </label>
      <label>
        <input type="checkbox" checked={growthEnabled} onChange={(e) => setGrowthEnabled(e.target.checked)} style={{ marginRight: 8 }} />
        Growth Enabled
      </label>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  background: '#132c40',
  color: '#f4f8fc',
  border: '1px solid #2c4867',
  borderRadius: 10,
  padding: '10px 12px',
};
