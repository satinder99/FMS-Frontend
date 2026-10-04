// [FRONTEND · React] src/pages/dispatcher/DispatcherDriverPage.tsx
// One driver: every trip with each step's start/end time. A dispatcher can correct a step's times (one free
// edit per step; more only while an admin-approved window is open) and can ask an admin for that approval.
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import CheckpointTimeline, { ProgressSegments } from '../../components/trips/CheckpointTimeline';
import DispatcherStepActions from '../../components/trips/DispatcherStepActions';
import StepDocuments from '../../components/trips/StepDocuments';
import TripDocumentsBar from '../../components/trips/TripDocumentsBar';
import EditAccessPanel from '../../components/trips/EditAccessPanel';
import TripMeta from '../../components/trips/TripMeta';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi } from '../../lib/fleetApi';
import { formatDateTime, timeAgo } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import type { EditRequestContext } from '../../types/trips';

export default function DispatcherDriverPage() {
  const { driverId } = useParams();
  const fetcher = useCallback(() => dispatcherApi.getDriver(Number(driverId)), [driverId]);
  const { data, error, loading, reload } = useApiData(fetcher, 15_000);
  const [requestContext, setRequestContext] = useState<EditRequestContext | null>(null);

  const driver = data?.driver;
  const trips = data?.trips ?? [];
  const access = data?.editAccess;
  const active = trips.find((t) => t.status === 'in_progress') ?? trips.find((t) => t.status === 'assigned');
  const others = trips.filter((t) => t.id !== active?.id);
  const p = active ? getTripProgress(active) : null;

  function handleRequestAccess(context: EditRequestContext) {
    setRequestContext(context);
    // bring the request form into view
    window.setTimeout(() => {
      const box = document.getElementById('edit-request-reason');
      box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      box?.focus();
    }, 60);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dispatcher" className="text-sm text-sky-700 underline-offset-2 hover:underline">
          ← All drivers
        </Link>
        {driver && (
          <>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{driver.name}</h1>
            <p className="text-sm text-slate-600">
              {driver.phone ?? 'No phone on file'} ·{' '}
              <Link to={`/dispatcher/drivers/${driver.id}/pay`} className="text-sky-700 underline-offset-2 hover:underline">
                Pay rates
              </Link>
            </p>
          </>
        )}
      </div>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
        {access && (
          <EditAccessPanel
            access={access}
            requestContext={requestContext}
            onClearContext={() => setRequestContext(null)}
            onChanged={reload}
          />
        )}

        {!active || !p || !access ? (
          <p className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No active ride for this driver.
          </p>
        ) : (
          <section aria-labelledby="active-ride" className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="active-ride" className="text-lg font-semibold">
                Current ride <span className="font-normal text-slate-500">{active.reference}</span>
              </h2>
              <p className="text-sm text-slate-600">
                {p.current
                  ? p.current.status === 'in_progress'
                    ? <>Now: <span className="font-medium text-slate-900">{p.current.label}</span> (in progress)</>
                    : <>Next: <span className="font-medium text-slate-900">{p.current.label}</span></>
                  : 'Trip complete'}
                {p.lastUpdate && <> · updated {timeAgo(p.lastUpdate)}</>}
              </p>
            </div>

            <TripMeta trip={active} />
            <div className="mt-4"><TripDocumentsBar trip={active} /></div>
            <div className="my-5"><ProgressSegments trip={active} /></div>
            <CheckpointTimeline
              trip={active}
              renderActions={(cp) => (
                <div className="space-y-2">
                  <StepDocuments trip={active} cp={cp} canDownload />
                  <DispatcherStepActions trip={active} cp={cp} access={access} onChanged={reload} onRequestAccess={handleRequestAccess} />
                </div>
              )}
            />
          </section>
        )}

        {others.length > 0 && access && (
          <section aria-labelledby="other-rides" className="mt-8">
            <h2 id="other-rides" className="mb-3 text-lg font-semibold">Other rides</h2>
            <div className="space-y-3">
              {others.map((trip) => {
                const tp = getTripProgress(trip);
                return (
                  <details key={trip.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium">
                          {trip.reference} · {trip.origin} <span className="text-slate-400">to</span> {trip.destination}
                        </span>
                        <span className="text-sm text-slate-500">
                          {tp.status === 'completed'
                            ? `Delivered ${formatDateTime(tp.lastDone?.completedAt ?? null)}`
                            : `Pickup ${formatDateTime(trip.scheduledPickup)}`}
                          {' · '}{tp.done}/{tp.total}
                        </span>
                      </div>
                      <div className="mt-2"><ProgressSegments trip={trip} /></div>
                    </summary>
                    <div className="mt-5 space-y-5">
                      <TripMeta trip={trip} />
                      <TripDocumentsBar trip={trip} />
                      <CheckpointTimeline
                        trip={trip}
                        renderActions={(cp) => (
                          <div className="space-y-2">
                            <StepDocuments trip={trip} cp={cp} canDownload />
                            <DispatcherStepActions trip={trip} cp={cp} access={access} onChanged={reload} onRequestAccess={handleRequestAccess} />
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
