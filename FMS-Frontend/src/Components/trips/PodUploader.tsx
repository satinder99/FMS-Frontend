// [FRONTEND · React] src/components/trips/PodUploader.tsx
// The driver adds the proof of delivery on the "Upload POD" step: take a photo with the camera, or choose a
// photo / PDF from the gallery or the device. A preview is shown BEFORE uploading, so an unreadable photo can
// be retaken. The step cannot be completed until at least one file is uploaded. Files can be removed only
// while the step is still open.
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { driverApi, errorMessage } from '../../lib/fleetApi';
import { MAX_UPLOAD_BYTES, UPLOAD_ACCEPT } from '../../lib/documents';
import { formatDateTime, formatFileSize } from '../../lib/format';
import type { Checkpoint, Trip } from '../../types/trips';

interface Props {
  trip: Trip;
  step: Checkpoint;
  onChanged: () => Promise<void> | void;
}

const button =
  'rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';
const primary =
  'rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function PodUploader({ trip, step, onChanged }: Props) {
  const files = trip.documents.filter((d) => d.docType === 'pod');
  const open = step.status === 'in_progress';

  const [chosen, setChosen] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Only formats every browser can draw. (An iPhone HEIC photo is uploaded fine but cannot be previewed.)
  const previewUrl = useMemo(
    () => (chosen && /^image\/(jpeg|png|webp)$/.test(chosen.type) ? URL.createObjectURL(chosen) : null),
    [chosen],
  );
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // so choosing the same file again still triggers a change
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setChosen(null);
      return setError(`That file is ${formatFileSize(file.size)}. The limit is 15 MB: retake the photo or choose a smaller file.`);
    }
    setError(null);
    setChosen(file);
  }

  async function upload() {
    if (!chosen) return;
    setBusy(true);
    setError(null);
    try {
      await driverApi.uploadPod(trip.id, chosen);
      setChosen(null);
      await onChanged();
    } catch (err) {
      setError(errorMessage(err)); // the chosen file is kept, so a dropped connection just needs another tap
    } finally {
      setBusy(false);
    }
  }

  async function remove(docId: number) {
    setBusy(true);
    setError(null);
    try {
      await driverApi.deleteDocument(docId);
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="pod-heading" className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h4 id="pod-heading" className="font-semibold">Proof of delivery</h4>

      {files.length > 0 && (
        <ul className="divide-y divide-slate-100 text-sm">
          {files.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                <span className="font-medium">{f.filename}</span>{' '}
                <span className="text-slate-500">· {formatFileSize(f.sizeBytes)} · {formatDateTime(f.uploadedAt)}</span>
              </span>
              {open && (
                <button type="button" disabled={busy} onClick={() => void remove(f.id)} className="text-red-700 underline disabled:opacity-60">
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {open ? (
        chosen ? (
          <div className="space-y-3">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview of the photo you chose" className="max-h-72 w-full rounded-md border border-slate-200 object-contain" />
            ) : (
              <p className="rounded-md bg-slate-100 px-3 py-2 text-sm">{chosen.name} · {formatFileSize(chosen.size)}</p>
            )}
            <p className="text-sm text-slate-600">Is the whole page in view and easy to read? If not, choose another.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => void upload()} className={primary}>
                {busy ? 'Uploading…' : 'Upload'}
              </button>
              <button type="button" disabled={busy} onClick={() => setChosen(null)} className={button}>Choose another</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              {files.length === 0
                ? 'Add a clear photo (or PDF) of the signed delivery paper. You cannot complete this step until it is uploaded.'
                : 'Need another page? Add it here.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={button} onClick={() => cameraInput.current?.click()}>Take a photo</button>
              <button type="button" className={button} onClick={() => fileInput.current?.click()}>Choose a photo or file</button>
            </div>
            {/* "capture" opens the camera straight away on a phone; the second input offers the gallery / files. */}
            <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
            <input ref={fileInput} type="file" accept={UPLOAD_ACCEPT} className="hidden" onChange={onPick} />
          </div>
        )
      ) : files.length === 0 ? (
        <p className="text-sm text-slate-500">No file was uploaded.</p>
      ) : null}

      {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
    </section>
  );
}
