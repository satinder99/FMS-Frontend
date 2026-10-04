// [FRONTEND · React] src/components/trips/DriverStepActions.tsx
// What a DRIVER can do to a step they already recorded: undo it, or correct its times. Only possible for a
// short window after recording it (the server decides; this just shows the time left) and never once a
// dispatcher has adjusted the step.
import { useState } from 'react';
import { driverApi, errorMessage } from '../../lib/fleetApi';
import { formatMinutesLeft } from '../../lib/format';
import type { Checkpoint, StepTimesPayload, Trip } from '../../types/trips';
import CheckpointTimeEditor from './CheckpointTimeEditor';

interface Props {
  trip: Trip;
  cp: Checkpoint;
  onChanged: () => Promise<void> | void;
  /** Show "locked" text when the window is over (hide it in long lists) */
  showLockedNote?: boolean;
}

const secondary =
  'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function DriverStepActions({ trip, cp, onChanged, showLockedNote = true }: Props) {
  const [mode, setMode] = useState<'idle' | 'confirm' | 'editing'>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setMode('idle');
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (cp.status === 'pending') return null;

  const seconds = cp.driverEditableSeconds;
  const open = !cp.dispatcherEdited && seconds !== null && seconds > 0;

  if (!open) {
    if (!showLockedNote) return null;
    return (
      <p className="text-sm text-slate-500">
        {cp.dispatcherEdited
          ? 'A dispatcher adjusted this step, so it is locked.'
          : 'Locked. Steps can only be changed for 30 minutes after you record them. Ask your dispatcher if this needs fixing.'}
      </p>
    );
  }

  const index = trip.checkpoints.findIndex((c) => c.key === cp.key);
  const laterStarted = trip.checkpoints.slice(index + 1).some((c) => c.status !== 'pending');
  const completed = cp.status === 'completed';

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">You can still change this step for {formatMinutesLeft(seconds ?? 0)}.</p>

      {mode === 'editing' ? (
        <CheckpointTimeEditor
          startedAt={cp.startedAt}
          completedAt={cp.completedAt}
          askReason={false}
          busy={busy}
          error={error}
          onCancel={() => setMode('idle')}
          onSave={(payload: StepTimesPayload) => void run(() => driverApi.editStepTimes(trip.id, cp.key, payload))}
        />
      ) : mode === 'confirm' ? (
        <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          <p>
            {completed ? 'This step goes back to “in progress”.' : 'This step goes back to “not started”.'}
            {laterStarted && ' Every step after it is reset to “not started” too.'}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => void run(() => driverApi.undoStep(trip.id, cp.key))} className={secondary}>
              {busy ? 'Undoing…' : 'Yes, undo'}
            </button>
            <button type="button" onClick={() => setMode('idle')} className={secondary}>Keep it</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMode('confirm')} className={secondary}>
            {completed ? 'Undo completion' : 'Undo start'}
          </button>
          <button type="button" onClick={() => setMode('editing')} className={secondary}>
            {completed ? 'Change times' : 'Change start time'}
          </button>
        </div>
      )}

      {mode !== 'editing' && error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
