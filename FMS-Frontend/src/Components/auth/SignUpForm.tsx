// components/auth/SignUpForm.tsx
//
// Fields match authService.signUp() exactly: firstName, lastName,
// email, phone (optional), password. No username, no org, no role —
// those come later (admin assignment, then self-service username
// generation), per the backend design.

import { useForm } from 'react-hook-form';
import { TextField } from './TextField';
import type { SignUpPayload } from '../../types/auth';

interface SignUpFormValues extends SignUpPayload {
  confirmPassword: string;
}

interface SignUpFormProps {
  onSubmit: (payload: SignUpPayload) => Promise<void>;
  submitError?: string | null;
}

export function SignUpForm({ onSubmit, submitError }: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({ mode: 'onBlur' });

  const password = watch('password');

  async function submit(values: SignUpFormValues) {
    const { confirmPassword: _confirmPassword, ...payload } = values;
    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {submitError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <TextField
          placeholder="First name"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName', { required: 'First name is required' })}
        />
        <TextField
          placeholder="Last name"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName', { required: 'Last name is required' })}
        />
      </div>

      <div className="mb-4">
        <TextField
          type="email"
          placeholder="Email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
          })}
        />
      </div>

      <div className="mb-4">
        <TextField
          type="tel"
          placeholder="Phone (optional)"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <div className="mb-4">
        <TextField
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 1, message: 'Password must be at least 10 characters' },
          })}
        />
      </div>

      <div className="mb-6">
        <TextField
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-gray-900 py-3 font-medium text-white transition-colors
          hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Creating account…' : 'Sign up'}
      </button>
    </form>
  );
}
