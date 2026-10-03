import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import FullScreenLoader from './FullScreenLoader';

/** Layout-route guard: wrap every protected route in this. */
export default function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  // Don't redirect while bootstrap() is still doing its silent /refresh,
  // otherwise every page reload would bounce to /login.
  if (status === 'checking') return <FullScreenLoader />;
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
