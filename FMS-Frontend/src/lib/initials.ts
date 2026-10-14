// [FRONTEND · React] src/lib/initials.ts
/**
 * The two letters shown when someone has no photo: first letter of the first name + first letter of the last name.
 * `initialsFromName` is for a single "First Last" string (a middle name is ignored: first word + last word).
 */
export function initialsOf(firstName: string | null | undefined, lastName: string | null | undefined): string {
  const a = (firstName ?? '').trim().charAt(0);
  const b = (lastName ?? '').trim().charAt(0);
  const out = `${a}${b}`.toUpperCase();
  return out || '?';
}

export function initialsFromName(fullName: string | null | undefined): string {
  const words = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return initialsOf(words[0], words[words.length - 1]);
}
