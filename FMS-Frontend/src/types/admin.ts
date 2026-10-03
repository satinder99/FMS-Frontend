// [FRONTEND · React] src/types/admin.ts
import type { RoleName } from './roles';

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
}

export interface CreatedOrganization {
  id: number;
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
