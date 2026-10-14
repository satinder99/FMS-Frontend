// [FRONTEND · React] src/hooks/usePresence.ts
// Sends a heartbeat every 30 seconds and returns the organization name + the dispatchers online right now.
// `enabled` = false (admins have no organization) does nothing.
import { useCallback } from 'react';
import { presenceApi } from '../lib/fleetApi';
import type { PresenceSnapshot } from '../types/trips';
import { useApiData } from './useApiData';

const HEARTBEAT_MS = 30_000;

export function usePresence(enabled: boolean) {
  const fetcher = useCallback(
    (): Promise<PresenceSnapshot | null> => (enabled ? presenceApi.heartbeat() : Promise.resolve(null)),
    [enabled],
  );
  return useApiData(fetcher, enabled ? HEARTBEAT_MS : undefined);
}
