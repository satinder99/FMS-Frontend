// [FRONTEND · React] src/pages/dispatcher/NewTripPage.tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';

const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function NewTripPage() {
  const navigate = useNavigate();
  const { data: res, error, loading, reload } = useApiData(dispatcherApi.getResources);

  const [driverId, setDriverId] = useState('');
  const [truckId, setTruckId] = useState('');
  const [trailerId, setTrailerId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pickup, setPickup] = useState('');
  const [crossBorder, setCrossBorder] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!driverId || !truckId || !trailerId || !origin.trim() || !destination.trim() || !pickup) {
      setFormError('Fill in every field before assigning the trip.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await dispatcherApi.createTrip({
        driverId: Number(driverId),
        truckId: Number(truckId),
        trailerId: Number(trailerId),
        origin: origin.trim(),
        destination: destination.trim(),
        scheduledPickup: new Date(pickup).toISOString(),
        crossBorder,
      });
      navigate(`/dispatcher/drivers/${driverId}`);
    } catch (err) {
      setFormError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New trip</h1>
        <p className="text-sm text-slate-600">
          Create the ride and assign it to a driver, truck and trailer. The driver’s pay rate is chosen from whose
          equipment they’ll be running; if none is set for that mix, you’ll be asked to add one first.
        </p>
      </div>

      <AsyncState loading={loading} error={error} hasData={!!res} onRetry={() => void reload()}>
        {res && (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <label htmlFor="driver" className="mb-1 block text-sm font-medium">Driver</label>
              <select id="driver" className={fieldClass} value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                <option value="">Select a driver…</option>
                {res.drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="truck" className="mb-1 block text-sm font-medium">Truck</label>
                <select id="truck" className={fieldClass} value={truckId} onChange={(e) => setTruckId(e.target.value)}>
                  <option value="">Select a truck…</option>
                  {res.trucks.map((t) => (
                    <option key={t.id} value={t.id}>{t.unitNumber}{t.ownership === 'owner_operator' ? ' (owner-operator)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="trailer" className="mb-1 block text-sm font-medium">Trailer</label>
                <select id="trailer" className={fieldClass} value={trailerId} onChange={(e) => setTrailerId(e.target.value)}>
                  <option value="">Select a trailer…</option>
                  {res.trailers.map((t) => (
                    <option key={t.id} value={t.id}>{t.unitNumber}{t.ownership === 'owner_operator' ? ' (owner-operator)' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="origin" className="mb-1 block text-sm font-medium">Origin</label>
                <input id="origin" className={fieldClass} value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Brampton, ON" />
              </div>
              <div>
                <label htmlFor="destination" className="mb-1 block text-sm font-medium">Destination</label>
                <input id="destination" className={fieldClass} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Chicago, IL" />
              </div>
            </div>

            <div>
              <label htmlFor="pickup" className="mb-1 block text-sm font-medium">Pickup date and time</label>
              <input id="pickup" type="datetime-local" className={fieldClass} value={pickup} onChange={(e) => setPickup(e.target.value)} />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={crossBorder} onChange={(e) => setCrossBorder(e.target.checked)} />
              Cross-border trip (adds an immigration / customs checkpoint)
            </label>

            {formError && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              {saving ? 'Assigning…' : 'Assign trip'}
            </button>
          </form>
        )}
      </AsyncState>
    </div>
  );
}
