export type CheckpointKey =
  | 'reached_source'
  | 'pickup_truck'
  | 'pickup_trailer'
  | 'load_trailer'
  | 'start_journey'
  | 'immigration'
  | 'pod_upload';

export interface Checkpoint {
  key: CheckpointKey;
  label: string;
  /** ISO timestamp, or null while not yet completed */
  completedAt: string | null;
}

export interface Trip {
  id: number;
  reference: string;
  driverId: number;
  driverName: string;
  truckNumber: string;
  trailerNumber: string;
  origin: string;
  destination: string;
  crossBorder: boolean;
  scheduledPickup: string; // ISO
  /** Ordered. The immigration checkpoint only exists when crossBorder is true. */
  checkpoints: Checkpoint[];
}

export type TripStatus = 'assigned' | 'in_progress' | 'completed';

export interface DriverSummary {
  id: number;
  name: string;
  phone: string;
}

export interface HoursPeriod {
  hours: number;
  earnings: number;
}

export interface HoursSummary {
  today: HoursPeriod;
  week: HoursPeriod;
  month: HoursPeriod;
  ytd: HoursPeriod;
  /** Max driving hours allowed per day before a reset (US property-carrying rule: 11) */
  dailyDriveLimit: number;
}
