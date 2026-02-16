'use client';

import { initializeApp, getApps } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'trustvibe-dev.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'trustvibe-dev',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'trustvibe-dev.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:demo',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminFunctions = getFunctions(app, 'us-central1');

let connected = false;

function resolveEmulatorHost(): string {
  const configured = (process.env.NEXT_PUBLIC_EMULATOR_HOST ?? '').trim();

  if (typeof window !== 'undefined') {
    const browserHost = window.location.hostname?.trim();
    if (browserHost) {
      return browserHost;
    }
  }

  return configured || '127.0.0.1';
}

export function maybeConnectAdminEmulators(): void {
  if (connected) {
    return;
  }

  const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS !== 'false';
  if (!useEmulators) {
    return;
  }

  const host = resolveEmulatorHost();
  connectAuthEmulator(adminAuth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(adminDb, host, 8080);
  connectFunctionsEmulator(adminFunctions, host, 5001);
  connected = true;
}
