'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { adminDb, maybeConnectAdminEmulators } from './firebase';

export function useCollectionData(collectionPath: string, max = 50) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      maybeConnectAdminEmulators();
      const snap = await getDocs(query(collection(adminDb, collectionPath), limit(max)));
      setRows(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [collectionPath, max]);

  return { rows, loading, error, refresh };
}
