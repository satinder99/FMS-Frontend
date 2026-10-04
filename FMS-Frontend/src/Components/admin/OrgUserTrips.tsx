// [FRONTEND · React] src/components/admin/OrgUserTrips.tsx
// Admin: the trips one person handles (a driver's assigned trips, or the trips a dispatcher created),
// each expandable to see every step's start and end time.
import { useCallback } from 'react';
import AsyncState from '../common/AsyncState';
import CheckpointTimeline, { ProgressSegments } from '../trips/CheckpointTimeline';
import TripMeta from '../trips/TripMeta';
import { useApiData } from '../../hooks/useApiData';
import { adminApi } from '../../lib/fleetApi';
import { formatDateTime } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';

const STATUS_LABEL = { assigned: 'Assigned', in_progress: 'In progress', completed: 'Completed' } as const;

export default function OrgUserTrips({ orgId, userId }: { orgId: number; userId: number }) {
  const fetcher = useCallback(() => adminApi.userTrips(orgId, userId), [orgId, userId]);
  const { data, error, loading, reload } = useApiData(fetcher);
  const trips = data?.trips ?? [];
  const isDispatcher = data?.user.role === 'dispatcher';

  return (
    <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
      {trips.length === 0 ? (
        <p className="text-sm text-slate-500">{isDispatcher ? 'This dispatcher has not created any trips yet.' : 'No trips assigned yet.'}</p>
      ) : (
        <ul className="space-y-2">
          {trips.map((trip) => {
            const p = getTripProgress(trip);
            return (
              <li key={trip.id}>
                <details className="rounded-lg border border-slate-200 bg-white p-3">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {trip.reference} · {trip.origin} <span className="text-slate-400">to</span> {trip.destination}
                      </span>
                      <span className="text-sm text-slate-500">
                        {STATUS_LABEL[trip.status]} · {p.done}/{p.total} steps · pickup {formatDateTime(trip.scheduledPickup)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {isDispatcher ? `Driver: ${trip.driverName}` : `Created by: ${trip.createdByName ?? 'unknown'}`}
                    </p>
                    <div className="mt-2"><ProgressSegments trip={trip} /></div>
                  </summary>
                  <div className="mt-4 space-y-4">
                    <TripMeta trip={trip} />
                    <CheckpointTimeline trip={trip} />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </AsyncState>
  );
}
