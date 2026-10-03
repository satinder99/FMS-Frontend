import { useMemo } from 'react';
import { Link } from 'react-router';
import { ProgressSegments } from '../../components/trips/CheckpointTimeline';
import { timeAgo } from '../../lib/format';
import { getTripProgress } from '../../lib/tripProgress';
import { mockDrivers } from '../../mocks/drivers';
import { useTripStore } from '../../store/tripStore';

export default function DispatcherDashboardPage() {
  const trips = useTripStore((s) => s.trips);

  const rows = useMemo(
    () =>
      mockDrivers.map((driver) => {
        const mine = trips.filter((t) => t.driverId === driver.id);
        const active =
          mine.find((t) => getTripProgress(t).status === 'in_progress') ??
          mine.find((t) => getTripProgress(t).status === 'assigned');
        return { driver, active, progress: active ? getTripProgress(active) : null };
      }),
    [trips],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Drivers & rides</h1>
        <p className="text-sm text-slate-600">Select a driver to see every checkpoint and when it was completed.</p>
      </div>

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
            {rows.map(({ driver, active, progress }) => (
              <tr key={driver.id} className="align-top">
                <td className="px-4 py-3">
                  <Link
                    to={`/dispatcher/drivers/${driver.id}`}
                    className="font-medium text-sky-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    {driver.name}
                  </Link>
                  <p className="text-slate-500">{driver.phone}</p>
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
                      <p className="mt-1.5 text-slate-600">
                        {progress.done} of {progress.total} done
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {progress.lastDone ? progress.lastDone.label : 'Not started'}
                      <p className="text-slate-500">
                        {progress.lastUpdate ? `Updated ${timeAgo(progress.lastUpdate)}` : 'Waiting on driver'}
                        {progress.next && ` · next: ${progress.next.label}`}
                      </p>
                    </td>
                  </>
                ) : (
                  <td colSpan={4} className="px-4 py-3 text-slate-500">
                    No active ride — available to assign.
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
