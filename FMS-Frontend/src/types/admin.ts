import type { RoleName } from './roles';

export interface Organization {
  id: number;
  name: string;
  short_name: string;
}

/** Mirrors the backend's toSafeUser() shape (subset used by the admin screens). */
export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  org_id: number | null;
  role_name: RoleName | null;
  status: 'active' | 'suspended';
  created_at: string;
}
