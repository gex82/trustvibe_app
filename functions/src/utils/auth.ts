import type { Role } from '@trustvibe/shared';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './firebase';

export interface Actor {
  uid: string;
  role: Role;
  adminVerified: boolean;
}

export async function getActor(auth: { uid?: string; token?: Record<string, unknown> } | null | undefined): Promise<Actor> {
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const uid = auth.uid;
  const tokenRole = auth.token?.role as Role | undefined;

  let profileRole: Role | undefined;
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists) {
    profileRole = userDoc.data()?.role as Role | undefined;
  }

  if (tokenRole && profileRole && tokenRole !== profileRole) {
    throw new HttpsError('permission-denied', 'Role mismatch between token and profile.');
  }

  const role = tokenRole ?? profileRole;
  if (!role) {
    throw new HttpsError('permission-denied', 'User role missing.');
  }

  const isEmulator =
    process.env.FUNCTIONS_EMULATOR === 'true' ||
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) ||
    Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

  const adminVerified = role !== 'admin' ? false : tokenRole === 'admin' || (isEmulator && profileRole === 'admin');

  return { uid, role, adminVerified };
}

export function requireRole(actor: Actor, allowed: Role[]): void {
  if (!allowed.includes(actor.role)) {
    throw new HttpsError('permission-denied', `Role ${actor.role} is not allowed for this action.`);
  }

  if (actor.role === 'admin' && allowed.includes('admin') && !actor.adminVerified) {
    throw new HttpsError('permission-denied', 'Admin custom claim is required for this action.');
  }
}
