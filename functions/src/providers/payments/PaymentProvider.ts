import type { Role } from '@trustvibe/shared';

export interface CreateHoldInput {
  projectId: string;
  customerId: string;
  contractorId: string;
  amountCents: number;
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
  metadata?: Record<string, unknown>;
}

export interface RefundResult {
  providerRefundId: string;
  status: 'REFUNDED';
}

export interface PaymentProvider {
  providerName: string;
  createHold(input: CreateHoldInput): Promise<CreateHoldResult>;
  release(input: ReleaseInput): Promise<ReleaseResult>;
  refund(input: RefundInput): Promise<RefundResult>;
  supports(actorRole: Role): boolean;
}
