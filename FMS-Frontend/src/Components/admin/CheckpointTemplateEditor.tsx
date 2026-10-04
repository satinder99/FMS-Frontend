// [FRONTEND · React] src/components/admin/CheckpointTemplateEditor.tsx
// The editor for the steps ("checkpoints") every trip of an organization will go through, in order.
// Each row is a standard step picked from a drop-down, or "Other" with a text box for a custom name.
// Used when onboarding an organization and when an admin changes an existing organization's steps.
import { MAX_STEPS, newDraft, standardDrafts } from '../../lib/orgValidation';
import type { CheckpointPreset, TemplateStepDraft } from '../../types/admin';

interface Props {
  presets: CheckpointPreset[];
  value: TemplateStepDraft[];
  onChange: (next: TemplateStepDraft[]) => void;
  /** Used to build unique ids; also the id of the whole editor (so a form can focus it when it has an error) */
  idPrefix: string;
  error?: string;
}

const field =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';
const small =
  'rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function CheckpointTemplateEditor({ presets, value, onChange, idPrefix, error }: Props) {
  const update = (index: number, patch: Partial<TemplateStepDraft>) =>
    onChange(value.map((d, i) => (i === index ? { ...d, ...patch } : d)));

  const choose = (index: number, choice: string) => {
    const preset = presets.find((p) => p.key === choice);
    update(index, { choice, crossBorderOnly: preset ? preset.crossBorderOnly : false, ...(choice === 'other' ? {} : { label: '' }) });
  };

  const move = (index: number, by: -1 | 1) => {
    const target = index + by;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const usedElsewhere = (key: string, index: number) => value.some((d, i) => i !== index && d.choice === key);

  return (
    <div id={idPrefix} tabIndex={-1} className="space-y-3 focus:outline-none">
      <p className="text-sm text-slate-600">
        These are the steps a driver goes through on every trip of this organization, in this order. Pick standard
        steps from the list, or choose “Other” to type your own. Changes apply to trips created from now on; trips
        that already exist keep the steps they have.
      </p>

      {value.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="mb-3 text-sm text-slate-700">No steps yet.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className={small} onClick={() => onChange(standardDrafts(presets))}>
              Start from the standard steps
            </button>
            <button type="button" className={small} onClick={() => onChange([newDraft()])}>
              Add a step myself
            </button>
          </div>
        </div>
      ) : (
        <ol className="space-y-2">
          {value.map((d, i) => (
            <li key={d.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-start gap-3">
                <span className="mt-2 w-6 shrink-0 text-sm font-semibold tabular-nums text-slate-500" aria-hidden>
                  {i + 1}
                </span>

                <div className="min-w-[14rem] flex-1 space-y-2">
                  <label htmlFor={`${idPrefix}-${d.id}-choice`} className="sr-only">Step {i + 1}</label>
                  <select id={`${idPrefix}-${d.id}-choice`} className={field} value={d.choice} onChange={(e) => choose(i, e.target.value)}>
                    <option value="">Choose a step…</option>
                    {presets.map((p) => (
                      <option key={p.key} value={p.key} disabled={usedElsewhere(p.key, i)}>
                        {p.label}
                        {usedElsewhere(p.key, i) ? ' (already added)' : ''}
                      </option>
                    ))}
                    <option value="other">Other (type your own)…</option>
                  </select>

                  {d.choice === 'other' && (
                    <>
                      <label htmlFor={`${idPrefix}-${d.id}-label`} className="sr-only">Name of step {i + 1}</label>
                      <input
                        id={`${idPrefix}-${d.id}-label`}
                        className={field}
                        value={d.label}
                        maxLength={60}
                        placeholder="e.g. Weigh station"
                        onChange={(e) => update(i, { label: e.target.value })}
                      />
                    </>
                  )}
                </div>

                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={d.crossBorderOnly} onChange={(e) => update(i, { crossBorderOnly: e.target.checked })} />
                  Only for cross-border trips
                </label>

                <div className="flex gap-1">
                  <button type="button" className={small} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move step ${i + 1} up`}>↑</button>
                  <button type="button" className={small} disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Move step ${i + 1} down`}>↓</button>
                  <button type="button" className={small} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove step ${i + 1}`}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={small} disabled={value.length >= MAX_STEPS} onClick={() => onChange([...value, newDraft()])}>
            Add a step
          </button>
          <span className="text-sm text-slate-500">{value.length} {value.length === 1 ? 'step' : 'steps'}</span>
        </div>
      )}
    </div>
  );
}
