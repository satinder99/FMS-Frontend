// [FRONTEND · React] src/components/trips/CheckpointTimeline.tsx
// Every step of a trip with its START and END time. Read-only by itself; pass `renderActions` to add
// buttons under a step (the driver's undo/edit, the dispatcher's edit). Used by driver, dispatcher and admin.
import type { ReactNode } from 'react';
import { formatDateTime, formatDuration } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import type { Checkpoint, Trip } from '../../types/trips';

/** Thin segmented bar: one segment per step (green = done, amber = in progress). */
export function ProgressSegments({ trip }: { trip: Trip }) {
  const { done, total } = getTripProgress(trip);
  return (
    <div role="img" aria-label={`${done} of ${total} steps completed`} className="flex gap-1">
      {trip.checkpoints.map((c) => (
        <span
          key={c.key}
          title={c.label}
          className={`h-2 flex-1 rounded-full ${
            c.status === 'completed' ? 'bg-emerald-500' : c.status === 'in_progress' ? 'bg-amber-400' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

interface Props {
  trip: Trip;
  renderActions?: (cp: Checkpoint) => ReactNode;
}

export default function CheckpointTimeline({ trip, renderActions }: Props) {
  const { done, total } = getTripProgress(trip);
  const steps = trip.checkpoints;

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{done}</span> of {total} steps done
        {done < total && <span> · {total - done} left</span>}
      </p>

      <ol>
        {steps.map((c, i) => {
          const isLast = i === steps.length - 1;
          const took = formatDuration(c.startedAt, c.completedAt);
          return (
            <li key={c.key} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 ${
                    c.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              <span
                aria-hidden
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  c.status === 'completed'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : c.status === 'in_progress'
                      ? 'border-amber-400 bg-amber-50 text-amber-700 ring-4 ring-amber-100'
                      : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {c.status === 'completed' ? '✓' : i + 1}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className={`font-medium ${c.status === 'pending' ? 'text-slate-500' : 'text-slate-900'}`}>
                    {c.label}
                    {c.key === 'immigration' && <span className="ml-2 text-xs font-normal text-slate-500">cross-border</span>}
                  </p>
                  {c.status === 'in_progress' && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">In progress</span>
                  )}
                  {c.dispatcherEdited ? (
                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-800">
                      Adjusted by dispatcher
                    </span>
                  ) : c.timeEditCount > 0 ? (
                    <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-800">Edited</span>
                  ) : null}
                </div>

                {c.status === 'pending' ? (
                  <p className="text-sm text-slate-500">Not started</p>
                ) : (
                  <dl className="mt-1 grid max-w-md grid-cols-2 gap-x-4 text-sm">
                    <div>
                      <dt className="text-slate-500">Start</dt>
                      <dd className="tabular-nums">{formatDateTime(c.startedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">End</dt>
                      <dd className="tabular-nums">{c.completedAt ? formatDateTime(c.completedAt) : 'Not finished'}</dd>
                    </div>
                    {took && (
                      <div className="col-span-2 mt-0.5 text-slate-500">
                        Took <span className="tabular-nums">{took}</span>
                      </div>
                    )}
                  </dl>
                )}

                {renderActions && <div className="mt-2">{renderActions(c)}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
