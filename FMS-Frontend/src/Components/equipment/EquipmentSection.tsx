// [FRONTEND · React] src/components/equipment/EquipmentSection.tsx
// One table + add form, used for BOTH trucks and trailers.
import { useCallback, useState } from 'react';
import AsyncState from '../common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';
import type { EquipmentKind, EquipmentStatus, Ownership } from '../../types/trips';

interface Props {
  kind: EquipmentKind;
  drivers: { id: number; name: string }[];
}

const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  active: 'In service',
  maintenance: 'In maintenance',
  retired: 'Retired',
};

export default function EquipmentSection({ kind, drivers }: Props) {
  const noun = kind === 'truck' ? 'truck' : 'trailer';
  const fetcher = useCallback(() => dispatcherApi.listEquipment(kind), [kind]);
  const { data, error, loading, reload } = useApiData(fetcher);

  const [unitNumber, setUnitNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [ownership, setOwnership] = useState<Ownership>('company');
  // '' = not chosen yet, 'outside' = someone outside the company, otherwise a driver id
  const [ownerChoice, setOwnerChoice] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  async function handleAdd() {
    if (!unitNumber.trim()) return setFormError('Enter the unit number.');
    if (ownership === 'owner_operator') {
      if (!ownerChoice) return setFormError('Say who owns it.');
      if (ownerChoice === 'outside' && !ownerName.trim()) return setFormError('Enter the owner’s name.');
    }
    setSaving(true);
    setFormError(null);
    try {
      await dispatcherApi.createEquipment(kind, {
        unitNumber: unitNumber.trim(),
        plateNumber: plateNumber.trim() || undefined,
        ownership,
        ...(ownership === 'owner_operator'
          ? ownerChoice === 'outside'
            ? { ownerName: ownerName.trim() }
            : { ownerDriverId: Number(ownerChoice) }
          : {}),
      });
      setUnitNumber('');
      setPlateNumber('');
      setOwnership('company');
      setOwnerChoice('');
      setOwnerName('');
      await reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(id: number, status: EquipmentStatus) {
    setRowError(null);
    try {
      await dispatcherApi.updateEquipmentStatus(kind, id, status);
      await reload();
    } catch (err) {
      setRowError(errorMessage(err));
    }
  }

  const headingId = `${kind}-heading`;

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <h2 id={headingId} className="text-lg font-semibold capitalize">{noun}s</h2>

      <AsyncState loading={loading} error={error} hasData={!!data} onRetry={() => void reload()}>
        {rowError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{rowError}</p>
        )}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Unit</th>
                <th scope="col" className="px-4 py-3 font-medium">Plate</th>
                <th scope="col" className="px-4 py-3 font-medium">Owner</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No {noun}s yet. Add your first one below.
                  </td>
                </tr>
              )}
              {(data ?? []).map((u) => (
                <tr key={u.id} className={u.status === 'retired' ? 'text-slate-400' : ''}>
                  <th scope="row" className="px-4 py-3 font-medium tabular-nums">{u.unitNumber}</th>
                  <td className="px-4 py-3">{u.plateNumber ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.ownership === 'company' ? (
                      'Company'
                    ) : (
                      <>
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-800">
                          Owner-operator
                        </span>{' '}
                        {u.ownerLabel}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`${kind}-status-${u.id}`}>Status of {u.unitNumber}</label>
                    <select
                      id={`${kind}-status-${u.id}`}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                      value={u.status}
                      onChange={(e) => void handleStatus(u.id, e.target.value as EquipmentStatus)}
                    >
                      {(Object.keys(STATUS_LABEL) as EquipmentStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncState>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 font-medium">Add a {noun}</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor={`${kind}-unit`} className="mb-1 block text-sm font-medium">Unit number</label>
            <input id={`${kind}-unit`} className={fieldClass} value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${kind}-plate`} className="mb-1 block text-sm font-medium">Plate (optional)</label>
            <input id={`${kind}-plate`} className={fieldClass} value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${kind}-ownership`} className="mb-1 block text-sm font-medium">Who owns it</label>
            <select
              id={`${kind}-ownership`}
              className={fieldClass}
              value={ownership}
              onChange={(e) => {
                setOwnership(e.target.value as Ownership);
                setOwnerChoice('');
              }}
            >
              <option value="company">The company</option>
              <option value="owner_operator">A person (owner-operator)</option>
            </select>
          </div>
        </div>

        {ownership === 'owner_operator' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${kind}-owner`} className="mb-1 block text-sm font-medium">Owner</label>
              <select id={`${kind}-owner`} className={fieldClass} value={ownerChoice} onChange={(e) => setOwnerChoice(e.target.value)}>
                <option value="">Select the owner…</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
                <option value="outside">Someone outside the company</option>
              </select>
            </div>
            {ownerChoice === 'outside' && (
              <div>
                <label htmlFor={`${kind}-owner-name`} className="mb-1 block text-sm font-medium">Owner’s name</label>
                <input id={`${kind}-owner-name`} className={fieldClass} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>
            )}
          </div>
        )}

        {formError && <p role="alert" className="mt-3 text-sm text-red-700">{formError}</p>}
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleAdd()}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {saving ? 'Adding…' : `Add ${noun}`}
        </button>
      </div>
    </section>
  );
}
