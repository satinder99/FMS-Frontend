// [FRONTEND · React] src/components/common/Avatar.tsx
// A person's photo, or — when there is no photo (or it fails to load) — a round icon with their two initials.
import { useState } from 'react';
import { initialsFromName, initialsOf } from '../../lib/initials';

type Size = 'sm' | 'md' | 'lg';

const SIZE: Record<Size, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

// A few calm colours, picked from the name so the same person always gets the same one.
const TONES = [
  'bg-sky-100 text-sky-900',
  'bg-emerald-100 text-emerald-900',
  'bg-violet-100 text-violet-900',
  'bg-rose-100 text-rose-900',
  'bg-amber-100 text-amber-900',
  'bg-teal-100 text-teal-900',
];

function toneFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

interface Props {
  /** Either first + last name, or one full name */
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  photoUrl?: string | null;
  size?: Size;
  className?: string;
}

export default function Avatar({ firstName, lastName, name, photoUrl, size = 'md', className = '' }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const fullName = name ?? `${firstName ?? ''} ${lastName ?? ''}`.trim();
  const initials = name != null ? initialsFromName(name) : initialsOf(firstName, lastName);
  const showPhoto = !!photoUrl && photoUrl !== failedUrl;

  if (showPhoto) {
    return (
      <img
        src={photoUrl}
        alt={fullName ? `Photo of ${fullName}` : 'Profile photo'}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(photoUrl)}
        className={`${SIZE[size]} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={fullName || 'Person'}
      className={`${SIZE[size]} ${toneFor(fullName)} inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${className}`}
    >
      {initials}
    </span>
  );
}
