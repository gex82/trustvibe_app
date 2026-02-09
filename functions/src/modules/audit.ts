import type { AuditAction, Role } from '@trustvibe/shared';
import { db } from '../utils/firebase';

export async function writeAuditLog(input: {
  actorId: string;
  actorRole: Role;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
}): Promise<AuditAction> {
  const now = new Date().toISOString();
  const ref = db.collection('audit').doc('adminActions').collection('items').doc();
  const payload: AuditAction = {
    id: ref.id,
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    details: input.details,
    createdAt: now,
  };
  await ref.set(payload);
  return payload;
}
