// [FRONTEND · React] src/lib/format.ts   (YOUR EXISTING FILE: step time helpers were added at the bottom)
const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const formatDateTime = (iso: string | null): string =>
  iso ? dateTime.format(new Date(iso)) : '—';

export function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}m`;
}

// TODO: confirm pay currency (USD vs CAD) — becomes an org setting later.
export const CURRENCY = 'USD';
export const formatMoney = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY }).format(amount);

export function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

// ---- step (checkpoint) time helpers ----------------------------------------------------------------

/** "35 min" / "1 h 05 min" between two ISO times; '' when either is missing. */
export function formatDuration(startIso: string | null, endIso: string | null): string {
  if (!startIso || !endIso) return '';
  const minutes = Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')} min`;
}

/** "about 12 min" from a number of seconds. */
export function formatMinutesLeft(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  if (minutes <= 1) return 'less than a minute';
  if (minutes < 60) return `about ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `about ${h} h` : `about ${h} h ${m} min`;
}

/** ISO time -> the value a <input type="datetime-local"> expects, in the viewer's own timezone. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The value of a <input type="datetime-local"> (local time) -> an ISO string with a timezone. */
export const fromLocalInput = (value: string): string => new Date(value).toISOString();

/** 2.1 MB / 340 KB */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
