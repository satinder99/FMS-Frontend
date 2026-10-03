// [FRONTEND · React] src/pages/admin/AdminPendingUsersPage.tsx
import AssignRoleForm from '../../components/admin/AssignRoleForm';
import AsyncState from '../../components/common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { formatDateTime } from '../../lib/format';
import { adminApi } from '../../lib/fleetApi';
import { isAssigned } from '../../lib/roles';
import type { RoleName } from '../../types/roles';

export default function AdminPendingUsersPage() {
  const usersQ = useApiData(adminApi.listUsers, 30_000);
  const orgsQ = useApiData(adminApi.listOrganizations);

  const pending = (usersQ.data ?? []).filter((u) => !isAssigned(u));

  async function handleAssign(userId: number, role: RoleName, orgId: number | null) {
    await adminApi.assignAccess(userId, role, orgId);
    await usersQ.reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New signups</h1>
        <p className="text-sm text-slate-600">
          These accounts have no role or organization yet, so they can’t see anything until you assign one.
        </p>
      </div>

      <AsyncState
        loading={usersQ.loading || orgsQ.loading}
        error={usersQ.error ?? orgsQ.error}
        hasData={!!usersQ.data && !!orgsQ.data}
        onRetry={() => {
          void usersQ.reload();
          void orgsQ.reload();
        }}
      >
        {pending.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Nobody is waiting. New signups will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {pending.map((u) => (
              <li key={u.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{u.first_name} {u.last_name}</p>
                  <p className="text-sm text-slate-600">{u.email}</p>
                  <p className="text-sm text-slate-500">Signed up {formatDateTime(u.created_at)}</p>
                </div>
                <AssignRoleForm user={u} orgs={orgsQ.data ?? []} submitLabel="Grant access" onAssign={handleAssign} />
              </li>
            ))}
          </ul>
        )}
      </AsyncState>
    </div>
  );
}
