// [FRONTEND · React] src/lib/rides.ts — small helpers shared by the ride screens.
import type { Direction, Trip } from '../types/trips';

export const DIRECTION_LABEL: Record<Direction, string> = { outbound: 'Outbound', inbound: 'Inbound' };
/** Outbound = truck leaves Canada for the US; inbound = back from the US into Canada. */
export const DIRECTION_ROUTE: Record<Direction, string> = { outbound: 'CAN → US', inbound: 'US → CAN' };

/** Rides that can still be cancelled (not finished, not already cancelled). */
export const canCancel = (trip: Pick<Trip, 'status'>): boolean => trip.status === 'assigned' || trip.status === 'in_progress';

export const cancelledByLabel = (trip: Pick<Trip, 'cancelledByRole'>): string =>
  trip.cancelledByRole === 'driver' ? 'the driver' : 'a dispatcher';
