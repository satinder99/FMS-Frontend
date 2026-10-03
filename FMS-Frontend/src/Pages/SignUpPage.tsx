// pages/SignUpPage.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AuthCard } from '../components/auth/AuthCard';
import { SignUpForm } from '../components/auth/SignUpForm';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../lib/httpClient';
import type { SignUpPayload } from '../types/auth';

export function SignUpPage() {
  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(payload: SignUpPayload) {
    setSubmitError(null);
    try {
      await signUp(payload);
      navigate('/pending-assignment');
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <AuthCard
      title="Sign up"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm onSubmit={handleSubmit} submitError={submitError} />
    </AuthCard>
  );
}
