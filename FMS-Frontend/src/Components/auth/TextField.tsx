// components/auth/TextField.tsx — reusable input matching the
// screenshot's style: placeholder-as-label, rounded border, no
// separate <label> chrome (matches the reference exactly).
//
// forwardRef is required so react-hook-form's register() can attach
// its ref directly to the underlying <input>.

import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div>
        <input
          ref={ref}
          className={`w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400
            ${error ? 'border-red-300' : 'border-gray-200'} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
TextField.displayName = 'TextField';
