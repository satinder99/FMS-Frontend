// components/auth/AuthCard.tsx — shared white card shell for sign-in
// and sign-up, matching the reference screenshot: centered, rounded,
// subtle border, soft shadow.

import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">{title}</h1>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </div>
  );
}
