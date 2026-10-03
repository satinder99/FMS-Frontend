// [FRONTEND · React] src/pages/dispatcher/DriverPayRatesPage.tsx
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router';
import AsyncState from '../../components/common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';
import { formatMoney } from '../../lib/format';
import type { PayRate, PayType } from '../../types/trips';

const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

const COMBOS = [
  { value: 'false-false', label: 'Equipment they don’t own', ownTruck: false, ownTrailer: false },
  { value: 'true-false', label: 'Their own truck', ownTruck: true, ownTrailer: false },
  { value: 'false-true', label: 'Their own trailer', ownTruck: false, ownTrailer: true },
  { value: 'true-true', label: 'Their own truck and trailer', ownTruck: true, ownTrailer: true },
];
const comboLabel = (r: Pick<PayRate, 'ownTruck' | 'ownTrailer'>) =>
  COMBOS.find((c) => c.ownTruck === r.ownTruck && c.ownTrailer === r.ownTrailer)?.label ?? '';

const PAY_TYPES: { value: PayType; label: string }[] = [
  { value: 'hourly', label: 'Per hour' },
  { value: 'per_mile', label: 'Per mile' },
  { value: 'percentage', label: 'Percentage of load' },
  { value: 'salary', label: 'Salary' },
];

function formatRate(r: Pick<PayRate, 'payType' | 'payRate'>): string {
  switch (r.payType) {
    case 'hourly':
      return `${formatMoney(r.payRate)} / hour`;
    case 'per_mile':
      return `${formatMoney(r.payRate)} / mile`;
    case 'percentage':
      return `${r.payRate}% of load`;
    case 'salary':
      return `${formatMoney(r.payRate)} salary`;
  }
}

const todayLocal = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function DriverPayRatesPage() {
  const { driverId } = useParams();
  const id = Number(driverId);
  const fetcher = useCallback(() => dispatcherApi.listPayRates(id), [id]);
  const { data, error, loading, reload } = useApiData(fetcher);

  const [combo, setCombo] = useState('false-false');
  const [payType, setPayType] = useState<PayType>('hourly');
  const [rate, setRate] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(todayLocal);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleAdd() {
    const amount = Number(rate);
    if (rate.trim() === '' || !Number.isFinite(amount) || amount < 0) {
      return setFormError('Enter a rate of 0 or more.');
    }
    const chosen = COMBOS.find((c) => c.value === combo)!;
    setSaving(true);
    setFormError(null);
    try {
      await dispatcherApi.addPayRate(id, {
        ownTruck: chosen.ownTruck,
        ownTrailer: chosen.ownTrailer,
        payType,
        payRate: amount,
        effectiveFrom,
      });
      setRate('');
      await reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // The rate currently in force for each equipment combination = newest row dated today or earlier.
  const today = todayLocal();
  const currentIds = new Set<number>();
  for (const c of COMBOS) {
    const inForce = (data?.rates ?? []).find(
      (r) => r.ownTruck === c.ownTruck && r.ownTrailer === c.ownTrailer && r.effectiveFrom <= today,
    );
    if (inForce) currentIds.add(inForce.id);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to={`/dispatcher/drivers/${id}`} className="text-sm text-sky-700 underline-offset-2 hover:underline">
          ← Back to driver
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Pay rates{data ? ` · ${data.driver.name}` : ''}
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          A trip uses the rate that matches whose truck and trailer the driver is running, as of the pickup date.
          Rates are never edited: to give a raise, add a new rate with a later effective date.
        </p>
      </div>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Equipment</th>
                <th scope="col" className="px-4 py-3 font-medium">Rate</th>
                <th scope="col" className="px-4 py-3 font-medium">Effective from</th>
                <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">In force</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.rates ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No rates yet. Trips can’t be assigned to this driver until you add one.
                  </td>
                </tr>
              )}
              {(data?.rates ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{comboLabel(r)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatRate(r)}</td>
                  <td className="px-4 py-3 tabular-nums">{r.effectiveFrom}</td>
                  <td className="px-4 py-3">
                    {currentIds.has(r.id) && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800">
                        In force now
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncState>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-medium">Add a rate</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="combo" className="mb-1 block text-sm font-medium">When the driver is running</label>
            <select id="combo" className={fieldClass} value={combo} onChange={(e) => setCombo(e.target.value)}>
              {COMBOS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pay-type" className="mb-1 block text-sm font-medium">Paid</label>
            <select id="pay-type" className={fieldClass} value={payType} onChange={(e) => setPayType(e.target.value as PayType)}>
              {PAY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rate" className="mb-1 block text-sm font-medium">
              {payType === 'percentage' ? 'Percent' : 'Amount'}
            </label>
            <input id="rate" type="number" min="0" step="0.01" className={fieldClass} value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="effective" className="mb-1 block text-sm font-medium">Effective from</label>
            <input id="effective" type="date" className={fieldClass} value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
          </div>
        </div>

        {payType !== 'hourly' && (
          <p className="mt-3 text-sm text-slate-600">
            Only hourly pay shows up as dollars on the driver’s Hours & pay screen today. Per-mile, percentage and
            salary earnings are worked out at settlement, once trip distance and load revenue are tracked.
          </p>
        )}
        {formError && <p role="alert" className="mt-3 text-sm text-red-700">{formError}</p>}
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleAdd()}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {saving ? 'Saving…' : 'Add rate'}
        </button>
      </div>
    </div>
  );
}
