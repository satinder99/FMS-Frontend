// [FRONTEND · React] src/components/rides/StageDots.tsx
// The P — B — D indicator for one ride: Pick-up, Border, Delivered.
//   green = completed · orange = pending · grey = disabled (this ride has no such stage, e.g. no border)
// Colour is never the only signal: each stage also has a text label and a screen-reader description.
import type { StageState, TripStages } from '../../types/trips';

const STAGES = [
  { key: 'P', label: 'Pick-up' },
  { key: 'B', label: 'Border' },
  { key: 'D', label: 'Delivered' },
] as const;

const DOT: Record<StageState, string> = {
  completed: 'bg-emerald-500 text-white',
  pending: 'bg-orange-400 text-white',
  disabled: 'bg-slate-200 text-slate-500',
};
const STATE_TEXT: Record<StageState, string> = { completed: 'completed', pending: 'pending', disabled: 'not used on this ride' };

interface Props {
  stages: TripStages;
  /** Cancelled ride: every stage is shown grey */
  muted?: boolean;
}

export default function StageDots({ stages, muted = false }: Props) {
  return (
    <ol className="flex items-start" aria-label="Ride stages">
      {STAGES.map((s, i) => {
        const state: StageState = muted ? 'disabled' : stages[s.key];
        const isCurrent = !muted && stages.current === s.key;
        const prevDone = i > 0 && !muted && stages[STAGES[i - 1].key] === 'completed';
        return (
          <li key={s.key} className="flex items-start">
            {i > 0 && <span aria-hidden="true" className={`mt-4 h-0.5 w-6 sm:w-12 ${prevDone ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            <div className="flex w-16 flex-col items-center gap-1 text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${DOT[state]} ${
                  isCurrent ? 'ring-2 ring-orange-300 ring-offset-2' : ''
                }`}
              >
                {s.key}
                <span className="sr-only">
                  {' '}
                  {s.label}: {muted ? 'cancelled' : STATE_TEXT[state]}
                  {isCurrent ? ' (current)' : ''}
                </span>
              </span>
              <span aria-hidden="true" className={`text-xs ${state === 'disabled' ? 'text-slate-400' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
