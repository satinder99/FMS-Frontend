import { create } from 'zustand';
import { mockTrips } from '../mocks/trips';
import type { Trip } from '../types/trips';

/**
 * Shared by the driver portal and dispatcher portal so a checkpoint the driver
 * completes shows up on the dispatcher screen immediately (in this static phase).
 *
 * API swap later: replace `trips: mockTrips` with a fetch (poll every 15-30s) and
 * make completeNextCheckpoint POST to /api/trips/:id/checkpoints/next.
 */
interface TripState {
  trips: Trip[];
  completeNextCheckpoint: (tripId: number) => void;
}

export const useTripStore = create<TripState>((set) => ({
  trips: mockTrips,
  completeNextCheckpoint: (tripId) =>
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;
        const idx = trip.checkpoints.findIndex((c) => !c.completedAt);
        if (idx === -1) return trip;
        const checkpoints = trip.checkpoints.map((c, i) =>
          i === idx ? { ...c, completedAt: new Date().toISOString() } : c,
        );
        return { ...trip, checkpoints };
      }),
    })),
}));
