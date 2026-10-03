import { Navigate } from 'react-router';
import { getHomePathForUser } from '../../lib/roles';
import { useAuthStore } from '../../store/authStore';
import FullScreenLoader from './FullScreenLoader';

export default function RootRedirect() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (status === 'checking') return <FullScreenLoader />;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return <Navigate to={getHomePathForUser(user)} replace />;
}
