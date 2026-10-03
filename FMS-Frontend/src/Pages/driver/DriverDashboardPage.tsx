import { useMemo } from 'react';
import CheckpointTimeline, { ProgressSegments } from '../../components/trips/CheckpointTimeline';
import TripMeta from '../../components/trips/TripMeta';
import { formatDateTime } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import { DEMO_DRIVER_ID } from '../../mocks/drivers';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';

export default function DriverDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const allTrips = useTripStore((s) => s.trips);
  const completeNext = useTripStore((s) => s.completeNextCheckpoint);

  const trips = useMemo(() => allTrips.filter((t) => t.driverId === DEMO_DRIVER_ID), [allTrips]);

  const active =
    trips.find((t) => getTripProgress(t).status === 'in_progress') ??
    trips.find((t) => getTripProgress(t).status === 'assigned');
  const upcoming = trips.filter((t) => t.id !== active?.id && getTripProgress(t).status !== 'completed');
  const completed = trips.filter((t) => getTripProgress(t).status === 'completed');

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {user ? `Hi ${user.first_name}` : 'My trips'}
      </h1>

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

          <CheckpointTimeline
            trip={active}
            action={
              <button
                type="button"
                onClick={() => completeNext(active.id)}
                className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                Mark “{getTripProgress(active).next?.label}” done
              </button>
            }
          />
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming">
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
        <section aria-labelledby="completed">
          <h2 id="completed" className="mb-3 text-lg font-semibold">Completed</h2>
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
    </div>
  );
}
