// [FRONTEND · React] src/types/trips.ts
export type CheckpointKey =
  | 'reached_source'
  | 'pickup_truck'
  | 'pickup_trailer'
  | 'load_trailer'
  | 'start_journey'
  | 'immigration'
  | 'pod_upload';

/** pending = not started, in_progress = started (start time set), completed = start and end time set */
export type CheckpointStatus = 'pending' | 'in_progress' | 'completed';

export interface Checkpoint {
  key: CheckpointKey;
  label: string;
  status: CheckpointStatus;
  /** ISO timestamp of the step's START, or null if not started */
  startedAt: string | null;
  /** ISO timestamp of the step's END, or null if not completed */
  completedAt: string | null;
  /** How many times the start/end time was edited (by the driver or a dispatcher) */
  timeEditCount: number;
  /** A dispatcher adjusted this step: the driver can no longer change it */
  dispatcherEdited: boolean;
  /** The dispatcher's one free edit for this step has been used */
  freeEditUsed: boolean;
  /**
   * Seconds (as of when this data loaded) in which the DRIVER may still undo or change this step.
   * Measured on the server from the moment the step was recorded. null = locked / not recorded.
   */
  driverEditableSeconds: number | null;
}

export type TripStatus = 'assigned' | 'in_progress' | 'completed';

export type DocumentType = 'pod' | 'bol' | 'itinerary' | 'immigration' | 'other';

/** A file attached to a trip (today: the driver's proof of delivery). The file itself lives in storage. */
export interface TripDocument {
  id: number;
  docType: DocumentType;
  /** The step it belongs to (e.g. pod_upload); null for trip-level documents */
  checkpointKey: string | null;
  /** The name the uploader's file had */
  filename: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByName: string | null;
  /** The name to save a download as, e.g. TRP-000012-POD-1.jpg */
  downloadName: string;
}

export interface Trip {
  id: number;
  reference: string;
  driverId: number;
  driverName: string;
  /** The dispatcher who created the trip */
  createdByName: string | null;
  truckNumber: string;
  trailerNumber: string;
  origin: string;
  destination: string;
  crossBorder: boolean;
  scheduledPickup: string; // ISO
  status: TripStatus;
  /** Ordered. The immigration checkpoint only exists when crossBorder is true. */
  checkpoints: Checkpoint[];
  documents: TripDocument[];
}

export interface DriverSummary {
  id: number;
  name: string;
  phone: string | null;
}

export interface DispatcherDriverRow extends DriverSummary {
  activeTrip: Trip | null;
}

/** An organization's approved window in which its dispatchers may edit step times without limit */
export interface EditWindow {
  id: number;
  durationMinutes: number;
  startsAt: string;
  expiresAt: string;
  /** Seconds left as of when this data loaded */
  remainingSeconds: number;
}

export interface EditRequestSummary {
  id: number;
  reason: string;
  requestedByName: string | null;
  createdAt: string;
  tripReference: string | null;
  checkpointLabel: string | null;
}

/** What a dispatcher may do about editing step times, right now */
export interface EditAccessState {
  window: EditWindow | null;
  pending: EditRequestSummary | null;
  lastDecision: { status: 'approved' | 'denied'; decisionNote: string | null; decidedAt: string } | null;
}

/** Body for correcting a step's times. Only the fields that changed are sent. */
export interface StepTimesPayload {
  startedAt?: string;
  completedAt?: string;
  reason?: string;
}

export interface NewEditRequestPayload {
  reason: string;
  tripId?: number;
  checkpointKey?: CheckpointKey;
}

export interface DispatcherDriverDetail {
  driver: DriverSummary;
  trips: Trip[];
  editAccess: EditAccessState;
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

/** The trip and step a dispatcher's request for more edits is about (shown on the request form) */
export interface EditRequestContext {
  tripId: number;
  checkpointKey: CheckpointKey;
  tripReference: string;
  label: string;
}
