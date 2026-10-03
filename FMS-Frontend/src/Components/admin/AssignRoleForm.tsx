// [FRONTEND · React] src/components/admin/AssignRoleForm.tsx
import { useState } from 'react';
import { errorMessage } from '../../lib/fleetApi';
import { isAssigned } from '../../lib/roles';
import type { AdminUser, Organization } from '../../types/admin';
import { ROLE_NAMES, type RoleName } from '../../types/roles';

interface Props {
  user: AdminUser;
  orgs: Organization[];
  submitLabel: string;
  /** Should call the API and refresh the lists; throw on failure. */
  onAssign: (userId: number, role: RoleName, orgId: number | null) => Promise<void>;
  onDone?: () => void;
}

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-400';

export default function AssignRoleForm({ user, orgs, submitLabel, onAssign, onDone }: Props) {
  const [role, setRole] = useState<RoleName | ''>(user.role_name ?? '');
  const [orgId, setOrgId] = useState<number | ''>(user.org_id ?? (orgs.length === 1 ? orgs[0].id : ''));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdminRole = role === 'admin';

  async function handleSubmit() {
    if (!role) return setError('Choose a role.');
    if (!isAdminRole && orgId === '') return setError('Choose an organization.');
    setSaving(true);
    setError(null);
    try {
      await onAssign(user.id, role, isAdminRole || orgId === '' ? null : orgId);
      onDone?.();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`role-${user.id}`}>Role for {user.first_name}</label>
        <select
          id={`role-${user.id}`}
          className={selectClass}
          value={role}
          onChange={(e) => {
            setRole(e.target.value as RoleName | '');
            setError(null);
          }}
        >
          <option value="">Select role…</option>
          {ROLE_NAMES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor={`org-${user.id}`}>Organization for {user.first_name}</label>
        <select
          id={`org-${user.id}`}
          className={selectClass}
          value={isAdminRole ? '' : orgId}
          disabled={isAdminRole}
          onChange={(e) => setOrgId(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">{isAdminRole ? 'No org (platform admin)' : 'Select organization…'}</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
      {isAssigned(user) && (
        <p className="mt-1 text-xs text-slate-500">
          Changing access signs this user out everywhere so the new role takes effect.
        </p>
      )}
    </div>
  );
}
