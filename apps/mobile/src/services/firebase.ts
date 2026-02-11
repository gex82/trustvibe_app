import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'trustvibe-dev.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'trustvibe-dev',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'trustvibe-dev.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:demo',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

let emulatorsConnected = false;

export function maybeConnectEmulators(): void {
  if (emulatorsConnected) {
    return;
  }

  const useEmulators = __DEV__ && process.env.EXPO_PUBLIC_USE_EMULATORS !== 'false';
  if (!useEmulators) {
    return;
  }

  const host = process.env.EXPO_PUBLIC_EMULATOR_HOST ?? '127.0.0.1';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectFunctionsEmulator(functions, host, 5001);

  emulatorsConnected = true;
}
