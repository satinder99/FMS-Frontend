// [FRONTEND · React] src/pages/dispatcher/NewTripPage.tsx   (now the "New order" form: one driver/truck/trailer + an outbound ride, an inbound ride, or both)
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';
import { DIRECTION_LABEL, DIRECTION_ROUTE } from '../../lib/rides';
import type { Direction, NewLegPayload } from '../../types/trips';

const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

interface LegForm {
  enabled: boolean;
  origin: string;
  destination: string;
  pickup: string; // datetime-local value
  crossBorder: boolean;
}

const emptyLeg = (enabled: boolean): LegForm => ({ enabled, origin: '', destination: '', pickup: '', crossBorder: true });

interface LegProps {
  direction: Direction;
  value: LegForm;
  onChange: (next: LegForm) => void;
  placeholders: [string, string];
}

function LegFields({ direction, value, onChange, placeholders }: LegProps) {
  const id = `leg-${direction}`;
  const set = (patch: Partial<LegForm>) => onChange({ ...value, ...patch });
  return (
    <fieldset className="space-y-4 rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold">
        {DIRECTION_LABEL[direction]} <span className="font-normal text-slate-500">({DIRECTION_ROUTE[direction]})</span>
      </legend>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
        Include an {direction} ride
      </label>

      {value.enabled && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-origin`} className="mb-1 block text-sm font-medium">From</label>
              <input id={`${id}-origin`} className={fieldClass} value={value.origin} onChange={(e) => set({ origin: e.target.value })} placeholder={placeholders[0]} />
            </div>
            <div>
              <label htmlFor={`${id}-destination`} className="mb-1 block text-sm font-medium">To</label>
              <input id={`${id}-destination`} className={fieldClass} value={value.destination} onChange={(e) => set({ destination: e.target.value })} placeholder={placeholders[1]} />
            </div>
          </div>
          <div>
            <label htmlFor={`${id}-pickup`} className="mb-1 block text-sm font-medium">Pickup date and time</label>
            <input id={`${id}-pickup`} type="datetime-local" className={fieldClass} value={value.pickup} onChange={(e) => set({ pickup: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.crossBorder} onChange={(e) => set({ crossBorder: e.target.checked })} />
            Crosses the border (adds the border step; untick for a ride with no border, shown grey on the board)
          </label>
        </>
      )}
    </fieldset>
  );
}

const toLeg = (direction: Direction, f: LegForm): NewLegPayload => ({
  direction,
  origin: f.origin.trim(),
  destination: f.destination.trim(),
  scheduledPickup: new Date(f.pickup).toISOString(),
  crossBorder: f.crossBorder,
});

export default function NewTripPage() {
  const navigate = useNavigate();
  const { data: res, error, loading, reload } = useApiData(dispatcherApi.getResources);

  const [driverId, setDriverId] = useState('');
  const [truckId, setTruckId] = useState('');
  const [trailerId, setTrailerId] = useState('');
  const [outbound, setOutbound] = useState<LegForm>(emptyLeg(true));
  const [inbound, setInbound] = useState<LegForm>(emptyLeg(false));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const legs: { direction: Direction; form: LegForm }[] = [
      { direction: 'outbound' as const, form: outbound },
      { direction: 'inbound' as const, form: inbound },
    ].filter((l) => l.form.enabled);

    if (!driverId || !truckId || !trailerId) {
      setFormError('Choose a driver, a truck and a trailer.');
      return;
    }
    if (legs.length === 0) {
      setFormError('Include an outbound ride, an inbound ride, or both.');
      return;
    }
    if (legs.some((l) => !l.form.origin.trim() || !l.form.destination.trim() || !l.form.pickup)) {
      setFormError('Fill in from, to and pickup time for every ride you included.');
      return;
    }
    if (outbound.enabled && inbound.enabled && new Date(inbound.pickup) <= new Date(outbound.pickup)) {
      setFormError('The inbound pickup must be after the outbound pickup.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await dispatcherApi.createOrder({
        driverId: Number(driverId),
        truckId: Number(truckId),
        trailerId: Number(trailerId),
        legs: legs.map((l) => toLeg(l.direction, l.form)),
      });
      navigate('/dispatcher/rides');
    } catch (err) {
      setFormError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New order</h1>
        <p className="text-sm text-slate-600">
          Assign a driver, truck and trailer, then add the outbound ride (Canada → US), the inbound ride (US → Canada), or both.
          The driver first sees only the route, truck, trailer and date, and must accept before the steps appear. The pay rate
          is chosen from whose equipment they’ll run; if none is set for that mix, you’ll be asked to add one first.
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

            <LegFields direction="outbound" value={outbound} onChange={setOutbound} placeholders={['Brampton, ON', 'Chicago, IL']} />
            <LegFields direction="inbound" value={inbound} onChange={setInbound} placeholders={['Chicago, IL', 'Brampton, ON']} />

            {formError && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              {saving ? 'Sending…' : 'Send to driver'}
            </button>
          </form>
        )}
      </AsyncState>
    </div>
  );
}
