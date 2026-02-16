import type { Role } from '@trustvibe/shared';

export interface CreateHoldInput {
  projectId: string;
  customerId: string;
  contractorId: string;
  amountCents: number;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateHoldResult {
  providerHoldId: string;
  status: 'HELD';
}

export interface ReleaseInput {
  projectId: string;
  providerHoldId: string;
  amountCents: number;
  destinationAccountRef: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface ReleaseResult {
  providerTransferId: string;
  status: 'RELEASED';
}

export interface RefundInput {
  projectId: string;
  providerHoldId: string;
  amountCents: number;
  destinationCustomerRef: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundResult {
  providerRefundId: string;
  status: 'REFUNDED';
}

export interface CreateConnectedAccountInput {
  userId: string;
  email?: string;
  country?: string;
  type?: 'express' | 'standard';
}

export interface CreateConnectedAccountResult {
  providerAccountId: string;
  onboardingStatus: 'PENDING' | 'ACTIVE';
}

export interface GetOnboardingLinkInput {
  providerAccountId: string;
  returnUrl: string;
  refreshUrl: string;
}

export interface GetOnboardingLinkResult {
  url: string;
}

export interface CreateSubscriptionInput {
  accountRef: string;
  planCode: string;
  quantity?: number;
}

export interface CreateSubscriptionResult {
  providerSubscriptionId: string;
  status: 'active' | 'trialing' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface UpdateSubscriptionInput {
  providerSubscriptionId: string;
  planCode?: string;
  quantity?: number;
  cancelAtPeriodEnd?: boolean;
}

export interface CreateInvoiceInput {
  providerSubscriptionId: string;
  accountRef: string;
  amountCents: number;
  description: string;
}

export interface CreateInvoiceResult {
  providerInvoiceId: string;
  status: 'draft' | 'open' | 'paid';
}

export interface PaymentProvider {
  providerName: string;
  createHold(input: CreateHoldInput): Promise<CreateHoldResult>;
  release(input: ReleaseInput): Promise<ReleaseResult>;
  refund(input: RefundInput): Promise<RefundResult>;
  createConnectedAccount(input: CreateConnectedAccountInput): Promise<CreateConnectedAccountResult>;
  getOnboardingLink(input: GetOnboardingLinkInput): Promise<GetOnboardingLinkResult>;
  createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult>;
  updateSubscription(input: UpdateSubscriptionInput): Promise<void>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult>;
  supports(actorRole: Role): boolean;
}
