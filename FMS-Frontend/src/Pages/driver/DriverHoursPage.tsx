import { formatHours, formatMoney } from '../../lib/format';
import { mockHours } from '../../mocks/drivers';

// API swap later: fetch from GET /api/drivers/me/hours (Samsara-backed HOS + settlement data).
export default function DriverHoursPage() {
  const h = mockHours;
  const rows = [
    { label: 'Today', ...h.today },
    { label: 'This week', ...h.week },
    { label: 'This month', ...h.month },
    { label: 'Year to date', ...h.ytd },
  ];
  const remaining = Math.max(0, h.dailyDriveLimit - h.today.hours);
  const usedPct = Math.min(100, (h.today.hours / h.dailyDriveLimit) * 100);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Hours & pay</h1>

      <section aria-labelledby="today-drive" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="today-drive" className="text-lg font-semibold">Driving today</h2>
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{formatHours(remaining)}</span> left of{' '}
            {h.dailyDriveLimit}h
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
            className={`h-full ${usedPct > 85 ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {formatHours(h.today.hours)} driven so far. Placeholder numbers until ELD data is connected.
        </p>
      </section>

      <section aria-labelledby="totals">
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
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="px-4 py-3 font-medium">{r.label}</th>
                  <td className="px-4 py-3 text-right tabular-nums">{formatHours(r.hours)}</td>
                  <td className="px-4 py-3 text-right text-lg font-semibold tabular-nums">
                    {formatMoney(r.earnings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
