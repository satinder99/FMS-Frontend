// [FRONTEND · React] src/components/trips/StepDocuments.tsx
// The files that belong to one step (e.g. the proof of delivery under the "Upload POD" step), with a
// Download button for dispatchers.
import { useState } from 'react';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';
import { DOCUMENT_LABEL } from '../../lib/documents';
import { formatDateTime, formatFileSize } from '../../lib/format';
import type { Checkpoint, Trip } from '../../types/trips';

interface Props {
  trip: Trip;
  cp: Checkpoint;
  /** Dispatchers can download; drivers only see what they uploaded */
  canDownload: boolean;
}

export default function StepDocuments({ trip, cp, canDownload }: Props) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const files = trip.documents.filter((d) => d.checkpointKey === cp.key);
  if (files.length === 0) return null;

  async function download(doc: (typeof files)[number]) {
    setBusyId(doc.id);
    setError(null);
    try {
      await dispatcherApi.downloadDocument(doc);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center justify-between gap-2">
            <span>
              <span className="font-medium">{DOCUMENT_LABEL[f.docType]}</span>{' '}
              <span className="text-slate-600">
                · {f.filename} · {formatFileSize(f.sizeBytes)} · {formatDateTime(f.uploadedAt)}
                {f.uploadedByName ? ` · ${f.uploadedByName}` : ''}
              </span>
            </span>
            {canDownload && (
              <button
                type="button"
                disabled={busyId === f.id}
                onClick={() => void download(f)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                aria-label={`Download ${DOCUMENT_LABEL[f.docType]} ${f.filename}`}
              >
                {busyId === f.id ? 'Downloading…' : 'Download'}
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
    </div>
  );
}
