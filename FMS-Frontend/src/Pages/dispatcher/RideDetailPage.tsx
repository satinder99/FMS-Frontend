// [FRONTEND · React] src/pages/dispatcher/RideDetailPage.tsx
// One ride (the outbound or the inbound part of an order): every step with its start/end time, document downloads
// (POD, BOL, immigration, ...), the dispatcher's time edits, and cancelling this ride.
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import Avatar from '../../components/common/Avatar';
import CancelLegControl from '../../components/rides/CancelLegControl';
import StageDots from '../../components/rides/StageDots';
import CheckpointTimeline, { ProgressSegments } from '../../components/trips/CheckpointTimeline';
import DispatcherStepActions from '../../components/trips/DispatcherStepActions';
import EditAccessPanel from '../../components/trips/EditAccessPanel';
import StepDocuments from '../../components/trips/StepDocuments';
import TripDocumentsBar from '../../components/trips/TripDocumentsBar';
import TripMeta from '../../components/trips/TripMeta';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi } from '../../lib/fleetApi';
import { formatDateTime } from '../../lib/format';
import { DIRECTION_LABEL, DIRECTION_ROUTE, cancelledByLabel } from '../../lib/rides';
import type { EditRequestContext } from '../../types/trips';

const STATUS_LABEL = { assigned: 'Assigned', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled' } as const;

export default function RideDetailPage() {
  const { tripId } = useParams();
  const fetcher = useCallback(() => dispatcherApi.getRide(Number(tripId)), [tripId]);
  const { data, error, loading, reload } = useApiData(fetcher, 15_000);
  const [requestContext, setRequestContext] = useState<EditRequestContext | null>(null);

  const trip = data?.trip;
  const cancelled = trip?.status === 'cancelled';
  const waiting = trip?.acceptance === 'pending' && !cancelled;
  const other = data?.legs.find((l) => l.id !== trip?.id);

  function handleRequestAccess(context: EditRequestContext) {
    setRequestContext(context);
    window.setTimeout(() => {
      const box = document.getElementById('edit-request-reason');
      box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      box?.focus();
    }, 60);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dispatcher/rides" className="text-sm text-sky-700 underline-offset-2 hover:underline">
          ← Active rides
        </Link>
      </div>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
        {trip && data && (
          <>
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {DIRECTION_LABEL[trip.direction]} ride <span className="font-normal text-slate-500">{trip.reference}</span>
                </h1>
                <p className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span>{DIRECTION_ROUTE[trip.direction]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">{STATUS_LABEL[trip.status]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-2">
                    <Avatar name={trip.driverName} photoUrl={trip.driverPhotoUrl} size="sm" />
                    <Link to={`/dispatcher/drivers/${trip.driverId}`} className="text-sky-700 underline-offset-2 hover:underline">
                      {trip.driverName}
                    </Link>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Order {trip.orderReference}</span>
                </p>
                {other && (
                  <p className="text-sm">
                    Other part of this order:{' '}
                    <Link to={`/dispatcher/rides/${other.id}`} className="text-sky-700 underline-offset-2 hover:underline">
                      {DIRECTION_LABEL[other.direction]} {other.reference} ({STATUS_LABEL[other.status]})
                    </Link>
                  </p>
                )}
              </div>
              <CancelLegControl trip={trip} onCancelled={reload} />
            </header>

            {cancelled && (
              <p role="status" className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-800">
                This ride was cancelled by {cancelledByLabel(trip)}
                {trip.cancelledAt && <> on {formatDateTime(trip.cancelledAt)}</>}
                {trip.cancelReason ? <>: “{trip.cancelReason}”</> : '.'}
              </p>
            )}
            {waiting && (
              <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {trip.driverName} has not accepted this order yet. Steps can start only after the driver accepts.
              </p>
            )}

            <EditAccessPanel
              access={data.editAccess}
              requestContext={requestContext}
              onClearContext={() => setRequestContext(null)}
              onChanged={reload}
            />

            <section aria-label="Ride details" className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <TripMeta trip={trip} />
                <StageDots stages={trip.stages} muted={cancelled} />
              </div>
              <p className="text-sm text-slate-600">Pickup {formatDateTime(trip.scheduledPickup)}</p>
              <TripDocumentsBar trip={trip} />
              <ProgressSegments trip={trip} />
              <CheckpointTimeline
                trip={trip}
                renderActions={(cp) => (
                  <div className="space-y-2">
                    <StepDocuments trip={trip} cp={cp} canDownload />
                    {!cancelled && !waiting && (
                      <DispatcherStepActions trip={trip} cp={cp} access={data.editAccess} onChanged={reload} onRequestAccess={handleRequestAccess} />
                    )}
                  </div>
                )}
              />
            </section>
          </>
        )}
      </AsyncState>
    </div>
  );
}
