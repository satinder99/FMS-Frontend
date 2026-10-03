import type { AuthUser } from '../types/auth';
import type { RoleName } from '../types/roles';

/** Admin is platform-level (no org). Everyone else needs both a role and an org. */
export function isAssigned(user: Pick<AuthUser, 'role_name' | 'org_id'>): boolean {
  if (!user.role_name) return false;
  if (user.role_name === 'admin') return true;
  return user.org_id != null;
}

export function getHomePathForUser(user: AuthUser | null): string {
  if (!user) return '/login';
  if (!isAssigned(user)) return '/pending-assignment';
  switch (user.role_name as RoleName) {
    case 'admin':
      return '/admin';
    case 'dispatcher':
      return '/dispatcher';
    case 'driver':
      return '/driver';
    default:
      return '/pending-assignment';
  }
}
