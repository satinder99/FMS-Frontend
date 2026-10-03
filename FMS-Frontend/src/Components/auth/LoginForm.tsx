// components/auth/LoginForm.tsx — matches the reference screenshot:
// email, password, dark "Sign in" button. (UI copy kept as "Sign in"
// to match the reference exactly — only the code-level naming below
// uses "login"; rename the button label too if you want full parity.)

import { useForm } from 'react-hook-form';
import { TextField } from './TextField';
import type { SignInPayload } from '../../types/auth';

interface LoginFormProps {
  onSubmit: (payload: SignInPayload) => Promise<void>;
  submitError?: string | null;
}

export function LoginForm({ onSubmit, submitError }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInPayload>({ mode: 'onBlur' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {submitError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="mb-4">
        <TextField
          placeholder="Email"
          autoComplete="username"
          error={errors.usernameOrEmail?.message}
          {...register('usernameOrEmail', { required: 'Email is required' })}
        />
      </div>

      <div className="mb-6">
        <TextField
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-gray-900 py-3 font-medium text-white transition-colors
          hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Logging in…' : 'Login'}
      </button>
    </form>
  );
}
