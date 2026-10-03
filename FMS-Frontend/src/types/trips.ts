// [FRONTEND · React] src/types/trips.ts
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

export type TripStatus = 'assigned' | 'in_progress' | 'completed';

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
  status: TripStatus;
  /** Ordered. The immigration checkpoint only exists when crossBorder is true. */
  checkpoints: Checkpoint[];
}

export interface DriverSummary {
  id: number;
  name: string;
  phone: string | null;
}

export interface DispatcherDriverRow extends DriverSummary {
  activeTrip: Trip | null;
}

export interface DispatcherDriverDetail {
  driver: DriverSummary;
  trips: Trip[];
}

export type Ownership = 'company' | 'owner_operator';
export type EquipmentKind = 'truck' | 'trailer';
export type EquipmentStatus = 'active' | 'maintenance' | 'retired';

export interface ResourceUnit {
  id: number;
  unitNumber: string;
  ownership: Ownership;
}

export interface TripResources {
  drivers: { id: number; name: string }[];
  trucks: ResourceUnit[];
  trailers: ResourceUnit[];
}

export interface Equipment {
  id: number;
  unitNumber: string;
  plateNumber: string | null;
  ownership: Ownership;
  ownerDriverId: number | null;
  ownerName: string | null;
  /** Driver name or outside owner's name; null for company-owned units */
  ownerLabel: string | null;
  status: EquipmentStatus;
}

export interface NewEquipmentPayload {
  unitNumber: string;
  plateNumber?: string;
  ownership: Ownership;
  ownerDriverId?: number | null;
  ownerName?: string;
}

export type PayType = 'hourly' | 'per_mile' | 'percentage' | 'salary';

export interface PayRate {
  id: number;
  ownTruck: boolean;
  ownTrailer: boolean;
  payType: PayType;
  payRate: number;
  /** 'YYYY-MM-DD' */
  effectiveFrom: string;
}

export interface NewPayRatePayload {
  ownTruck: boolean;
  ownTrailer: boolean;
  payType: PayType;
  payRate: number;
  effectiveFrom?: string;
}

export interface NewTripPayload {
  driverId: number;
  truckId: number;
  trailerId: number;
  origin: string;
  destination: string;
  scheduledPickup: string; // ISO
  crossBorder: boolean;
}

export interface HoursPeriod {
  hours: number;
  earnings: number;
  /** Hours on per-mile / percentage / salary pay: priced at settlement, not from hours */
  unpricedHours: number;
}

export interface HoursSummary {
  today: HoursPeriod;
  week: HoursPeriod;
  month: HoursPeriod;
  ytd: HoursPeriod;
  /** Max driving hours per day (US property-carrying rule: 11) */
  dailyDriveLimit: number;
}
