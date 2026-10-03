import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import CheckpointTimeline, { ProgressSegments } from '../../components/trips/CheckpointTimeline';
import TripMeta from '../../components/trips/TripMeta';
import { formatDateTime, timeAgo } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import { mockDrivers } from '../../mocks/drivers';
import { useTripStore } from '../../store/tripStore';

export default function DispatcherDriverPage() {
  const { driverId } = useParams();
  const allTrips = useTripStore((s) => s.trips);

  const driver = mockDrivers.find((d) => String(d.id) === driverId);
  const trips = useMemo(() => allTrips.filter((t) => String(t.driverId) === driverId), [allTrips, driverId]);

  if (!driver) {
    return (
      <div className="space-y-3">
        <p>We couldn’t find that driver.</p>
        <Link to="/dispatcher" className="text-sky-700 underline">Back to drivers</Link>
      </div>
    );
  }

  const active =
    trips.find((t) => getTripProgress(t).status === 'in_progress') ??
    trips.find((t) => getTripProgress(t).status === 'assigned');
  const others = trips.filter((t) => t.id !== active?.id);
  const p = active ? getTripProgress(active) : null;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dispatcher" className="text-sm text-sky-700 underline-offset-2 hover:underline">
          ← All drivers
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{driver.name}</h1>
        <p className="text-sm text-slate-600">{driver.phone}</p>
      </div>

      {!active || !p ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No active ride for this driver.
        </p>
      ) : (
        <section aria-labelledby="active-ride" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="active-ride" className="text-lg font-semibold">
              Current ride <span className="font-normal text-slate-500">{active.reference}</span>
            </h2>
            <p className="text-sm text-slate-600">
              {p.lastDone ? (
                <>Now: <span className="font-medium text-slate-900">{p.lastDone.label}</span> · {timeAgo(p.lastUpdate)}</>
              ) : (
                'Not started yet'
              )}
            </p>
          </div>

          <TripMeta trip={active} />
          <div className="my-5"><ProgressSegments trip={active} /></div>
          <CheckpointTimeline trip={active} />
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="other-rides">
          <h2 id="other-rides" className="mb-3 text-lg font-semibold">Other rides</h2>
          <div className="space-y-3">
            {others.map((trip) => {
              const tp = getTripProgress(trip);
              return (
                <details key={trip.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">
                        {trip.origin} <span className="text-slate-400">to</span> {trip.destination}
                      </span>
                      <span className="text-sm text-slate-500">
                        {tp.status === 'completed'
                          ? `Delivered ${formatDateTime(tp.lastUpdate)}`
                          : `Pickup ${formatDateTime(trip.scheduledPickup)}`}
                        {' · '}{tp.done}/{tp.total}
                      </span>
                    </div>
                    <div className="mt-2"><ProgressSegments trip={trip} /></div>
                  </summary>
                  <div className="mt-5 space-y-5">
                    <TripMeta trip={trip} />
                    <CheckpointTimeline trip={trip} />
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
