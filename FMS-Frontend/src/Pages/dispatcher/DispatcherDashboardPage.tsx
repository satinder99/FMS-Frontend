// [FRONTEND · React] src/pages/dispatcher/DispatcherDashboardPage.tsx
import { Link } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import { ProgressSegments } from '../../components/trips/CheckpointTimeline';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi } from '../../lib/fleetApi';
import { timeAgo } from '../../lib/format';
import { getTripProgress, type TripProgress } from '../../lib/tripProgress';

/** "Loading trailer (in progress)" or "Finished Pick up truck, next: Pick up trailer" */
function whereNow(p: TripProgress): string {
  if (!p.current) return 'Trip complete';
  if (p.current.status === 'in_progress') return `${p.current.label} (in progress)`;
  return p.lastDone ? `Finished ${p.lastDone.label}, next: ${p.current.label}` : `Not started, first step: ${p.current.label}`;
}

export default function DispatcherDashboardPage() {
  // Polling every 15s instead of WebSockets: plenty for 10-20 trucks.
  const { data: drivers, error, loading, reload } = useApiData(dispatcherApi.listDrivers, 15_000);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Drivers & rides</h1>
        <p className="text-sm text-slate-600">Select a driver to see every step with its start and end time.</p>
      </div>

      <AsyncState loading={loading} error={error} hasData={!!drivers} onRetry={() => void reload()}>
        {drivers && drivers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            No drivers in your organization yet. An admin needs to assign the driver role to someone first.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Driver</th>
                  <th scope="col" className="px-4 py-3 font-medium">Truck / trailer</th>
                  <th scope="col" className="px-4 py-3 font-medium">Current ride</th>
                  <th scope="col" className="w-56 px-4 py-3 font-medium">Progress</th>
                  <th scope="col" className="px-4 py-3 font-medium">Where they are now</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(drivers ?? []).map((driver) => {
                  const active = driver.activeTrip;
                  const progress = active ? getTripProgress(active) : null;
                  return (
                    <tr key={driver.id} className="align-top">
                      <td className="px-4 py-3">
                        <Link
                          to={`/dispatcher/drivers/${driver.id}`}
                          className="font-medium text-sky-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                        >
                          {driver.name}
                        </Link>
                        <p className="text-slate-500">{driver.phone ?? 'No phone on file'}</p>
                      </td>

                      {active && progress ? (
                        <>
                          <td className="px-4 py-3 tabular-nums">
                            {active.truckNumber}
                            <p className="text-slate-500">{active.trailerNumber}</p>
                          </td>
                          <td className="px-4 py-3">
                            {active.origin} <span className="text-slate-400">to</span> {active.destination}
                            <p className="text-slate-500">{active.reference}</p>
                          </td>
                          <td className="px-4 py-3">
                            <ProgressSegments trip={active} />
                            <p className="mt-1.5 text-slate-600">{progress.done} of {progress.total} done</p>
                          </td>
                          <td className="px-4 py-3">
                            {whereNow(progress)}
                            <p className="text-slate-500">
                              {progress.lastUpdate ? `Updated ${timeAgo(progress.lastUpdate)}` : 'Waiting on driver'}
                            </p>
                          </td>
                        </>
                      ) : (
                        <td colSpan={4} className="px-4 py-3 text-slate-500">
                          No active ride — available to assign.
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AsyncState>
    </div>
  );
}
