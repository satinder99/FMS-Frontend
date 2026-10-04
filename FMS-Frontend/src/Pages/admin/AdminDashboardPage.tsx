// [FRONTEND · React] src/pages/admin/AdminDashboardPage.tsx
// Admin home: every organization (click one to see its people and trips), plus people waiting for access.
import { Link } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { adminApi } from '../../lib/fleetApi';
import { formatMinutesLeft } from '../../lib/format';
import { isAssigned } from '../../lib/roles';

export default function AdminDashboardPage() {
  const orgsQ = useApiData(adminApi.orgOverview, 30_000);
  const usersQ = useApiData(adminApi.listUsers, 30_000);

  const orgs = orgsQ.data ?? [];
  const waiting = (usersQ.data ?? []).filter((u) => !isAssigned(u)).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
        <Link
          to="/admin/organizations/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Onboard a new organization
        </Link>
      </div>

      {waiting > 0 && (
        <Link
          to="/admin/pending"
          className="block rounded-xl border border-amber-300 bg-amber-50 p-4 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <p className="font-semibold">
            {waiting} {waiting === 1 ? 'person is' : 'people are'} waiting for access
          </p>
          <p className="text-sm text-slate-700">Assign a role and organization so they can start working.</p>
        </Link>
      )}

      <AsyncState loading={orgsQ.loading} error={orgsQ.error} hasData={!!orgsQ.data} onRetry={() => void orgsQ.reload()}>
        {orgs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No organizations yet. Onboard the first one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Organization</th>
                  <th scope="col" className="px-4 py-3 font-medium">Type · plan</th>
                  <th scope="col" className="px-4 py-3 font-medium">Location</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Dispatchers</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Drivers</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Open trips</th>
                  <th scope="col" className="px-4 py-3 font-medium">Time-edit access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgs.map((o) => (
                  <tr key={o.id} className="align-top">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/organizations/${o.id}`}
                        className="font-medium text-sky-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                      >
                        {o.name}
                      </Link>
                      <p className="text-slate-500">{o.shortName}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {o.orgType}
                      <p className="text-slate-500">{o.subscriptionPlan} · {o.status}</p>
                    </td>
                    <td className="px-4 py-3">{[o.city, o.stateProvince, o.country].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{o.dispatcherCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{o.driverCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{o.openTrips}</td>
                    <td className="px-4 py-3">
                      {o.editWindowRemainingSeconds !== null && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800">
                          Open · {formatMinutesLeft(o.editWindowRemainingSeconds)} left
                        </span>
                      )}
                      {o.pendingRequests > 0 && (
                        <Link to="/admin/edit-requests" className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 underline-offset-2 hover:underline">
                          {o.pendingRequests} waiting
                        </Link>
                      )}
                      {o.editWindowRemainingSeconds === null && o.pendingRequests === 0 && <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
