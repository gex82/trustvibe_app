import { getApps, initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'trustvibe-dev.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'trustvibe-dev',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'trustvibe-dev.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:demo',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

function createAuth() {
  try {
    const authModule = require('firebase/auth') as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
    };

    if (typeof authModule.getReactNativePersistence === 'function') {
      return initializeAuth(app, {
        persistence: authModule.getReactNativePersistence(AsyncStorage) as any,
      });
    }
  } catch {
    // Fallback to default auth if RN-specific persistence is unavailable.
  }

  return getAuth(app);
}

export const auth = createAuth();
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
export const storage = getStorage(app);

let emulatorsConnected = false;

function resolveEmulatorHost(): string {
  const configured = (process.env.EXPO_PUBLIC_EMULATOR_HOST ?? '').trim();
  const normalizedConfigured = configured === '0.0.0.0' ? '127.0.0.1' : configured;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const browserHost = window.location.hostname?.trim();
    if (browserHost) {
      return browserHost;
    }
  }

  return normalizedConfigured || '127.0.0.1';
}

export function maybeConnectEmulators(): void {
  if (emulatorsConnected) {
    return;
  }

  const useEmulators = __DEV__ && process.env.EXPO_PUBLIC_USE_EMULATORS !== 'false';
  if (!useEmulators) {
    return;
  }

  const host = resolveEmulatorHost();
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectFunctionsEmulator(functions, host, 5001);
  connectStorageEmulator(storage, host, 9199);

  emulatorsConnected = true;
}
