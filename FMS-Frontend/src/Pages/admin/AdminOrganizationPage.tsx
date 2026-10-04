// [FRONTEND · React] src/pages/admin/AdminOrganizationPage.tsx
// One organization: its dispatchers and drivers (filterable), and for each person the trips they handle.
import { Fragment, useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import OrgCheckpointsPanel from '../../components/admin/OrgCheckpointsPanel';
import OrgUserTrips from '../../components/admin/OrgUserTrips';
import { useApiData } from '../../hooks/useApiData';
import { adminApi } from '../../lib/fleetApi';
import { formatDateTime, formatMinutesLeft } from '../../lib/format';

type RoleFilter = 'all' | 'dispatcher' | 'driver';
const FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'dispatcher', label: 'Dispatchers' },
  { value: 'driver', label: 'Drivers' },
];

export default function AdminOrganizationPage() {
  const { orgId } = useParams();
  const id = Number(orgId);
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [openUserId, setOpenUserId] = useState<number | null>(null);

  const fetcher = useCallback(() => adminApi.orgDetail(id, filter === 'all' ? undefined : filter), [id, filter]);
  const { data, error, loading, reload } = useApiData(fetcher, 30_000);

  const org = data?.organization;
  const users = data?.users ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin" className="text-sm text-sky-700 underline-offset-2 hover:underline">← All organizations</Link>
        {org && (
          <>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{org.name}</h1>
            <p className="text-sm text-slate-600">
              {org.shortName} · <span className="capitalize">{org.orgType}</span> · {org.subscriptionPlan} plan ({org.status}) ·{' '}
              {[org.city, org.stateProvince, org.country].filter(Boolean).join(', ') || 'no address'} · timezone {org.timezone} ·
              onboarded {formatDateTime(org.createdAt)}
            </p>
          </>
        )}
      </div>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
        {data && (
          <>
            {(data.editWindow || data.pendingRequests > 0) && (
              <div className="space-y-2 text-sm">
                {data.editWindow && (
                  <p role="status" className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
                    Time edits are unlocked for this organization for {formatMinutesLeft(data.editWindow.remainingSeconds)} more.
                  </p>
                )}
                {data.pendingRequests > 0 && (
                  <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                    {data.pendingRequests} request{data.pendingRequests === 1 ? '' : 's'} for more time edits waiting.{' '}
                    <Link to="/admin/edit-requests" className="font-medium text-sky-700 underline">Review</Link>
                  </p>
                )}
              </div>
            )}

            <OrgCheckpointsPanel orgId={id} />

            <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={filter === f.value}
                  onClick={() => { setFilter(f.value); setOpenUserId(null); }}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    filter === f.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Name</th>
                    <th scope="col" className="px-4 py-3 font-medium">Role</th>
                    <th scope="col" className="px-4 py-3 font-medium">Account</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Trips</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Open</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Trips</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Nobody here yet.</td></tr>
                  )}
                  {users.map((u) => (
                    <Fragment key={u.id}>
                      <tr className="align-top">
                        <td className="px-4 py-3">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-slate-500">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 capitalize">{u.role}</td>
                        <td className="px-4 py-3">{u.status}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{u.tripCount}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{u.openTripCount}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            aria-expanded={openUserId === u.id}
                            onClick={() => setOpenUserId(openUserId === u.id ? null : u.id)}
                            className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                          >
                            {openUserId === u.id ? 'Hide trips' : u.role === 'driver' ? 'Show trips' : 'Show trips created'}
                          </button>
                        </td>
                      </tr>
                      {openUserId === u.id && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50 px-4 py-4">
                            <OrgUserTrips orgId={id} userId={u.id} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AsyncState>
    </div>
  );
}
