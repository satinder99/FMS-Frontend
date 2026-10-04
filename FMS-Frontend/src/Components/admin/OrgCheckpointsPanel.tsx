// [FRONTEND · React] src/components/admin/OrgCheckpointsPanel.tsx
// Admin: see and change the steps of an EXISTING organization (set at onboarding). Applies to new trips only.
import { useCallback, useState } from 'react';
import AsyncState from '../common/AsyncState';
import CheckpointTemplateEditor from './CheckpointTemplateEditor';
import { useApiData } from '../../hooks/useApiData';
import { adminApi, errorMessage } from '../../lib/fleetApi';
import { draftsToPayload, stepsToDrafts, templateProblems } from '../../lib/orgValidation';
import type { TemplateStepDraft } from '../../types/admin';

export default function OrgCheckpointsPanel({ orgId }: { orgId: number }) {
  const fetchSteps = useCallback(() => adminApi.orgCheckpoints(orgId), [orgId]);
  const stepsQ = useApiData(fetchSteps);
  const presetsQ = useApiData(adminApi.checkpointPresets);

  const [drafts, setDrafts] = useState<TemplateStepDraft[] | null>(null); // null = just viewing
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = stepsQ.data ?? [];
  const presets = presetsQ.data ?? [];

  async function save() {
    if (!drafts) return;
    const problem = templateProblems(drafts, presets);
    if (problem) return setError(problem);
    setSaving(true);
    setError(null);
    try {
      await adminApi.saveOrgCheckpoints(orgId, draftsToPayload(drafts));
      await stepsQ.reload();
      setDrafts(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="trip-steps" className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="trip-steps" className="text-lg font-semibold">Trip steps</h2>
        {drafts === null && stepsQ.data && presetsQ.data && (
          <button
            type="button"
            onClick={() => { setError(null); setDrafts(stepsToDrafts(steps)); }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {steps.length === 0 ? 'Set up steps' : 'Edit steps'}
          </button>
        )}
      </div>

      <AsyncState
        loading={stepsQ.loading || presetsQ.loading}
        error={stepsQ.error ?? presetsQ.error}
        hasData={!!stepsQ.data && !!presetsQ.data}
        onRetry={() => { void stepsQ.reload(); void presetsQ.reload(); }}
      >
        {drafts !== null ? (
          <div className="space-y-4">
            <CheckpointTemplateEditor presets={presets} value={drafts} onChange={setDrafts} idPrefix="org-steps" error={error ?? undefined} />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {saving ? 'Saving…' : 'Save steps'}
              </button>
              <button type="button" onClick={() => setDrafts(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        ) : steps.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This organization has no trip steps yet, so its dispatchers cannot create trips. Set them up first.
          </p>
        ) : (
          <>
            <ol className="space-y-1.5">
              {steps.map((s, i) => (
                <li key={s.key} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="w-6 tabular-nums text-slate-400">{i + 1}</span>
                  <span className="font-medium">{s.label}</span>
                  {s.isCustom && <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-800">custom</span>}
                  {s.crossBorderOnly && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-800">cross-border only</span>}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-slate-500">Changes apply to trips created from now on; trips that already exist keep their steps.</p>
          </>
        )}
      </AsyncState>
    </section>
  );
}
