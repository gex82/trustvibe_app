'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { adminAuth, adminFunctions, maybeConnectAdminEmulators } from './firebase';

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
