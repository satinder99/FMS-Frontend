// [FRONTEND · React] src/lib/orgValidation.ts
// Form rules for onboarding an organization. These MIRROR the backend's
// Services/organizationService.js (which mirrors the `organizations` table). The backend is the real
// gatekeeper; this file only lets the admin fix mistakes before submitting. Keep both in sync.
import type { Country, NewOrganizationPayload, OrgType, SubscriptionPlan } from '../types/admin';

export const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: 'carrier', label: 'Carrier (runs trucks)' },
  { value: 'broker', label: 'Broker' },
  { value: 'shipper', label: 'Shipper' },
];
export const PLANS: { value: SubscriptionPlan; label: string }[] = [
  { value: 'trial', label: 'Trial' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];
export const COUNTRIES: { value: Country; label: string }[] = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
];
// Postgres knows many more; these cover North America. The backend checks against Postgres' own list.
export const TIMEZONES = [
  'America/St_Johns', 'America/Halifax', 'America/Toronto', 'America/Winnipeg', 'America/Edmonton',
  'America/Vancouver', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix',
  'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu', 'America/Mexico_City',
];

/** Every input is a string while editing. */
export interface OrgFormValues {
  name: string;
  shortName: string;
  slug: string;
  legalName: string;
  orgType: OrgType;
  logoUrl: string;
  dotNumber: string;
  mcNumber: string;
  scacCode: string;
  einTaxId: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  billingEmail: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: Country;
  timezone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  cargoInsuranceAmount: string;
  subscriptionPlan: SubscriptionPlan;
  trialEndsOn: string;
  fleetSize: string;
}
export type OrgFormErrors = Partial<Record<keyof OrgFormValues, string>>;

export const EMPTY_ORG_FORM: OrgFormValues = {
  name: '', shortName: '', slug: '', legalName: '', orgType: 'carrier', logoUrl: '',
  dotNumber: '', mcNumber: '', scacCode: '', einTaxId: '',
  primaryContactName: '', primaryContactEmail: '', primaryContactPhone: '', billingEmail: '', phone: '', website: '',
  addressLine1: '', addressLine2: '', city: '', stateProvince: '', postalCode: '', country: 'US', timezone: 'America/New_York',
  insuranceProvider: '', insurancePolicyNumber: '', insuranceExpiryDate: '', cargoInsuranceAmount: '',
  subscriptionPlan: 'trial', trialEndsOn: '', fleetSize: '',
};

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/g, '');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s().-]+$/;
const POSTAL: Record<Country, { re: RegExp; hint: string }> = {
  US: { re: /^\d{5}(-\d{4})?$/, hint: 'a ZIP code like 60601 or 60601-1234' },
  CA: { re: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, hint: 'a postal code like L6T 4S9' },
  MX: { re: /^\d{5}$/, hint: 'a 5-digit postal code' },
};

const isRealDate = (s: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

function normalizeUrl(raw: string, max: number): string | null {
  const s = raw.trim();
  if (/\s/.test(s)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    if (!u.hostname.includes('.')) return null;
    return withScheme.length <= max ? withScheme : null;
  } catch {
    return null;
  }
}

/** Returns field -> message, with keys in the same order as the form (so the first one can be focused). */
export function validateOrgForm(values: OrgFormValues): OrgFormErrors {
  const e: OrgFormErrors = {};
  const t = (k: keyof OrgFormValues) => String(values[k]).trim();
  const maxLen = (k: keyof OrgFormValues, label: string, max: number) => {
    if (t(k).length > max) e[k] = `${label} must be ${max} characters or fewer.`;
  };

  // --- Organization
  if (!t('name')) e.name = 'Organization name is required.';
  else if (t('name').length < 2 || t('name').length > 200) e.name = 'Organization name must be 2–200 characters.';

  if (!t('shortName')) e.shortName = 'Short name is required.';
  else if (!/^[A-Za-z0-9]{2,20}$/.test(t('shortName'))) {
    e.shortName = 'Short name must be 2–20 letters or digits, with no spaces (it becomes the username prefix, e.g. DFS).';
  }

  const slug = t('slug').toLowerCase() || slugify(t('name'));
  if (!slug) e.slug = 'URL name is required (it is built from the organization name if left blank).';
  else if (slug.length > 100 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    e.slug = 'URL name may only use lowercase letters, digits and single hyphens (up to 100 characters).';
  }

  maxLen('legalName', 'Legal name', 200);
  if (t('logoUrl') && !normalizeUrl(t('logoUrl'), 2048)) {
    e.logoUrl = 'Logo link must be a web address starting with http:// or https://.';
  }

  // --- Regulatory
  if (t('dotNumber') && !/^\d{1,8}$/.test(t('dotNumber').replace(/^(usdot|dot)[\s-]*/i, ''))) {
    e.dotNumber = 'USDOT number must be 1–8 digits.';
  }
  if (t('mcNumber') && !/^\d{1,8}$/.test(t('mcNumber').replace(/^mc[\s-]*/i, ''))) {
    e.mcNumber = 'MC number must be 1–8 digits.';
  }
  if (t('scacCode') && !/^[A-Za-z]{2,4}$/.test(t('scacCode'))) e.scacCode = 'SCAC code must be 2–4 letters.';
  if (t('einTaxId')) {
    const s = t('einTaxId').toUpperCase();
    if (!/^\d{2}-?\d{7}$/.test(s) && !/^\d{9}(RT\d{4})?$/.test(s)) {
      e.einTaxId = 'Tax ID must be a US EIN (12-3456789) or a Canadian business number (123456789 or 123456789RT0001).';
    }
  }

  // --- Contact
  maxLen('primaryContactName', 'Contact name', 150);
  const email = (k: 'primaryContactEmail' | 'billingEmail', label: string) => {
    if (t(k) && (t(k).length > 255 || !EMAIL_RE.test(t(k)))) e[k] = `${label} must be a valid email address.`;
  };
  const phone = (k: 'primaryContactPhone' | 'phone', label: string) => {
    const s = t(k);
    if (!s) return;
    const digits = s.replace(/\D/g, '').length;
    if (s.length > 20 || !PHONE_RE.test(s) || s.slice(1).includes('+') || digits < 7 || digits > 15) {
      e[k] = `${label} must be a phone number with 7–15 digits (e.g. +1 905 555 0100).`;
    }
  };
  email('primaryContactEmail', 'Contact email');
  phone('primaryContactPhone', 'Contact phone');
  email('billingEmail', 'Billing email');
  phone('phone', 'Main phone');
  if (t('website') && !normalizeUrl(t('website'), 255)) {
    e.website = 'Website must be a web address starting with http:// or https:// (up to 255 characters).';
  }

  // --- Address
  maxLen('addressLine1', 'Address line 1', 255);
  maxLen('addressLine2', 'Address line 2', 255);
  maxLen('city', 'City', 100);
  maxLen('stateProvince', 'State / province', 50);
  if (t('postalCode')) {
    const rule = POSTAL[values.country];
    if (t('postalCode').length > 20 || !rule.re.test(t('postalCode'))) e.postalCode = `Postal code must be ${rule.hint}.`;
  }
  if (!t('timezone') || t('timezone').length > 50) e.timezone = 'Choose a timezone.';

  // --- Insurance
  maxLen('insuranceProvider', 'Insurance provider', 150);
  maxLen('insurancePolicyNumber', 'Policy number', 100);
  if (t('insuranceExpiryDate') && !isRealDate(t('insuranceExpiryDate'))) {
    e.insuranceExpiryDate = 'Insurance expiry date must be a real date.';
  }
  if (t('cargoInsuranceAmount') && !/^\d{1,10}(\.\d{1,2})?$/.test(t('cargoInsuranceAmount').replace(/,/g, ''))) {
    e.cargoInsuranceAmount = 'Cargo insurance must be an amount up to 9,999,999,999.99.';
  }

  // --- Plan (the "trial end date is not in the past" rule is checked by the server, in the org's timezone)
  if (values.subscriptionPlan === 'trial' && t('trialEndsOn') && !isRealDate(t('trialEndsOn'))) {
    e.trialEndsOn = 'Trial end date must be a real date.';
  }
  if (t('fleetSize') && !(/^\d{1,6}$/.test(t('fleetSize')) && Number(t('fleetSize')) <= 100000)) {
    e.fleetSize = 'Fleet size must be a whole number from 0 to 100,000.';
  }
  return e;
}

/** Only fields the admin actually filled in are sent; the server applies the same defaults as the table. */
export function toOrgPayload(values: OrgFormValues): NewOrganizationPayload {
  const p: NewOrganizationPayload = { name: values.name.trim(), shortName: values.shortName.trim() };
  const put = <K extends Exclude<keyof NewOrganizationPayload, 'fleetSize'>>(key: K, raw: string) => {
    const s = raw.trim();
    if (s) Object.assign(p, { [key]: s });
  };
  put('slug', values.slug);
  put('legalName', values.legalName);
  put('logoUrl', values.logoUrl);
  put('dotNumber', values.dotNumber);
  put('mcNumber', values.mcNumber);
  put('scacCode', values.scacCode);
  put('einTaxId', values.einTaxId);
  put('primaryContactName', values.primaryContactName);
  put('primaryContactEmail', values.primaryContactEmail);
  put('primaryContactPhone', values.primaryContactPhone);
  put('billingEmail', values.billingEmail);
  put('phone', values.phone);
  put('website', values.website);
  put('addressLine1', values.addressLine1);
  put('addressLine2', values.addressLine2);
  put('city', values.city);
  put('stateProvince', values.stateProvince);
  put('postalCode', values.postalCode);
  put('insuranceProvider', values.insuranceProvider);
  put('insurancePolicyNumber', values.insurancePolicyNumber);
  put('insuranceExpiryDate', values.insuranceExpiryDate);
  put('cargoInsuranceAmount', values.cargoInsuranceAmount.replace(/,/g, ''));

  p.orgType = values.orgType;
  p.country = values.country;
  p.timezone = values.timezone;
  p.subscriptionPlan = values.subscriptionPlan;
  if (values.subscriptionPlan === 'trial') put('trialEndsOn', values.trialEndsOn); // the server rejects it on paid plans
  if (values.fleetSize.trim()) p.fleetSize = Number(values.fleetSize.trim());
  return p;
}
