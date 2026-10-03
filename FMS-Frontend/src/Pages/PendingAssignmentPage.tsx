// pages/PendingAssignmentPage.tsx

import { Navigate, useNavigate } from 'react-router';
import { getHomePathForUser } from '../lib/roles';
import { useAuthStore } from '../store/authStore';

export function PendingAssignmentPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  // Once an admin has assigned a role + org, this holding screen is no longer needed.
  const home = getHomePathForUser(user);
  if (user && home !== '/pending-assignment') {
    return <Navigate to={home} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Almost there</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your account is created, {user?.first_name}. An administrator needs to assign you to an
          organization before you can continue.
        </p>
        <button onClick={handleSignOut} className="text-sm font-medium text-blue-600 hover:underline">
          Sign out
        </button>
      </div>
    </div>
  );
}