// [FRONTEND · React] src/components/trips/TripDocumentsBar.tsx
// One line per ride on the dispatcher's page: how many documents the ride has, and a single button that
// downloads ALL of them as one ZIP (today the proof of delivery; later BOL, itinerary, immigration papers).
import { useState } from 'react';
import { dispatcherApi, errorMessage } from '../../lib/fleetApi';
import { DOCUMENT_LABEL } from '../../lib/documents';
import { formatFileSize } from '../../lib/format';
import type { Trip } from '../../types/trips';

export default function TripDocumentsBar({ trip }: { trip: Trip }) {
  const [busy, setBusy] = useState<'zip' | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const docs = trip.documents;

  async function run(which: 'zip' | number, action: () => Promise<void>) {
    setBusy(which);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  if (docs.length === 0) {
    return <p className="text-sm text-slate-500">No documents uploaded for this ride yet.</p>;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p>
          <span className="font-semibold">Documents</span> · {docs.length} {docs.length === 1 ? 'file' : 'files'}
        </p>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void run('zip', () => dispatcherApi.downloadTripDocuments(trip))}
          className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {busy === 'zip' ? 'Preparing…' : `Download all (${docs.length})`}
        </button>
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-slate-600">Show files</summary>
        <ul className="mt-2 space-y-2">
          {docs.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {DOCUMENT_LABEL[f.docType]} <span className="text-slate-500">· {f.downloadName} · {formatFileSize(f.sizeBytes)}</span>
              </span>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void run(f.id, () => dispatcherApi.downloadDocument(f))}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 font-medium hover:bg-slate-50 disabled:opacity-60"
                aria-label={`Download ${f.downloadName}`}
              >
                {busy === f.id ? 'Downloading…' : 'Download'}
              </button>
            </li>
          ))}
        </ul>
      </details>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
    </div>
  );
}
