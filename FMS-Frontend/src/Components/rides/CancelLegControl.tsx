// [FRONTEND · React] src/components/rides/CancelLegControl.tsx
// "Cancel outbound" / "Cancel inbound": cancels ONE ride of an order on its own. Asks first (with an optional reason).
import { useState } from 'react';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';
import { DIRECTION_LABEL, canCancel } from '../../lib/rides';
import type { Trip } from '../../types/trips';

interface Props {
  trip: Pick<Trip, 'id' | 'direction' | 'status' | 'reference'>;
  onCancelled: () => void | Promise<void>;
}

export default function CancelLegControl({ trip, onCancelled }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canCancel(trip)) return null;
  const label = DIRECTION_LABEL[trip.direction].toLowerCase();

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await dispatcherApi.cancelRide(trip.id, reason.trim() || undefined);
      setOpen(false);
      setReason('');
      await onCancelled();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        Cancel {label}
      </button>
    );
  }

  return (
    <div role="group" aria-label={`Cancel ${label} ride`} className="w-full max-w-sm space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
      <p className="font-medium text-red-900">
        Cancel the {label} ride {trip.reference}? The other ride of this order is not affected.
      </p>
      <label className="block">
        <span className="sr-only">Reason (optional)</span>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          placeholder="Reason (optional)"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        />
      </label>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void confirm()}
          className="rounded-md bg-red-700 px-3 py-1.5 font-medium text-white hover:bg-red-800 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          {busy ? 'Cancelling…' : `Yes, cancel ${label}`}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => { setOpen(false); setError(null); }}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Keep it
        </button>
      </div>
    </div>
  );
}
