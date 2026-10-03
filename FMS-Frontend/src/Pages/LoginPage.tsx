// pages/LoginPage.tsx

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { AuthCard } from '../components/auth/AuthCard';
import { LoginForm } from '../components/auth/LoginForm';
import { getHomePathForUser } from '../lib/roles';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../lib/httpClient';
import type { SignInPayload } from '../types/auth';

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(payload: SignInPayload) {
    setSubmitError(null);
    try {
      await login(payload);
      // Read the freshly updated store; send the user straight to their role's home.
      const loggedInUser = useAuthStore.getState().user;
      navigate(getHomePathForUser(loggedInUser), { replace: true });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  }

  // Already signed in (e.g. opened /login in a new tab): skip the form.
  if (status === 'authenticated') {
    return <Navigate to={getHomePathForUser(user)} replace />;
  }

  return (
    <AuthCard
      title="Login"
      footer={
        <>
          Need an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm onSubmit={handleSubmit} submitError={submitError} />
    </AuthCard>
  );
}