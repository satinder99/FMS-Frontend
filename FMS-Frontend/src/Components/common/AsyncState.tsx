// [FRONTEND · React] src/components/common/AsyncState.tsx
import type { ReactNode } from 'react';

interface Props {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  onRetry: () => void;
  children: ReactNode;
}

/** Shows loading / error until data exists; afterwards keeps showing the last good data. */
export default function AsyncState({ loading, error, hasData, onRetry, children }: Props) {
  if (!hasData && loading) return <p className="text-sm text-slate-500">Loading…</p>;

  if (!hasData && error) {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>{error}</p>
        <button type="button" onClick={onRetry} className="mt-2 font-medium underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p role="status" className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Couldn’t refresh just now. Showing the last data we loaded.
        </p>
      )}
      {children}
    </>
  );
}
