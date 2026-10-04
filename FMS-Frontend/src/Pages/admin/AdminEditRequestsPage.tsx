// [FRONTEND · React] src/pages/admin/AdminEditRequestsPage.tsx
// Admin: dispatcher requests for extra time edits. Approving opens an editing window for that whole
// organization (30 min / 1 h / 2 h / 3 h / 4 h); the window can be ended early.
import { useState } from 'react';
import AsyncState from '../../components/common/AsyncState';
import { useApiData } from '../../hooks/useApiData';
import { adminApi, errorMessage } from '../../lib/fleetApi';
import { formatDateTime, formatMinutesLeft } from '../../lib/format';
import type { AdminEditRequest } from '../../types/admin';

const DURATIONS = [
  { minutes: 30, label: '30 minutes' },
  { minutes: 60, label: '1 hour' },
  { minutes: 120, label: '2 hours' },
  { minutes: 180, label: '3 hours' },
  { minutes: 240, label: '4 hours' },
];

const field =
  'rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';
const btn =
  'rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60';

function PendingRow({ request, onDecided }: { request: AdminEditRequest; onDecided: () => Promise<void> }) {
  const [minutes, setMinutes] = useState(60);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onDecided();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <li className="space-y-3 p-4">
      <div>
        <p className="font-medium">
          {request.orgName} <span className="font-normal text-slate-500">· asked by {request.requestedByName ?? 'a dispatcher'} on {formatDateTime(request.createdAt)}</span>
        </p>
        {request.tripReference && (
          <p className="text-sm text-slate-600">About {request.tripReference} · {request.checkpointLabel}</p>
        )}
        <p className="mt-1 text-sm">“{request.reason}”</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={`dur-${request.id}`} className="mb-1 block text-sm font-medium">Open editing for</label>
          <select id={`dur-${request.id}`} className={field} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {DURATIONS.map((d) => <option key={d.minutes} value={d.minutes}>{d.label}</option>)}
          </select>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void decide(() => adminApi.approveEditRequest(request.id, minutes))}
          className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}
        >
          Approve
        </button>
        <div>
          <label htmlFor={`note-${request.id}`} className="mb-1 block text-sm font-medium">Reason if denying (optional)</label>
          <input id={`note-${request.id}`} className={`${field} w-56`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void decide(() => adminApi.denyEditRequest(request.id, note))}
          className={`${btn} border border-slate-300 bg-white hover:bg-slate-50`}
        >
          Deny
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Approving lets every dispatcher of {request.orgShortName} change step times any number of times until the window ends. Each change is logged.
      </p>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </li>
  );
}

function ActiveRow({ request, onDecided }: { request: AdminEditRequest; onDecided: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function revoke() {
    setBusy(true);
    setError(null);
    try {
      await adminApi.revokeEditWindow(request.id);
      await onDecided();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-medium">{request.orgName}</p>
        <p className="text-sm text-slate-600">
          Open for {request.remainingSeconds !== null ? formatMinutesLeft(request.remainingSeconds) : '—'} more (until{' '}
          {formatDateTime(request.windowExpiresAt)}) · approved by {request.decidedByName ?? 'an admin'}
        </p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
      <button type="button" disabled={busy} onClick={() => void revoke()} className={`${btn} border border-red-300 bg-white text-red-700 hover:bg-red-50`}>
        End now
      </button>
    </li>
  );
}

const OUTCOME: Record<AdminEditRequest['status'], string> = {
  pending: 'Waiting',
  approved: 'Approved',
  denied: 'Denied',
  cancelled: 'Cancelled by dispatcher',
};

export default function AdminEditRequestsPage() {
  const pendingQ = useApiData(adminApi.listPendingEditRequests, 15_000);
  const activeQ = useApiData(adminApi.listActiveEditWindows, 15_000);
  const historyQ = useApiData(adminApi.listEditRequestHistory, 60_000);

  const refreshAll = async () => {
    await Promise.all([pendingQ.reload(), activeQ.reload(), historyQ.reload()]);
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit requests</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Dispatchers can correct each step’s times once on their own. When they need more (for example after a
          software outage), they ask here. Approving opens an editing window for that whole organization.
        </p>
      </div>

      <section aria-labelledby="pending-h">
        <h2 id="pending-h" className="mb-3 text-lg font-semibold">Waiting for a decision</h2>
        <AsyncState loading={pendingQ.loading} error={pendingQ.error} hasData={!!pendingQ.data} onRetry={() => void pendingQ.reload()}>
          {(pendingQ.data ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">No requests waiting.</p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {(pendingQ.data ?? []).map((r) => <PendingRow key={r.id} request={r} onDecided={refreshAll} />)}
            </ul>
          )}
        </AsyncState>
      </section>

      <section aria-labelledby="active-h">
        <h2 id="active-h" className="mb-3 text-lg font-semibold">Editing windows open now</h2>
        <AsyncState loading={activeQ.loading} error={activeQ.error} hasData={!!activeQ.data} onRetry={() => void activeQ.reload()}>
          {(activeQ.data ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">No organization has editing unlocked.</p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {(activeQ.data ?? []).map((r) => <ActiveRow key={r.id} request={r} onDecided={refreshAll} />)}
            </ul>
          )}
        </AsyncState>
      </section>

      <section aria-labelledby="history-h">
        <h2 id="history-h" className="mb-3 text-lg font-semibold">Recent decisions</h2>
        <AsyncState loading={historyQ.loading} error={historyQ.error} hasData={!!historyQ.data} onRetry={() => void historyQ.reload()}>
          {(historyQ.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Nothing decided yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Organization</th>
                    <th scope="col" className="px-4 py-3 font-medium">Asked by</th>
                    <th scope="col" className="px-4 py-3 font-medium">Reason</th>
                    <th scope="col" className="px-4 py-3 font-medium">Outcome</th>
                    <th scope="col" className="px-4 py-3 font-medium">Decided</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(historyQ.data ?? []).map((r) => (
                    <tr key={r.id} className="align-top">
                      <td className="px-4 py-3">{r.orgName}</td>
                      <td className="px-4 py-3">{r.requestedByName ?? '—'}</td>
                      <td className="px-4 py-3 max-w-xs">{r.reason}</td>
                      <td className="px-4 py-3">
                        {OUTCOME[r.status]}
                        {r.status === 'approved' && r.durationMinutes !== null && (
                          <span className="text-slate-500"> · {DURATIONS.find((d) => d.minutes === r.durationMinutes)?.label ?? `${r.durationMinutes} min`}{r.revokedAt ? ' (ended early)' : ''}</span>
                        )}
                        {r.decisionNote && <p className="text-slate-500">“{r.decisionNote}”</p>}
                      </td>
                      <td className="px-4 py-3">
                        {formatDateTime(r.decidedAt)}
                        {r.decidedByName && <p className="text-slate-500">{r.decidedByName}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncState>
      </section>
    </div>
  );
}
