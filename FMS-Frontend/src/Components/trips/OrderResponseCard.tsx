// [FRONTEND · React] src/components/trips/OrderResponseCard.tsx
// What a driver sees for a NEW order: only the top details (route, truck and trailer, ride date) and two buttons,
// Accept and Deny. The checkpoint steps appear only after Accept. Deny removes the ride and tells the dispatcher.
import { useState } from 'react';
import { driverApi, errorMessage } from '../../lib/fleetApi';
import { formatDateTime } from '../../lib/format';
import type { Trip } from '../../types/trips';
import TripMeta from './TripMeta';

interface Props {
  /** The rides of ONE order that are waiting for an answer (an outbound ride, an inbound ride, or both) */
  trips: Trip[];
  onAnswered: () => void | Promise<void>;
}

export default function OrderResponseCard({ trips, onAnswered }: Props) {
  const orderId = trips[0].orderId;
  const [denying, setDenying] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<'accept' | 'deny' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function answer(kind: 'accept' | 'deny') {
    setBusy(kind);
    setError(null);
    try {
      if (kind === 'accept') await driverApi.acceptOrder(orderId);
      else await driverApi.denyOrder(orderId, reason.trim() || undefined);
      await onAnswered();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  }

  return (
    <section aria-label="New ride waiting for your answer" className="rounded-xl border-2 border-amber-300 bg-amber-50/40 p-5 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold">New ride for you</h2>
      <p className="mb-4 text-sm text-slate-600">Accept to see the steps. If you deny it, it disappears and your dispatcher is told.</p>

      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <TripMeta trip={trip} />
            <p className="mt-3 text-sm text-slate-600">
              Ride date <span className="font-medium text-slate-900">{formatDateTime(trip.scheduledPickup)}</span>
            </p>
          </div>
        ))}
      </div>

      {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      {!denying ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void answer('accept')}
            className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {busy === 'accept' ? 'Accepting…' : 'Accept'}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => setDenying(true)}
            className="rounded-md border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            Deny
          </button>
        </div>
      ) : (
        <div className="mt-5 max-w-md space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
          <p className="font-medium text-red-900">Deny this ride?</p>
          <label className="block">
            <span className="mb-1 block text-slate-700">Reason for your dispatcher (optional)</span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={300}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void answer('deny')}
              className="rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              {busy === 'deny' ? 'Denying…' : 'Yes, deny it'}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => setDenying(false)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Go back
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
