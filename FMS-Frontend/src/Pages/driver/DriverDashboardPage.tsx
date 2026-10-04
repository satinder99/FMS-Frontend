// [FRONTEND · React] src/pages/driver/DriverDashboardPage.tsx
// The driver's trips. The current ride is shown ONE STEP PER PAGE (DriverCheckpointStepper). Finished
// trips can be expanded to see every step's start and end time.
import AsyncState from '../../components/common/AsyncState';
import CheckpointTimeline from '../../components/trips/CheckpointTimeline';
import DriverCheckpointStepper from '../../components/trips/DriverCheckpointStepper';
import DriverStepActions from '../../components/trips/DriverStepActions';
import StepDocuments from '../../components/trips/StepDocuments';
import TripMeta from '../../components/trips/TripMeta';
import { useApiData } from '../../hooks/useApiData';
import { driverApi } from '../../lib/fleetApi';
import { formatDateTime } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import { useAuthStore } from '../../store/authStore';

export default function DriverDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, error, loading, reload } = useApiData(driverApi.listTrips, 30_000);

  const trips = data ?? [];
  const active = trips.find((t) => t.status === 'in_progress') ?? trips.find((t) => t.status === 'assigned');
  const upcoming = trips.filter((t) => t.id !== active?.id && t.status !== 'completed');
  const completed = trips.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{user ? `Hi ${user.first_name}` : 'My trips'}</h1>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
        {!active ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No trips assigned to you right now. Your dispatcher will assign one soon.
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
            {/* key: start from the right step whenever the trip changes */}
            <DriverCheckpointStepper key={active.id} trip={active} onChanged={reload} />
          </section>
        )}

        {upcoming.length > 0 && (
          <section aria-labelledby="upcoming" className="mt-8">
            <h2 id="upcoming" className="mb-3 text-lg font-semibold">Upcoming trips</h2>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {upcoming.map((trip) => (
                <li key={trip.id} className="space-y-1 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium">
                      {trip.origin} <span className="text-slate-400">to</span> {trip.destination}
                    </p>
                    <p className="text-sm text-slate-500">Pickup {formatDateTime(trip.scheduledPickup)}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Truck <span className="tabular-nums">{trip.truckNumber}</span> · Trailer{' '}
                    <span className="tabular-nums">{trip.trailerNumber}</span> · {trip.checkpoints.length} steps
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {completed.length > 0 && (
          <section aria-labelledby="completed" className="mt-8">
            <h2 id="completed" className="mb-1 text-lg font-semibold">Completed trips (last 30 days)</h2>
            <p className="mb-3 text-sm text-slate-600">Select a trip to see when each step started and ended.</p>
            <div className="space-y-3">
              {completed.map((trip) => {
                const p = getTripProgress(trip);
                return (
                  <details key={trip.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">
                          {trip.reference} · {trip.origin} <span className="text-slate-400">to</span> {trip.destination}
                        </span>
                        <span className="text-sm text-slate-500">Delivered {formatDateTime(p.lastDone?.completedAt ?? null)}</span>
                      </div>
                    </summary>
                    <div className="mt-5 space-y-5">
                      <TripMeta trip={trip} />
                      {/* a step recorded in the last 30 minutes can still be undone or corrected from here */}
                      <CheckpointTimeline
                        trip={trip}
                        renderActions={(cp) => (
                          <div className="space-y-2">
                            <StepDocuments trip={trip} cp={cp} canDownload={false} />
                            <DriverStepActions trip={trip} cp={cp} onChanged={reload} showLockedNote={false} />
                          </div>
                        )}
                      />
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        )}
      </AsyncState>
    </div>
  );
}
