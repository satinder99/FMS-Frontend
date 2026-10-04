// [FRONTEND · React] src/lib/tripProgress.ts
import type { Checkpoint, Trip, TripStatus } from '../types/trips';

export interface TripProgress {
  total: number;
  /** Steps that are fully completed */
  done: number;
  percent: number;
  status: TripStatus;
  /** Index of the first step that is not completed (the one the driver is on), or -1 when everything is done */
  currentIndex: number;
  /** The step the driver is on: pending (about to start) or in progress */
  current: Checkpoint | null;
  /** The most recently completed step */
  lastDone: Checkpoint | null;
  /** Latest start/end time recorded on any step */
  lastUpdate: string | null;
}

export function getTripProgress(trip: Trip): TripProgress {
  const steps = trip.checkpoints;
  const total = steps.length;
  const done = steps.filter((c) => c.status === 'completed').length;
  const currentIndex = steps.findIndex((c) => c.status !== 'completed');
  const lastDone = [...steps].reverse().find((c) => c.status === 'completed') ?? null;

  const times = steps.flatMap((c) => [c.startedAt, c.completedAt]).filter((t): t is string => !!t);
  const lastUpdate = times.length ? times.reduce((a, b) => (new Date(a) > new Date(b) ? a : b)) : null;

  const status: TripStatus =
    total > 0 && done === total ? 'completed' : steps[0] && steps[0].status !== 'pending' ? 'in_progress' : 'assigned';

  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    status,
    currentIndex,
    current: currentIndex >= 0 ? steps[currentIndex] : null,
    lastDone,
    lastUpdate,
  };
}
