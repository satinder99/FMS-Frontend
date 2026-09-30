// lib/authApi.ts — the four auth endpoints. No store dependency here
// either (see httpClient.ts comment) — authStore.ts imports THIS file,
// so this file must not import authStore.ts back.

import { request } from './httpClient';
import type { AuthResponse, SignUpPayload, SignInPayload } from '../types/auth';

export const authApi = {
  signUp: (payload: SignUpPayload) =>
    request<AuthResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),

  // Frontend name is "login" — the backend ROUTE is still /api/auth/signin
  // (unchanged, since that's the Express endpoint from authRoutes.js).
  // Only the frontend-facing naming changes here.
  login: (payload: SignInPayload) =>
    request<AuthResponse>('/api/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),

  refresh: () => request<AuthResponse>('/api/auth/refresh', { method: 'POST' }),

  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
};
