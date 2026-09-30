// pages/PendingAssignmentPage.tsx

import { useAuthStore } from '../store/authStore';

export function PendingAssignmentPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Almost there</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your account is created, {user?.first_name}. An administrator needs to assign you to an
          organization before you can continue.
        </p>
        <button onClick={() => logout()} className="text-sm font-medium text-blue-600 hover:underline">
          Sign out
        </button>
      </div>
    </div>
  );
}
