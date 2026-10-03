// [FRONTEND · React] src/pages/admin/AdminNewOrganizationPage.tsx
// Admin-only page (route /admin/organizations/new) to onboard a new organization.
// Only "Organization name" and "Short name" are required; everything else is optional and matches
// a column of the `organizations` table. Rules live in lib/orgValidation.ts (mirrors the backend).
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { adminApi, errorMessage } from '../../lib/fleetApi';
import { ApiError } from '../../lib/httpClient';
import {
  COUNTRIES,
  EMPTY_ORG_FORM,
  ORG_TYPES,
  PLANS,
  TIMEZONES,
  slugify,
  toOrgPayload,
  validateOrgForm,
  type OrgFormErrors,
  type OrgFormValues,
} from '../../lib/orgValidation';
import type { CreatedOrganization } from '../../types/admin';

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 aria-[invalid=true]:border-red-500';

// When the server rejects a value that is already taken, point at that exact field.
const FIELD_FOR_CONFLICT: Record<string, keyof OrgFormValues> = {
  ORG_SLUG_EXISTS: 'slug',
  ORG_SHORT_NAME_EXISTS: 'shortName',
  ORG_DOT_EXISTS: 'dotNumber',
  ORG_MC_EXISTS: 'mcNumber',
};

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
      <legend className="px-1 text-base font-semibold">{title}</legend>
      {note && <p className="mb-4 text-sm text-slate-600">{note}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  id, label, required, hint, error, wide, children,
}: {
  id: string; label: string; required?: boolean; hint?: string; error?: string; wide?: boolean; children: ReactNode;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}{' '}
        <span className={required ? 'font-semibold text-red-700' : 'font-normal text-slate-500'}>
          {required ? '(required)' : '(optional)'}
        </span>
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export default function AdminNewOrganizationPage() {
  const [values, setValues] = useState<OrgFormValues>(EMPTY_ORG_FORM);
  const [errors, setErrors] = useState<OrgFormErrors>({});
  const [slugEdited, setSlugEdited] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<CreatedOrganization | null>(null);

  function setField<K extends keyof OrgFormValues>(key: K, value: OrgFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleNameChange(name: string) {
    setValues((prev) => ({ ...prev, name, ...(slugEdited ? {} : { slug: slugify(name) }) }));
    setErrors((prev) => ({ ...prev, name: undefined, ...(slugEdited ? {} : { slug: undefined }) }));
  }

  // Props shared by every text-like input: id, value, change handler and accessibility links to the hint/error.
  const bind = (key: keyof OrgFormValues) => ({
    id: `org-${key}`,
    value: values[key],
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `org-${key}-error` : `org-${key}-hint`,
    onChange: (e: { target: { value: string } }) => setField(key, e.target.value as never),
  });

  function focusField(key: string) {
    document.getElementById(`org-${key}`)?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBanner(null);

    const found = validateOrgForm(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      setBanner('Some fields need attention. They are marked below.');
      focusField(first);
      return;
    }

    setSaving(true);
    try {
      console.log(values);
      
      setCreated(await adminApi.createOrganization(toOrgPayload(values)));
    } catch (err) {
      const field = err instanceof ApiError ? FIELD_FOR_CONFLICT[err.code] : undefined;
      if (field) {
        setErrors({ [field]: errorMessage(err) });
        focusField(field);
      } else {
        setBanner(errorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  }

  function startAnother() {
    setValues(EMPTY_ORG_FORM);
    setErrors({});
    setSlugEdited(false);
    setBanner(null);
    setCreated(null);
  }

  // ---------- success ----------
  if (created) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-6">
          <h1 className="text-xl font-semibold">{created.name} is now onboarded</h1>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt className="text-slate-600">Short name (username prefix)</dt><dd className="font-medium">{created.shortName}</dd></div>
            <div><dt className="text-slate-600">URL name</dt><dd className="font-medium">{created.slug}</dd></div>
            <div><dt className="text-slate-600">Type</dt><dd className="font-medium capitalize">{created.orgType}</dd></div>
            <div><dt className="text-slate-600">Plan</dt><dd className="font-medium capitalize">{created.subscriptionPlan}</dd></div>
            <div><dt className="text-slate-600">Timezone</dt><dd className="font-medium">{created.timezone}</dd></div>
            {created.trialEndsAt && (
              <div>
                <dt className="text-slate-600">Trial ends</dt>
                <dd className="font-medium">{new Date(created.trialEndsAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>
        <p className="text-sm text-slate-600">
          Next: give people access to it. Open <Link to="/admin/pending" className="text-sky-700 underline">New signups</Link> and
          assign a dispatcher or driver role with this organization.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={startAnother} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
            Onboard another organization
          </button>
          <Link to="/admin" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
            Back to admin home
          </Link>
        </div>
      </div>
    );
  }

  // ---------- form ----------
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/admin" className="text-sm text-sky-700 underline-offset-2 hover:underline">← Admin home</Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Onboard a new organization</h1>
        <p className="text-sm text-slate-600">
          Only the organization name and short name are required. Everything else can be filled in now or left blank.
        </p>
      </div>

      {banner && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{banner}</p>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-6">
        <Section title="Organization">
          <Field id="org-name" label="Organization name" required error={errors.name} wide>
            <input {...bind('name')} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} autoComplete="organization" />
          </Field>
          <Field id="org-shortName" label="Short name" required error={errors.shortName}
            hint="2–20 letters or digits, no spaces. Used as the prefix of usernames, e.g. DFS gives DFSJSmith.">
            <input {...bind('shortName')} className={`${inputClass} uppercase`} maxLength={20} />
          </Field>
          <Field id="org-slug" label="URL name" error={errors.slug}
            hint="Lowercase letters, digits and hyphens. Filled in from the name; change it only if you need to.">
            <input
              {...bind('slug')}
              onChange={(e) => { setSlugEdited(true); setField('slug', e.target.value); }}
              className={inputClass}
            />
          </Field>
          <Field id="org-legalName" label="Legal name" error={errors.legalName} wide>
            <input {...bind('legalName')} className={inputClass} />
          </Field>
          <Field id="org-orgType" label="Organization type" error={errors.orgType}>
            <select {...bind('orgType')} className={inputClass}>
              {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field id="org-logoUrl" label="Logo link" error={errors.logoUrl} hint="A web address, e.g. https://example.com/logo.png">
            <input {...bind('logoUrl')} className={inputClass} inputMode="url" />
          </Field>
        </Section>

        <Section title="Regulatory identifiers">
          <Field id="org-dotNumber" label="USDOT number" error={errors.dotNumber} hint="1–8 digits. Must be unique.">
            <input {...bind('dotNumber')} className={inputClass} inputMode="numeric" />
          </Field>
          <Field id="org-mcNumber" label="MC number" error={errors.mcNumber} hint="1–8 digits (MC- prefix is fine). Must be unique.">
            <input {...bind('mcNumber')} className={inputClass} inputMode="numeric" />
          </Field>
          <Field id="org-scacCode" label="SCAC code" error={errors.scacCode} hint="2–4 letters.">
            <input {...bind('scacCode')} className={`${inputClass} uppercase`} maxLength={4} />
          </Field>
          <Field id="org-einTaxId" label="Tax ID" error={errors.einTaxId} hint="US EIN (12-3456789) or Canadian business number (123456789RT0001).">
            <input {...bind('einTaxId')} className={inputClass} />
          </Field>
        </Section>

        <Section title="Contact">
          <Field id="org-primaryContactName" label="Primary contact name" error={errors.primaryContactName}>
            <input {...bind('primaryContactName')} className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-primaryContactEmail" label="Primary contact email" error={errors.primaryContactEmail}>
            <input {...bind('primaryContactEmail')} type="email" className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-primaryContactPhone" label="Primary contact phone" error={errors.primaryContactPhone}>
            <input {...bind('primaryContactPhone')} type="tel" className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-billingEmail" label="Billing email" error={errors.billingEmail}>
            <input {...bind('billingEmail')} type="email" className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-phone" label="Main phone" error={errors.phone}>
            <input {...bind('phone')} type="tel" className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-website" label="Website" error={errors.website}>
            <input {...bind('website')} className={inputClass} inputMode="url" />
          </Field>
        </Section>

        <Section title="Address and timezone" note="The timezone decides where “today”, “this week” and “this month” begin for the organization’s drivers.">
          <Field id="org-addressLine1" label="Address line 1" error={errors.addressLine1} wide>
            <input {...bind('addressLine1')} className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-addressLine2" label="Address line 2" error={errors.addressLine2} wide>
            <input {...bind('addressLine2')} className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-city" label="City" error={errors.city}>
            <input {...bind('city')} className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-stateProvince" label="State / province" error={errors.stateProvince}>
            <input {...bind('stateProvince')} className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-country" label="Country" error={errors.country}>
            <select {...bind('country')} className={inputClass}>
              {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field id="org-postalCode" label="Postal / ZIP code" error={errors.postalCode} hint="Format depends on the country chosen.">
            <input {...bind('postalCode')} className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-timezone" label="Timezone" error={errors.timezone} wide>
            <select {...bind('timezone')} className={inputClass}>
              {TIMEZONES.map((z) => <option key={z} value={z}>{z.replace('_', ' ')}</option>)}
            </select>
          </Field>
        </Section>

        <Section title="Insurance">
          <Field id="org-insuranceProvider" label="Insurance provider" error={errors.insuranceProvider}>
            <input {...bind('insuranceProvider')} className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-insurancePolicyNumber" label="Policy number" error={errors.insurancePolicyNumber}>
            <input {...bind('insurancePolicyNumber')} className={inputClass} autoComplete="off" />
          </Field>
          <Field id="org-insuranceExpiryDate" label="Insurance expiry date" error={errors.insuranceExpiryDate}>
            <input {...bind('insuranceExpiryDate')} type="date" className={inputClass} />
          </Field>
          <Field id="org-cargoInsuranceAmount" label="Cargo insurance amount" error={errors.cargoInsuranceAmount} hint="In dollars, e.g. 100000 or 100,000.00">
            <input {...bind('cargoInsuranceAmount')} className={inputClass} inputMode="decimal" />
          </Field>
        </Section>

        <Section title="Plan">
          <Field id="org-subscriptionPlan" label="Subscription plan" error={errors.subscriptionPlan}>
            <select {...bind('subscriptionPlan')} className={inputClass}>
              {PLANS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field id="org-fleetSize" label="Fleet size" error={errors.fleetSize} hint="Number of trucks, 0 to 100,000.">
            <input {...bind('fleetSize')} className={inputClass} inputMode="numeric" />
          </Field>
          {values.subscriptionPlan === 'trial' && (
            <Field id="org-trialEndsOn" label="Trial ends on" error={errors.trialEndsOn} wide
              hint="The trial runs through this day. Leave blank for a 14-day trial starting now.">
              <input {...bind('trialEndsOn')} type="date" className={inputClass} />
            </Field>
          )}
        </Section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {saving ? 'Creating…' : 'Create organization'}
          </button>
          <Link to="/admin" className="text-sm text-slate-600 underline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
