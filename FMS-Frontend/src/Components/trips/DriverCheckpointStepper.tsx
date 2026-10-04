// [FRONTEND · React] src/components/trips/DriverCheckpointStepper.tsx
// The driver's view of a ride: ONE step per page. Only the step they are on (and steps already done) can be
// seen; later steps are hidden, only their count is shown. Each step is started, then completed, in order.
import { useState } from 'react';
import { driverApi, errorMessage } from '../../lib/fleetApi';
import { POD_STEP_KEY } from '../../lib/documents';
import { formatDateTime } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import type { Trip } from '../../types/trips';
import DriverStepActions from './DriverStepActions';
import PodUploader from './PodUploader';

interface Props {
  trip: Trip;
  onChanged: () => Promise<void> | void;
}

const primary =
  'rounded-md bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900';
const nav =
  'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function DriverCheckpointStepper({ trip, onChanged }: Props) {
  const steps = trip.checkpoints;
  const progress = getTripProgress(trip);
  const currentIdx = progress.currentIndex === -1 ? steps.length - 1 : progress.currentIndex;

  // null = follow the step the driver is on; a number = they paged back to look at an earlier step
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shown = Math.min(viewIndex ?? currentIdx, currentIdx);
  const cp = steps[shown];
  const isCurrent = shown === currentIdx;
  // The proof-of-delivery step needs an uploaded file before it can be completed.
  const isPodStep = !!cp && cp.key === POD_STEP_KEY;
  const hasPod = trip.documents.some((d) => d.docType === 'pod');

  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setViewIndex(null);
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!cp) return null;

  return (
    <div className="space-y-5">
      {/* How far along, without naming the steps ahead */}
      <div>
        <p className="text-sm font-medium text-slate-700">
          Step {shown + 1} of {steps.length} <span className="font-normal text-slate-500">· {progress.done} done</span>
        </p>
        <div role="img" aria-label={`${progress.done} of ${steps.length} steps completed`} className="mt-2 flex gap-1.5">
          {steps.map((c, i) => (
            <span
              key={c.key}
              className={`h-2 flex-1 rounded-full ${
                c.status === 'completed' ? 'bg-emerald-500' : c.status === 'in_progress' ? 'bg-amber-400' : 'bg-slate-200'
              } ${i === shown ? 'ring-2 ring-slate-900 ring-offset-1' : ''}`}
            />
          ))}
        </div>
      </div>

      <section aria-labelledby="step-title" className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 id="step-title" className="text-xl font-semibold">{cp.label}</h3>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              cp.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : cp.status === 'in_progress'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
            }`}
          >
            {cp.status === 'completed' ? 'Completed' : cp.status === 'in_progress' ? 'In progress' : 'Not started'}
          </span>
        </div>

        {cp.status !== 'pending' && (
          <dl className="mt-3 grid max-w-sm grid-cols-2 gap-x-4 text-sm">
            <div>
              <dt className="text-slate-500">Started</dt>
              <dd className="tabular-nums">{formatDateTime(cp.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Finished</dt>
              <dd className="tabular-nums">{cp.completedAt ? formatDateTime(cp.completedAt) : '—'}</dd>
            </div>
          </dl>
        )}

        {error && <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <div className="mt-4 space-y-4">
          {isPodStep && cp.status !== 'pending' && <PodUploader trip={trip} step={cp} onChanged={onChanged} />}

          {isCurrent && cp.status === 'pending' && (
            <button type="button" disabled={busy} onClick={() => void act(() => driverApi.startStep(trip.id, cp.key))} className={primary}>
              {busy ? 'Saving…' : `Start “${cp.label}”`}
            </button>
          )}
          {isCurrent && cp.status === 'in_progress' && (
            <div className="space-y-2">
              <button
                type="button"
                disabled={busy || (isPodStep && !hasPod)}
                onClick={() => void act(() => driverApi.completeStep(trip.id, cp.key))}
                className={primary}
              >
                {busy ? 'Saving…' : `Mark “${cp.label}” complete`}
              </button>
              {isPodStep && !hasPod && <p className="text-sm text-slate-600">Upload the proof of delivery above to finish this step.</p>}
            </div>
          )}

          <DriverStepActions trip={trip} cp={cp} onChanged={onChanged} />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <button type="button" className={nav} disabled={shown === 0} onClick={() => setViewIndex(shown - 1)}>
          ← Previous step
        </button>
        <p className="hidden text-xs text-slate-500 sm:block">You can look back at steps you finished, not ahead.</p>
        <button type="button" className={nav} disabled={shown >= currentIdx} onClick={() => setViewIndex(shown + 1)}>
          Next step →
        </button>
      </div>
    </div>
  );
}
