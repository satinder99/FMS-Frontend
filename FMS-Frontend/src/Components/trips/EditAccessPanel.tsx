// [FRONTEND · React] src/components/trips/EditAccessPanel.tsx
// Dispatcher-side summary of the organization's edit access, plus the form to ask an admin for more edits.
// States: window open (edit freely) / request waiting / nothing (one free edit per step; request more).
import { useState } from 'react';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';
import { formatDateTime, formatMinutesLeft } from '../../lib/format';
import type { EditAccessState, EditRequestContext } from '../../types/trips';

interface Props {
  access: EditAccessState;
  /** Set when a dispatcher clicked "Request admin approval" on a particular step */
  requestContext: EditRequestContext | null;
  onClearContext: () => void;
  onChanged: () => Promise<void> | void;
}

const button =
  'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function EditAccessPanel({ access, requestContext, onClearContext, onChanged }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (reason.trim().length < 10) return setError('Explain why you need more edits (at least 10 characters).');
    setBusy(true);
    setError(null);
    try {
      await dispatcherApi.requestEditAccess({
        reason: reason.trim(),
        ...(requestContext ? { tripId: requestContext.tripId, checkpointKey: requestContext.checkpointKey } : {}),
      });
      setReason('');
      setShowForm(false);
      onClearContext();
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: number) {
    setBusy(true);
    setError(null);
    try {
      await dispatcherApi.cancelEditRequest(id);
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (access.window) {
    return (
      <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm">
        <p className="font-semibold">An admin unlocked time edits for your organization</p>
        <p>
          You can change step times as often as needed for {formatMinutesLeft(access.window.remainingSeconds)} more
          (until {formatDateTime(access.window.expiresAt)}). Every change is logged.
        </p>
      </div>
    );
  }

  if (access.pending) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
        <p className="font-semibold">Waiting for an admin to approve more edits</p>
        <p className="mt-1">
          Asked by {access.pending.requestedByName ?? 'a dispatcher'} on {formatDateTime(access.pending.createdAt)}
          {access.pending.tripReference && ` about ${access.pending.tripReference} · ${access.pending.checkpointLabel ?? ''}`}:
          “{access.pending.reason}”
        </p>
        <button type="button" disabled={busy} className={`${button} mt-3`} onClick={() => void cancel(access.pending!.id)}>
          Cancel request
        </button>
        {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
      </div>
    );
  }

  const formOpen = showForm || requestContext !== null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
      <p className="text-slate-700">
        Each step can have its times corrected <span className="font-semibold">once</span> without approval. For more
        edits, ask an admin to open an editing window for your organization.
      </p>
      {access.lastDecision?.status === 'denied' && (
        <p className="mt-2 text-red-700">
          Your last request was denied{access.lastDecision.decisionNote ? `: ${access.lastDecision.decisionNote}` : '.'}
        </p>
      )}

      {formOpen ? (
        <div className="mt-3 space-y-2">
          {requestContext && (
            <p className="rounded-md bg-slate-100 px-3 py-2">
              About: <span className="font-medium">{requestContext.tripReference} · {requestContext.label}</span>{' '}
              <button type="button" className="ml-2 text-sky-700 underline" onClick={onClearContext}>
                remove
              </button>
            </p>
          )}
          <label htmlFor="edit-request-reason" className="block font-medium">
            Why do you need more edits? <span className="font-semibold text-red-700">(required)</span>
          </label>
          <textarea
            id="edit-request-reason"
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            placeholder="e.g. The tracking app was down all morning, so several drivers’ times need correcting."
          />
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button type="button" disabled={busy} className={`${button} bg-slate-900 !text-white hover:!bg-slate-700`} onClick={() => void send()}>
              {busy ? 'Sending…' : 'Send request'}
            </button>
            <button type="button" className={button} onClick={() => { setShowForm(false); onClearContext(); setError(null); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={`${button} mt-3`} onClick={() => setShowForm(true)}>
          Request admin approval for more edits
        </button>
      )}
    </div>
  );
}
