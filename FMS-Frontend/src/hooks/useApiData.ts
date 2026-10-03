// [FRONTEND · React] src/hooks/useApiData.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../lib/fleetApi';

/**
 * Loads data on mount and (optionally) re-polls on an interval.
 * `fetcher` must be referentially stable: a module-level function (e.g. driverApi.listTrips)
 * or one wrapped in useCallback.
 *
 * Only the NEWEST request is allowed to update state, so a slow earlier response
 * (overlapping poll, or a fetcher that changed with the URL) can't overwrite fresher data.
 */
export function useApiData<T>(fetcher: () => Promise<T>, intervalMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current;
    try {
      const result = await fetcher();
      if (requestId !== latestRequest.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(errorMessage(err));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    void reload();
    if (!intervalMs) return;
    const id = window.setInterval(() => void reload(), intervalMs);
    return () => window.clearInterval(id);
  }, [reload, intervalMs]);

  return { data, error, loading, reload };
}
