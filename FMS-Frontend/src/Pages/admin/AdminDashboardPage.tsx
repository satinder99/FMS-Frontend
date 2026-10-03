// [FRONTEND · React] src/pages/admin/AdminDashboardPage.tsx
import { Link } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { adminApi } from '../../lib/fleetApi';
import { isAssigned } from '../../lib/roles';

export default function AdminDashboardPage() {
  const { data, error, loading, reload } = useApiData(adminApi.listUsers, 30_000);
  const users = data ?? [];
  const pending = users.filter((u) => !isAssigned(u)).length;
  const count = (role: string) => users.filter((u) => u.role_name === role).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Admin overview</h1>
        <Link
          to="/admin/organizations/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Onboard a new organization
        </Link>
      </div>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
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

        <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
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
      </AsyncState>
    </div>
  );
}
