// [FRONTEND · React] src/components/trips/DispatcherStepActions.tsx
// A dispatcher's way to correct a step's times. Each step gets ONE free edit, with no time limit. For more,
// the organization needs an admin-approved window (see EditAccessPanel). The server enforces all of this;
// this component only shows the right button.
import { useState } from 'react';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';
import { formatMinutesLeft } from '../../lib/format';
import type { Checkpoint, EditAccessState, EditRequestContext, StepTimesPayload, Trip } from '../../types/trips';
import CheckpointTimeEditor from './CheckpointTimeEditor';

interface Props {
  trip: Trip;
  cp: Checkpoint;
  access: EditAccessState;
  onChanged: () => Promise<void> | void;
  onRequestAccess: (context: EditRequestContext) => void;
}

const secondary =
  'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function DispatcherStepActions({ trip, cp, access, onChanged, onRequestAccess }: Props) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cp.status === 'pending') return null;

  const windowOpen = access.window !== null;
  const canEdit = windowOpen || !cp.freeEditUsed;

  async function save(payload: StepTimesPayload) {
    setBusy(true);
    setError(null);
    try {
      await dispatcherApi.editStepTimes(trip.id, cp.key, payload);
      setEditing(false);
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <CheckpointTimeEditor
        startedAt={cp.startedAt}
        completedAt={cp.completedAt}
        askReason
        busy={busy}
        error={error}
        onCancel={() => setEditing(false)}
        onSave={(payload) => void save(payload)}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {canEdit ? (
        <>
          <button type="button" className={secondary} onClick={() => setEditing(true)}>Edit times</button>
          <span className="text-xs text-slate-500">
            {access.window
              ? `Approved by an admin · ${formatMinutesLeft(access.window.remainingSeconds)} left`
              : 'Uses this step’s one free edit'}
          </span>
        </>
      ) : access.pending ? (
        <span className="text-sm text-amber-800">Free edit used. Waiting for an admin to approve more edits.</span>
      ) : (
        <>
          <span className="text-sm text-slate-600">Free edit used.</span>
          <button
            type="button"
            className={secondary}
            onClick={() => onRequestAccess({ tripId: trip.id, checkpointKey: cp.key, tripReference: trip.reference, label: cp.label })}
          >
            Request admin approval
          </button>
        </>
      )}
      {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
    </div>
  );
}
