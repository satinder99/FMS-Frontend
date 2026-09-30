// App.tsx

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { PendingAssignmentPage } from './pages/PendingAssignmentPage';
import { useAuthStore } from './store/authStore';

export function App() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pending-assignment" element={<PendingAssignmentPage />} />
      <Route path="/" element={<Navigate to={status === 'authenticated' ? '/pending-assignment' : '/login'} replace />} />
    </Routes>
  );
}
