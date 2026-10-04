// [FRONTEND · React] src/types/admin.ts
import type { RoleName } from './roles';
import type { EditWindow, Trip } from './trips';

export interface Organization {
  id: number;
  name: string;
  short_name: string;
}

/** Mirrors the backend's admin user list (snake_case, like toSafeUser). */
export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  org_id: number | null;
  role_name: RoleName | null;
  status: string;
  created_at: string;
}

// ---- Onboarding a new organization (columns of the `organizations` table) ----
export type OrgType = 'carrier' | 'broker' | 'shipper';
export type SubscriptionPlan = 'trial' | 'starter' | 'pro' | 'enterprise';
export type Country = 'US' | 'CA' | 'MX';

/** What POST /api/admin/organizations accepts. Only name + shortName are truly required. */
export interface NewOrganizationPayload {
  name: string;
  shortName: string;
  slug?: string;
  legalName?: string;
  orgType?: OrgType;
  logoUrl?: string;
  dotNumber?: string;
  mcNumber?: string;
  scacCode?: string;
  einTaxId?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string; // YYYY-MM-DD
  cargoInsuranceAmount?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  billingEmail?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: Country;
  timezone?: string;
  subscriptionPlan?: SubscriptionPlan;
  trialEndsOn?: string; // YYYY-MM-DD, trial plan only
  fleetSize?: number;
  /** The trip steps for this organization. REQUIRED. */
  checkpoints: TemplateStepPayload[];
}

export interface CreatedOrganization {
  id: number;
  /** How many trip steps were set up */
  stepCount: number;
  name: string;
  legalName: string | null;
  slug: string;
  shortName: string;
  orgType: OrgType;
  timezone: string;
  subscriptionPlan: SubscriptionPlan;
  trialEndsAt: string | null;
  status: string;
  createdAt: string;
}

// ---- Organizations as the admin sees them ----
export interface OrgOverview {
  id: number;
  name: string;
  shortName: string;
  orgType: OrgType;
  status: string;
  subscriptionPlan: SubscriptionPlan;
  city: string | null;
  stateProvince: string | null;
  country: string | null;
  userCount: number;
  dispatcherCount: number;
  driverCount: number;
  openTrips: number;
  pendingRequests: number;
  /** Seconds left on an open edit window, or null */
  editWindowRemainingSeconds: number | null;
}

export interface OrgUser {
  id: number;
  name: string;
  email: string;
  username: string | null;
  status: string;
  role: 'dispatcher' | 'driver';
  /** Drivers: trips assigned to them. Dispatchers: trips they created. */
  tripCount: number;
  openTripCount: number;
}

export interface OrgDetail {
  organization: {
    id: number;
    name: string;
    shortName: string;
    legalName: string | null;
    orgType: OrgType;
    status: string;
    subscriptionPlan: SubscriptionPlan;
    timezone: string;
    city: string | null;
    stateProvince: string | null;
    country: string | null;
    createdAt: string;
  };
  users: OrgUser[];
  editWindow: EditWindow | null;
  pendingRequests: number;
}

export interface OrgUserTrips {
  user: { id: number; role: string };
  trips: Trip[];
}

export type EditRequestScope = 'pending' | 'active' | 'history';

/** A dispatcher's request for extra step-time edits, as the admin sees it */
export interface AdminEditRequest {
  id: number;
  orgId: number;
  orgName: string;
  orgShortName: string;
  requestedByName: string | null;
  reason: string;
  tripReference: string | null;
  checkpointLabel: string | null;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  createdAt: string;
  decidedByName: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  durationMinutes: number | null;
  windowExpiresAt: string | null;
  revokedAt: string | null;
  /** The approved window is open right now */
  isActive: boolean;
  remainingSeconds: number | null;
}

// ---- The steps ("checkpoints") an organization wants on every trip ----

/** A standard step offered in the drop-down. The list comes from the server. */
export interface CheckpointPreset {
  key: string;
  label: string;
  /** Skipped on trips that are not cross-border (e.g. Immigration) */
  crossBorderOnly: boolean;
}

/** One step as sent to the server: a standard step (presetKey) OR a typed-in one (label). */
export interface TemplateStepPayload {
  presetKey?: string;
  label?: string;
  crossBorderOnly?: boolean;
}

/** One step as saved for an organization */
export interface OrgTemplateStep {
  key: string;
  label: string;
  isCustom: boolean;
  crossBorderOnly: boolean;
}

/** One row of the step editor while it is being edited */
export interface TemplateStepDraft {
  /** Local id so React can keep rows apart when they move */
  id: string;
  /** A standard step's key, 'other' (type your own), or '' (nothing chosen yet) */
  choice: string;
  /** The typed name when choice is 'other' */
  label: string;
  crossBorderOnly: boolean;
}
