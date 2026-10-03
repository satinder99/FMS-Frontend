import type { Checkpoint, Trip, TripStatus } from '../types/trips';

export interface TripProgress {
  total: number;
  done: number;
  percent: number;
  status: TripStatus;
  /** Index of the first incomplete checkpoint, or -1 when all done */
  nextIndex: number;
  next: Checkpoint | null;
  /** Most recently completed checkpoint = "where the driver is now" */
  lastDone: Checkpoint | null;
  lastUpdate: string | null;
}

export function getTripProgress(trip: Trip): TripProgress {
  const total = trip.checkpoints.length;
  const completed = trip.checkpoints.filter((c) => c.completedAt);
  const done = completed.length;
  const nextIndex = trip.checkpoints.findIndex((c) => !c.completedAt);
  const lastDone = done > 0 ? completed[completed.length - 1] : null;
  const status: TripStatus = done === 0 ? 'assigned' : done === total ? 'completed' : 'in_progress';

  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    status,
    nextIndex,
    next: nextIndex >= 0 ? trip.checkpoints[nextIndex] : null,
    lastDone,
    lastUpdate: lastDone?.completedAt ?? null,
  };
}
