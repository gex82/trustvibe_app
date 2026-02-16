import { HttpsError } from 'firebase-functions/v2/https';
import { db } from '../utils/firebase';
import type { Actor } from '../utils/auth';

const PROJECTS = db.collection('projects');

export function nowIso(): string {
  return new Date().toISOString();
}

export function ensureProjectParty(project: any, actor: Actor): void {
  if (actor.role === 'admin') {
    return;
  }

  const isCustomer = project.customerId === actor.uid;
  const isContractor = project.contractorId === actor.uid;
  if (!isCustomer && !isContractor) {
    throw new HttpsError('permission-denied', 'Project access denied.');
  }
}

export async function getProjectOrThrow(projectId: string): Promise<any> {
  const projectSnap = await PROJECTS.doc(projectId).get();
  if (!projectSnap.exists) {
    throw new HttpsError('not-found', 'Project not found.');
  }
  return projectSnap.data();
}

export async function requireFeatureFlag<TFlags extends object, K extends keyof TFlags>(
  getFlags: () => Promise<TFlags>,
  key: K,
  message: string
): Promise<TFlags> {
  const flags = await getFlags();
  if (!flags[key]) {
    throw new HttpsError('failed-precondition', message);
  }
  return flags;
}
