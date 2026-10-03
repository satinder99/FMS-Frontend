// [FRONTEND · React] src/pages/driver/DriverDashboardPage.tsx
import { useState } from 'react';
import AsyncState from '../../components/common/AsyncState';
import CheckpointTimeline, { ProgressSegments } from '../../components/trips/CheckpointTimeline';
import TripMeta from '../../components/trips/TripMeta';
import { useApiData } from '../../hooks/useApiData';
import { driverApi, errorMessage } from '../../lib/fleetApi';
import { formatDateTime } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import { useAuthStore } from '../../store/authStore';

export default function DriverDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, error, loading, reload } = useApiData(driverApi.listTrips, 30_000);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const trips = data ?? [];
  const active =
    trips.find((t) => getTripProgress(t).status === 'in_progress') ??
    trips.find((t) => getTripProgress(t).status === 'assigned');
  const upcoming = trips.filter((t) => t.id !== active?.id && getTripProgress(t).status !== 'completed');
  const completed = trips.filter((t) => getTripProgress(t).status === 'completed');

  async function handleComplete(tripId: number) {
    setBusy(true);
    setActionError(null);
    try {
      await driverApi.completeNextCheckpoint(tripId);
      await reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{user ? `Hi ${user.first_name}` : 'My trips'}</h1>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
        {!active ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No trips assigned to you yet. Your dispatcher will assign one soon.
          </p>
        ) : (
          <section aria-labelledby="current-ride" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="current-ride" className="text-lg font-semibold">
                Current ride <span className="font-normal text-slate-500">{active.reference}</span>
              </h2>
              <p className="text-sm text-slate-500">Pickup {formatDateTime(active.scheduledPickup)}</p>
            </div>

            <TripMeta trip={active} />
            <hr className="my-5 border-slate-200" />

            {actionError && (
              <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                {actionError}
              </p>
            )}

            <CheckpointTimeline
              trip={active}
              action={
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleComplete(active.id)}
                  className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  {busy ? 'Saving…' : `Mark “${getTripProgress(active).next?.label}” done`}
                </button>
              }
            />
          </section>
        )}

        {upcoming.length > 0 && (
          <section aria-labelledby="upcoming" className="mt-8">
            <h2 id="upcoming" className="mb-3 text-lg font-semibold">Upcoming trips</h2>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {upcoming.map((trip) => (
                <li key={trip.id} className="space-y-3 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium">
                      {trip.origin} <span className="text-slate-400">to</span> {trip.destination}
                    </p>
                    <p className="text-sm text-slate-500">Pickup {formatDateTime(trip.scheduledPickup)}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Truck <span className="tabular-nums">{trip.truckNumber}</span> · Trailer{' '}
                    <span className="tabular-nums">{trip.trailerNumber}</span>
                  </p>
                  <ProgressSegments trip={trip} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {completed.length > 0 && (
          <section aria-labelledby="completed" className="mt-8">
            <h2 id="completed" className="mb-3 text-lg font-semibold">Completed (last 30 days)</h2>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm">
              {completed.map((trip) => (
                <li key={trip.id} className="flex flex-wrap justify-between gap-2 p-4">
                  <span>{trip.origin} to {trip.destination}</span>
                  <span className="text-slate-500">
                    Delivered {formatDateTime(getTripProgress(trip).lastUpdate)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </AsyncState>
    </div>
  );
}
