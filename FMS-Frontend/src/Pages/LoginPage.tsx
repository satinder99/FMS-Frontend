// pages/LoginPage.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AuthCard } from '../components/auth/AuthCard';
import { LoginForm } from '../Components/auth/LogInForm';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../lib/httpClient';
import type { SignInPayload } from '../types/auth';

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(payload: SignInPayload) {
    setSubmitError(null);
    try {
      await login(payload);
      navigate('/');
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
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
