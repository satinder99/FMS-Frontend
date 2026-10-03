import { formatDateTime } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import type { Trip } from '../../types/trips';

/** Thin segmented bar: one segment per checkpoint. Good for lists. */
export function ProgressSegments({ trip }: { trip: Trip }) {
  const { done, total, nextIndex } = getTripProgress(trip);
  return (
    <div
      role="img"
      aria-label={`${done} of ${total} checkpoints completed`}
      className="flex gap-1"
    >
      {trip.checkpoints.map((c, i) => (
        <span
          key={c.key}
          title={c.label}
          className={`h-2 flex-1 rounded-full ${
            c.completedAt ? 'bg-emerald-500' : i === nextIndex ? 'bg-amber-400' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

/** Vertical checkpoint list with connector line, completion times, and an optional action. */
export default function CheckpointTimeline({
  trip,
  action,
}: {
  trip: Trip;
  /** Rendered under the next (current) checkpoint — e.g. the driver's "Mark done" button */
  action?: React.ReactNode;
}) {
  const { done, total, nextIndex } = getTripProgress(trip);

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{done}</span> of {total} checkpoints done
        {done < total && <span> · {total - done} left</span>}
      </p>

      <ol>
        {trip.checkpoints.map((c, i) => {
          const isDone = !!c.completedAt;
          const isNext = i === nextIndex;
          const isLast = i === trip.checkpoints.length - 1;

          return (
            <li key={c.key} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5 ${
                    isDone ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              <span
                aria-hidden
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  isDone
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isNext
                      ? 'border-amber-400 bg-amber-50 text-amber-700 ring-4 ring-amber-100'
                      : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className={`font-medium ${isDone || isNext ? 'text-slate-900' : 'text-slate-500'}`}>
                    {c.label}
                    {c.key === 'immigration' && (
                      <span className="ml-2 text-xs font-normal text-slate-500">cross-border</span>
                    )}
                  </p>
                  <p className="text-sm tabular-nums text-slate-500">
                    {isDone ? formatDateTime(c.completedAt) : isNext ? 'Up next' : 'Pending'}
                  </p>
                </div>
                {isNext && action && <div className="mt-2">{action}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
