import { Navigate, Outlet } from 'react-router';
import { getHomePathForUser, isAssigned } from '../../lib/roles';
import { useAuthStore } from '../../store/authStore';
import type { RoleName } from '../../types/roles';

interface Props {
  allowed: RoleName[];
}

/**
 * Sends a wrong-role user to THEIR OWN home instead of a dead-end "forbidden" page.
 * UX only — the backend's requireRole() remains the real security boundary.
 */
export default function RequireRole({ allowed }: Props) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;

  const ok = isAssigned(user) && allowed.includes(user.role_name as RoleName);
  if (!ok) return <Navigate to={getHomePathForUser(user)} replace />;
  return <Outlet />;
}
