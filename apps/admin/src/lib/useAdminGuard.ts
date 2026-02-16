'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { adminAuth, adminDb, adminFunctions, maybeConnectAdminEmulators } from './firebase';

type GuardState = {
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  uid: string | null;
};

const initialState: GuardState = {
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
  uid: null,
};

export function useAdminGuard(): GuardState {
  const [state, setState] = useState<GuardState>(initialState);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_ADMIN_BYPASS === 'true') {
      setState({
        loading: false,
        isAuthenticated: true,
        isAdmin: true,
        error: null,
        uid: 'demo-admin-bypass',
      });
      return () => undefined;
    }

    maybeConnectAdminEmulators();
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      if (!user) {
        setState({ loading: false, isAuthenticated: false, isAdmin: false, error: null, uid: null });
        return;
      }

      try {
        const verify = httpsCallable<Record<string, never>, { uid: string; role: string }>(adminFunctions, 'getAdminSession');
        const response = await verify({});
        setState({
          loading: false,
          isAuthenticated: true,
          isAdmin: response.data.role === 'admin',
          error: null,
          uid: response.data.uid,
        });
      } catch (error) {
        const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS !== 'false';
        if (useEmulators) {
          if (user.uid === 'admin-001') {
            setState({
              loading: false,
              isAuthenticated: true,
              isAdmin: true,
              error: null,
              uid: user.uid,
            });
            return;
          }

          try {
            const userSnap = await getDoc(doc(adminDb, 'users', user.uid));
            const role = userSnap.exists() ? String(userSnap.data()?.role ?? '') : '';
            if (role === 'admin') {
              setState({
                loading: false,
                isAuthenticated: true,
                isAdmin: true,
                error: null,
                uid: user.uid,
              });
              return;
            }
          } catch {
            // Continue with default sign-out fallback.
          }
        }

        await signOut(adminAuth).catch(() => undefined);
        setState({
          loading: false,
          isAuthenticated: false,
          isAdmin: false,
          error: String(error),
          uid: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  return state;
}
