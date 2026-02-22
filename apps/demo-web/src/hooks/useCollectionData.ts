import { useCallback, useEffect, useState } from "react";
import { listCollectionData } from "../services/api";
import { useRuntime } from "../context/RuntimeContext";

export function useCollectionData(collectionPath: string, max = 50) {
  const { dataMode } = useRuntime();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (dataMode === "mock") {
        setRows([]);
        return;
      }
      const nextRows = await listCollectionData(collectionPath, max);
      setRows(nextRows);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [collectionPath, dataMode, max]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, loading, error, refresh };
}
