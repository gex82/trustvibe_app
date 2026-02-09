import type { LedgerEvent, LedgerEventType, Role } from '@trustvibe/shared';
import { db } from '../utils/firebase';

export async function writeLedgerEvent(input: {
  projectId: string;
  type: LedgerEventType;
  actorId: string;
  actorRole: Role;
  amountCents?: number;
  feeCents?: number;
  metadata?: Record<string, unknown>;
  supportingDocRefs?: string[];
}): Promise<LedgerEvent> {
  const now = new Date().toISOString();
  const ref = db.collection('ledgers').doc(input.projectId).collection('events').doc();
  const payload: LedgerEvent = {
    id: ref.id,
    projectId: input.projectId,
    type: input.type,
    amountCents: input.amountCents,
    feeCents: input.feeCents,
    actorId: input.actorId,
    actorRole: input.actorRole,
    metadata: input.metadata,
    supportingDocRefs: input.supportingDocRefs,
    createdAt: now,
  };
  await ref.set(payload);
  return payload;
}
