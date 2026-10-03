// [FRONTEND · React] src/pages/driver/DriverHoursPage.tsx
import AsyncState from '../../components/common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { driverApi } from '../../lib/fleetApi';
import { formatHours, formatMoney } from '../../lib/format';

export default function DriverHoursPage() {
  const { data: h, error, loading, reload } = useApiData(driverApi.getHours, 60_000);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Hours & pay</h1>

      <AsyncState loading={loading} error={error} hasData={!!h} onRetry={() => void reload()}>
        {h && (
          <>
            <section aria-labelledby="today-drive" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="today-drive" className="text-lg font-semibold">Driving today</h2>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {formatHours(Math.max(0, h.dailyDriveLimit - h.today.hours))}
                  </span>{' '}
                  left of {h.dailyDriveLimit}h
                </p>
              </div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={h.dailyDriveLimit}
                aria-valuenow={h.today.hours}
                aria-label="Driving hours used today"
                className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200"
              >
                <div
                  className={`h-full ${h.today.hours / h.dailyDriveLimit > 0.85 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (h.today.hours / h.dailyDriveLimit) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {formatHours(h.today.hours)} on the road since you started your journey. Official ELD hours
                will replace this once Samsara is connected.
              </p>
            </section>

            <section aria-labelledby="totals" className="mt-8">
              <h2 id="totals" className="sr-only">Hours and earnings by period</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Period</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Hours run</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(
                      [
                        ['Today', h.today],
                        ['This week', h.week],
                        ['This month', h.month],
                        ['Year to date', h.ytd],
                      ] as const
                    ).map(([label, p]) => (
                      <tr key={label}>
                        <th scope="row" className="px-4 py-3 font-medium">{label}</th>
                        <td className="px-4 py-3 text-right tabular-nums">{formatHours(p.hours)}</td>
                        <td className="px-4 py-3 text-right text-lg font-semibold tabular-nums">
                          {formatMoney(p.earnings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {h.ytd.unpricedHours > 0 && (
                <p className="mt-3 text-sm text-slate-500">
                  {formatHours(h.ytd.unpricedHours)} this year were on per-mile or percentage pay. Those earnings are
                  worked out at settlement and aren’t included above.
                </p>
              )}
            </section>
          </>
        )}
      </AsyncState>
    </div>
  );
}
