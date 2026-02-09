import type { Role } from '@trustvibe/shared';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './firebase';

export interface Actor {
  uid: string;
  role: Role;
}

export async function getActor(auth: { uid?: string; token?: Record<string, unknown> } | null | undefined): Promise<Actor> {
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const uid = auth.uid;
  const tokenRole = auth.token?.role as Role | undefined;
  if (tokenRole) {
    return { uid, role: tokenRole };
  }

  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new HttpsError('permission-denied', 'User profile not found.');
  }

  const role = userDoc.data()?.role as Role | undefined;
  if (!role) {
    throw new HttpsError('permission-denied', 'User role missing.');
  }

  return { uid, role };
}

export function requireRole(actor: Actor, allowed: Role[]): void {
  if (!allowed.includes(actor.role)) {
    throw new HttpsError('permission-denied', `Role ${actor.role} is not allowed for this action.`);
  }
}
