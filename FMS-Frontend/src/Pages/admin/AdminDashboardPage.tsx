import { Link } from 'react-router';
import { isPendingUser, useAdminStore } from '../../store/adminStore';

export default function AdminDashboardPage() {
  const users = useAdminStore((s) => s.users);
  const pending = users.filter(isPendingUser).length;
  const count = (role: string) => users.filter((u) => u.role_name === role).length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Admin overview</h1>

      {pending > 0 ? (
        <Link
          to="/admin/pending"
          className="block rounded-xl border border-amber-300 bg-amber-50 p-5 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <p className="text-lg font-semibold">
            {pending} {pending === 1 ? 'person is' : 'people are'} waiting for access
          </p>
          <p className="text-sm text-slate-700">Assign a role and organization so they can start working.</p>
        </Link>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600">
          No new signups waiting. Everyone has access.
        </p>
      )}

      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {[
          ['Total users', users.length],
          ['Admins', count('admin')],
          ['Dispatchers', count('dispatcher')],
          ['Drivers', count('driver')],
        ].map(([label, value]) => (
          <div key={label} className="border-l-2 border-slate-300 pl-3">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
