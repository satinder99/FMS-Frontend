import AssignRoleForm from '../../components/admin/AssignRoleForm';
import { formatDateTime } from '../../lib/format';
import { isPendingUser, useAdminStore } from '../../store/adminStore';

export default function AdminPendingUsersPage() {
  const users = useAdminStore((s) => s.users);
  const pending = users
    .filter(isPendingUser)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New signups</h1>
        <p className="text-sm text-slate-600">
          These accounts have no role or organization yet, so they can’t see anything until you assign one.
        </p>
      </div>

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
              <AssignRoleForm user={u} submitLabel="Grant access" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
