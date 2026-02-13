'use client';

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { adminFunctions, maybeConnectAdminEmulators } from '../../../lib/firebase';

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export default function ConfigPage() {
  const [percent, setPercent] = React.useState('5');
  const [approvalDays, setApprovalDays] = React.useState('7');
  const [adminDays, setAdminDays] = React.useState('30');
  const [highTicketThreshold, setHighTicketThreshold] = React.useState('5000');

  const [stripeConnectEnabled, setStripeConnectEnabled] = React.useState(false);
  const [estimateDepositsEnabled, setEstimateDepositsEnabled] = React.useState(true);
  const [milestonesEnabled, setMilestonesEnabled] = React.useState(false);
  const [changeOrdersEnabled, setChangeOrdersEnabled] = React.useState(false);
  const [credentialVerificationEnabled, setCredentialVerificationEnabled] = React.useState(true);
  const [schedulingEnabled, setSchedulingEnabled] = React.useState(false);
  const [reliabilityScoringEnabled, setReliabilityScoringEnabled] = React.useState(true);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = React.useState(true);
  const [highTicketConciergeEnabled, setHighTicketConciergeEnabled] = React.useState(true);
  const [recommendationsEnabled, setRecommendationsEnabled] = React.useState(false);
  const [growthEnabled, setGrowthEnabled] = React.useState(false);

  const [feeTiersJson, setFeeTiersJson] = React.useState('[]');
  const [depositPoliciesJson, setDepositPoliciesJson] = React.useState('[]');
  const [subscriptionPlansJson, setSubscriptionPlansJson] = React.useState('[]');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    async function loadConfig() {
      try {
        maybeConnectAdminEmulators();
        const fn = httpsCallable(adminFunctions, 'getCurrentConfig');
        const result: any = await fn({});
        const fees = result.data?.fees;
        const holdPolicy = result.data?.holdPolicy;
        const featureFlags = result.data?.featureFlags ?? {};
        const feesV2 = result.data?.feesV2;
        const depositPolicies = result.data?.depositPolicies;
        const subscriptionPlans = result.data?.subscriptionPlans;
        const highTicketPolicy = result.data?.highTicketPolicy;

        if (fees) {
          setPercent(String(Number(fees.percentBps ?? 0) / 100));
        }
        if (holdPolicy) {
          setApprovalDays(String(holdPolicy.approvalWindowDays ?? 7));
          setAdminDays(String(holdPolicy.adminAttentionDays ?? 30));
        }
        if (highTicketPolicy?.thresholdCents) {
          setHighTicketThreshold(String(Number(highTicketPolicy.thresholdCents) / 100));
        }

        setStripeConnectEnabled(Boolean(featureFlags.stripeConnectEnabled));
        setEstimateDepositsEnabled(Boolean(featureFlags.estimateDepositsEnabled));
        setMilestonesEnabled(Boolean(featureFlags.milestonePaymentsEnabled));
        setChangeOrdersEnabled(Boolean(featureFlags.changeOrdersEnabled));
        setCredentialVerificationEnabled(Boolean(featureFlags.credentialVerificationEnabled));
        setSchedulingEnabled(Boolean(featureFlags.schedulingEnabled));
        setReliabilityScoringEnabled(Boolean(featureFlags.reliabilityScoringEnabled));
        setSubscriptionsEnabled(Boolean(featureFlags.subscriptionsEnabled));
        setHighTicketConciergeEnabled(Boolean(featureFlags.highTicketConciergeEnabled));
        setRecommendationsEnabled(Boolean(featureFlags.recommendationsEnabled));
        setGrowthEnabled(Boolean(featureFlags.growthEnabled));

        setFeeTiersJson(pretty(feesV2?.tiers ?? []));
        setDepositPoliciesJson(pretty(depositPolicies?.rules ?? []));
        setSubscriptionPlansJson(pretty(subscriptionPlans?.plans ?? []));
      } catch (err) {
        setMessage(String(err));
      }
    }

    void loadConfig();
  }, []);

  async function save() {
    setMessage('');
    try {
      const parsedFeeTiers = JSON.parse(feeTiersJson);
      const parsedDepositPolicies = JSON.parse(depositPoliciesJson);
      const parsedSubscriptionPlans = JSON.parse(subscriptionPlansJson);

      maybeConnectAdminEmulators();
      const fn = httpsCallable(adminFunctions, 'adminSetConfig');
      await fn({
        platformFees: {
          percentBps: Number(percent) * 100,
          fixedFeeCents: 0,
        },
        platformFeesV2: {
          schemaVersion: 2,
          tiers: parsedFeeTiers,
        },
        depositPolicies: {
          schemaVersion: 1,
          rules: parsedDepositPolicies,
        },
        subscriptionPlans: {
          schemaVersion: 1,
          plans: parsedSubscriptionPlans,
        },
        reliabilityWeights: {
          schemaVersion: 1,
          showUpRateWeight: 0.3,
          responseTimeWeight: 0.2,
          disputeFrequencyWeight: 0.2,
          proofCompletenessWeight: 0.15,
          onTimeCompletionWeight: 0.15,
          autoReleaseThreshold: 80,
          largeJobThreshold: 75,
          highTicketThreshold: 85,
        },
        highTicketPolicy: {
          schemaVersion: 1,
          thresholdCents: Number(highTicketThreshold) * 100,
          feeMode: 'intake_success',
          intakeFeeCents: 9900,
          successFeeBps: 300,
          contractorReferralFeeBps: 600,
        },
        holdPolicy: {
          approvalWindowDays: Number(approvalDays),
          adminAttentionDays: Number(adminDays),
          autoReleaseEnabled: true,
        },
        featureFlags: {
          stripeConnectEnabled,
          estimateDepositsEnabled,
          milestonePaymentsEnabled: milestonesEnabled,
          changeOrdersEnabled,
          credentialVerificationEnabled,
          schedulingEnabled,
          reliabilityScoringEnabled,
          subscriptionsEnabled,
          highTicketConciergeEnabled,
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
    <section className="card grid" style={{ maxWidth: 860 }}>
      <h1>Config</h1>
      <p className="muted">Server-side policy and monetization configuration.</p>

      <label>
        Fee %
        <input data-testid="config-fee-percent" value={percent} onChange={(e) => setPercent(e.target.value)} style={inputStyle} />
      </label>
      <label>
        High-ticket threshold (USD)
        <input data-testid="config-high-ticket-threshold" value={highTicketThreshold} onChange={(e) => setHighTicketThreshold(e.target.value)} style={inputStyle} />
      </label>
      <label>
        Approval Window Days (N)
        <input data-testid="config-approval-days" value={approvalDays} onChange={(e) => setApprovalDays(e.target.value)} style={inputStyle} />
      </label>
      <label>
        Admin Attention Days (M)
        <input data-testid="config-admin-days" value={adminDays} onChange={(e) => setAdminDays(e.target.value)} style={inputStyle} />
      </label>

      <h3 style={sectionTitle}>Feature Flags</h3>
      <Flag testId="config-flag-stripe-connect" label="Stripe Connect Enabled" checked={stripeConnectEnabled} onChange={setStripeConnectEnabled} />
      <Flag testId="config-flag-estimate-deposits" label="Estimate Deposits Enabled" checked={estimateDepositsEnabled} onChange={setEstimateDepositsEnabled} />
      <Flag testId="config-flag-milestones" label="Milestone Payments Enabled" checked={milestonesEnabled} onChange={setMilestonesEnabled} />
      <Flag testId="config-flag-change-orders" label="Change Orders Enabled" checked={changeOrdersEnabled} onChange={setChangeOrdersEnabled} />
      <Flag testId="config-flag-credential-verification" label="Credential Verification Enabled" checked={credentialVerificationEnabled} onChange={setCredentialVerificationEnabled} />
      <Flag testId="config-flag-scheduling" label="Scheduling Enabled" checked={schedulingEnabled} onChange={setSchedulingEnabled} />
      <Flag testId="config-flag-reliability" label="Reliability Scoring Enabled" checked={reliabilityScoringEnabled} onChange={setReliabilityScoringEnabled} />
      <Flag testId="config-flag-subscriptions" label="Subscriptions Enabled" checked={subscriptionsEnabled} onChange={setSubscriptionsEnabled} />
      <Flag testId="config-flag-high-ticket" label="High-ticket Concierge Enabled" checked={highTicketConciergeEnabled} onChange={setHighTicketConciergeEnabled} />
      <Flag testId="config-flag-recommendations" label="Recommendations Enabled" checked={recommendationsEnabled} onChange={setRecommendationsEnabled} />
      <Flag testId="config-flag-growth" label="Growth Enabled" checked={growthEnabled} onChange={setGrowthEnabled} />

      <h3 style={sectionTitle}>Fee Tiers (JSON)</h3>
      <textarea data-testid="config-fee-tiers-json" value={feeTiersJson} onChange={(e) => setFeeTiersJson(e.target.value)} style={textareaStyle} rows={8} />

      <h3 style={sectionTitle}>Deposit Policies (JSON)</h3>
      <textarea data-testid="config-deposit-policies-json" value={depositPoliciesJson} onChange={(e) => setDepositPoliciesJson(e.target.value)} style={textareaStyle} rows={8} />

      <h3 style={sectionTitle}>Subscription Plans (JSON)</h3>
      <textarea data-testid="config-subscription-plans-json" value={subscriptionPlansJson} onChange={(e) => setSubscriptionPlansJson(e.target.value)} style={textareaStyle} rows={8} />

      <button data-testid="config-save" className="btn btn-primary" onClick={save}>
        Save Config
      </button>
      {message ? <p data-testid="config-message" className="muted">{message}</p> : null}
    </section>
  );
}

function Flag({
  testId,
  label,
  checked,
  onChange,
}: {
  testId: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}): React.JSX.Element {
  return (
    <label>
      <input data-testid={testId} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginRight: 8 }} />
      {label}
    </label>
  );
}

const sectionTitle: React.CSSProperties = {
  marginBottom: 0,
  marginTop: 10,
};

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

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
  minHeight: 140,
};
