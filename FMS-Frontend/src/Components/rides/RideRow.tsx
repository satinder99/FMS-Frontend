// [FRONTEND · React] src/components/rides/RideRow.tsx
// One row of the Active rides board: "Outbound  P — B — D  ✓". Click anywhere on the row to open that ride's
// detail page (every step's start/end time + document downloads). The cancel button sits beside the link, not inside it.
import { Link } from 'react-router';
import { formatDateTime } from '../../lib/format';
import { DIRECTION_LABEL, DIRECTION_ROUTE, cancelledByLabel } from '../../lib/rides';
import { getTripProgress } from '../../lib/tripProgress';
import type { Direction, Trip } from '../../types/trips';
import CancelLegControl from './CancelLegControl';
import StageDots from './StageDots';

interface Props {
  direction: Direction;
  trip: Trip | null;
  /** For the inbound row: the outbound ride of the same order (inbound starts after it) */
  outbound?: Trip | null;
  onChanged: () => void | Promise<void>;
}

function Tick() {
  return (
    <span
      role="img"
      aria-label="Completed"
      className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function statusText(trip: Trip, outbound: Trip | null | undefined): string {
  if (trip.status === 'cancelled') {
    return `Cancelled by ${cancelledByLabel(trip)}${trip.cancelReason ? ` · ${trip.cancelReason}` : ''}`;
  }
  const p = getTripProgress(trip);
  if (trip.status === 'completed') return `Delivered ${formatDateTime(p.lastDone?.completedAt ?? null)}`;
  if (trip.acceptance === 'pending') return 'Waiting for the driver to accept';
  if (trip.direction === 'inbound' && trip.status === 'assigned' && outbound && outbound.status !== 'completed' && outbound.status !== 'cancelled') {
    return `Starts after the outbound ride · pickup ${formatDateTime(trip.scheduledPickup)}`;
  }
  if (!p.current) return '';
  return p.current.status === 'in_progress' ? `Now: ${p.current.label}` : `Next: ${p.current.label} · pickup ${formatDateTime(trip.scheduledPickup)}`;
}

export default function RideRow({ direction, trip, outbound, onChanged }: Props) {
  const title = (
    <div className="w-24 shrink-0">
      <p className="font-medium">{DIRECTION_LABEL[direction]}</p>
      <p className="text-xs text-slate-500">{DIRECTION_ROUTE[direction]}</p>
    </div>
  );

  if (!trip) {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-dashed border-slate-200 p-3 text-slate-400">
        {title}
        <StageDots stages={{ P: 'disabled', B: 'disabled', D: 'disabled', current: null }} muted />
        <p className="text-sm">No {DIRECTION_LABEL[direction].toLowerCase()} ride planned</p>
      </div>
    );
  }

  const cancelled = trip.status === 'cancelled';
  return (
    <div className={`flex flex-wrap items-center rounded-lg border ${cancelled ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'}`}>
      <Link
        to={`/dispatcher/rides/${trip.id}`}
        aria-label={`${DIRECTION_LABEL[direction]} ride ${trip.reference}: open details`}
        className="flex min-w-[20rem] flex-1 items-center gap-4 rounded-lg p-3 hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        {title}
        <StageDots stages={trip.stages} muted={cancelled} />
        <p className={`min-w-0 flex-1 text-sm ${cancelled ? 'text-slate-500' : 'text-slate-600'}`}>{statusText(trip, outbound)}</p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center">{trip.status === 'completed' && <Tick />}</span>
      </Link>
      <div className="px-3 pb-3 sm:pb-0">
        <CancelLegControl trip={trip} onCancelled={onChanged} />
      </div>
    </div>
  );
}
