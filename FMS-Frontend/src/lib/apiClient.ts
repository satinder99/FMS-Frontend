// lib/apiClient.ts — for AUTHENTICATED app endpoints (drivers, orders,
// documents, etc. — everything behind requireAuth on the backend).
//
// This is the module that actually needed the store to be reachable
// outside a component — it reads the current access token via
// getAuthState() (a plain function call, not a hook) and attaches it
// as `Authorization: Bearer <token>` on every request.
//
// It also handles the case Context had no clean answer for either: an
// access token expiring mid-session. On a 401, it silently calls
// /refresh once, updates the store, and retries the original request
// — the caller never sees the expiry, same as the AuthProvider
// bootstrap does on page load, just mid-session instead of on mount.

import { request, ApiError, API_BASE_URL } from './httpClient';
import { authApi } from './authApi';
import { getAuthState } from '../store/authStore';

// Dedupes concurrent 401s: if five requests fail at once because the
// token just expired, this ensures only ONE /refresh call fires, and
// all five wait on that same promise instead of racing each other —
// the same class of problem as the multi-tab refresh race, just
// within a single tab.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = authApi
      .refresh()
      .then((res) => {
        getAuthState().setAccessToken(res.accessToken);
        return res.accessToken;
      })
      .catch((err) => {
        // Refresh itself failed — the session is genuinely over.
        getAuthState().clearSession();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiClient<T>(path: string, options: RequestInit = {}, _isRetry = false): Promise<T> {
  const { accessToken } = getAuthState();

  try {
    return await request<T>(path, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  } catch (err) {
    const isExpiredAccessToken =
      err instanceof ApiError && err.status === 401 && err.code === 'ACCESS_TOKEN_EXPIRED';

    // Only retry ONCE — if the retried request 401s again, something
    // else is wrong (e.g. the refresh also failed to actually fix it),
    // and retrying forever would loop.
    if (isExpiredAccessToken && !_isRetry) {
      await refreshAccessToken();
      return apiClient<T>(path, options, true);
    }

    throw err;
  }
}

// Re-exported for convenience so callers don't need two import lines.
export { ApiError, API_BASE_URL };
