import { useState } from 'react';
import { isPendingUser, useAdminStore } from '../../store/adminStore';
import type { AdminUser } from '../../types/admin';
import { ROLE_NAMES, type RoleName } from '../../types/roles';

interface Props {
  user: AdminUser;
  submitLabel: string;
  onDone?: () => void;
}

const selectClass =
  'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-400';

export default function AssignRoleForm({ user, submitLabel, onDone }: Props) {
  const orgs = useAdminStore((s) => s.orgs);
  const assign = useAdminStore((s) => s.assignOrgAndRole);

  const [role, setRole] = useState<RoleName | ''>(user.role_name ?? '');
  const [orgId, setOrgId] = useState<number | ''>(user.org_id ?? (orgs.length === 1 ? orgs[0].id : ''));
  const [error, setError] = useState<string | null>(null);

  const isAdminRole = role === 'admin';

  function handleSubmit() {
    if (!role) return setError('Choose a role.');
    const result = assign(user.id, role, isAdminRole ? null : orgId === '' ? null : orgId);
    if (!result.ok) return setError(result.error);
    setError(null);
    onDone?.();
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
          onClick={handleSubmit}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {submitLabel}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
      {!isPendingUser(user) && (
        <p className="mt-1 text-xs text-slate-500">
          Changing access signs this user out everywhere so the new role takes effect.
        </p>
      )}
    </div>
  );
}
