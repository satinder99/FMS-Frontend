// [FRONTEND · React] src/components/trips/TripMeta.tsx   (YOUR EXISTING FILE: + a small Outbound/Inbound label)
import { DIRECTION_LABEL, DIRECTION_ROUTE } from '../../lib/rides';
import type { Trip } from '../../types/trips';

/** Route + truck + trailer facts for a trip. */
export default function TripMeta({ trip }: { trip: Trip }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
      <div className="col-span-2">
        <dt className="text-slate-500">Route</dt>
        <dd className="font-medium">
          {trip.origin} <span className="text-slate-400">to</span> {trip.destination}
          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
            {DIRECTION_LABEL[trip.direction]} · {DIRECTION_ROUTE[trip.direction]}
          </span>
          {trip.crossBorder && (
            <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-800">
              Cross-border
            </span>
          )}
        </dd>
      </div>
      <div>
        <dt className="text-slate-500">Truck</dt>
        <dd className="font-medium tabular-nums">{trip.truckNumber}</dd>
      </div>
      <div>
        <dt className="text-slate-500">Trailer</dt>
        <dd className="font-medium tabular-nums">{trip.trailerNumber}</dd>
      </div>
    </dl>
  );
}
