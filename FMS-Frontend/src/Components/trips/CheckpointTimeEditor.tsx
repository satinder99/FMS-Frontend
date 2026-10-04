// [FRONTEND · React] src/components/trips/CheckpointTimeEditor.tsx
// Small form to change a step's start and/or end time. Only the times that were actually changed are sent,
// so untouched seconds are never rewritten. Dispatchers must also give a reason (it goes in the audit log).
import { useId, useState } from 'react';
import { fromLocalInput, toLocalInput } from '../../lib/format';
import type { StepTimesPayload } from '../../types/trips';

interface Props {
  startedAt: string | null;
  completedAt: string | null;
  /** Dispatcher edits require a reason */
  askReason: boolean;
  busy: boolean;
  error: string | null;
  onSave: (payload: StepTimesPayload) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function CheckpointTimeEditor({ startedAt, completedAt, askReason, busy, error, onSave, onCancel }: Props) {
  const id = useId();
  const [start, setStart] = useState(startedAt ? toLocalInput(startedAt) : '');
  const [end, setEnd] = useState(completedAt ? toLocalInput(completedAt) : '');
  const [reason, setReason] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  function submit() {
    const payload: StepTimesPayload = {};
    if (startedAt && start && start !== toLocalInput(startedAt)) payload.startedAt = fromLocalInput(start);
    if (completedAt && end && end !== toLocalInput(completedAt)) payload.completedAt = fromLocalInput(end);
    if (!payload.startedAt && !payload.completedAt) return setProblem('Change at least one time first.');

    const newStart = payload.startedAt ?? startedAt;
    const newEnd = payload.completedAt ?? completedAt;
    if (newStart && newEnd && new Date(newEnd) < new Date(newStart)) return setProblem('The end time must be after the start time.');
    if (askReason) {
      if (reason.trim().length < 5) return setProblem('Say why the times are being changed (at least 5 characters).');
      payload.reason = reason.trim();
    }
    setProblem(null);
    onSave(payload);
  }

  const shown = problem ?? error;

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-start`} className="mb-1 block text-sm font-medium">Start</label>
          <input id={`${id}-start`} type="datetime-local" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        {completedAt && (
          <div>
            <label htmlFor={`${id}-end`} className="mb-1 block text-sm font-medium">End</label>
            <input id={`${id}-end`} type="datetime-local" className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        )}
      </div>

      {askReason && (
        <div>
          <label htmlFor={`${id}-reason`} className="mb-1 block text-sm font-medium">
            Reason <span className="font-semibold text-red-700">(required)</span>
          </label>
          <textarea
            id={`${id}-reason`}
            rows={2}
            maxLength={300}
            className={inputClass}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Driver app was down; confirmed the real time by phone"
          />
        </div>
      )}

      {shown && <p role="alert" className="text-sm text-red-700">{shown}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {busy ? 'Saving…' : 'Save times'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-white">
          Cancel
        </button>
      </div>
    </div>
  );
}
