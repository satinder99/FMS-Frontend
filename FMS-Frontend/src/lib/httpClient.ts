// [FRONTEND · React] src/lib/httpClient.ts   (YOUR EXISTING FILE: only the header merge inside request() changed)
// lib/httpClient.ts — the base fetch wrapper. Deliberately has NO
// dependency on the auth store — this is what authApi.ts (and by
// extension authStore.ts) is built on, so it can't import the store
// without creating a circular dependency (store -> authApi -> store).
// Token-aware requests live in apiClient.ts instead, one layer up.

import type { ApiErrorBody } from '../types/auth';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Headers are merged AFTER the rest of the options are spread. Before, `...options` came last, so any
  // caller that passed its own `headers` (apiClient always adds Authorization) replaced the whole headers
  // object and silently dropped `Content-Type: application/json`. Express then ignores the body and the
  // route sees `req.body === undefined`.
  const { headers, ...rest } = options;
  const mergedHeaders = new Headers({ 'Content-Type': 'application/json' });
  new Headers(headers).forEach((value, key) => mergedHeaders.set(key, value)); // caller's headers win

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include', // send/receive the httpOnly refresh cookie
    ...rest,
    headers: mergedHeaders,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json();

  if (!res.ok) {
    const errBody = body as ApiErrorBody;
    throw new ApiError(errBody.error ?? 'Request failed', errBody.code ?? 'UNKNOWN_ERROR', res.status);
  }

  return body as T;
}