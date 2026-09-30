// store/authStore.ts — global auth state. Replaces AuthContext.tsx.
//
// Unlike Context, this is a plain module — readable and writable from
// ANYWHERE, not just inside React components. That's what lets
// apiClient.ts (a non-component module) read the current access token
// and update it after a silent refresh, without threading it through
// every component that makes an API call.

import { create } from 'zustand';
import { authApi } from '../lib/authApi';
import type { AuthUser, SignUpPayload, SignInPayload } from '../types/auth';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;

  bootstrap: () => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  login: (payload: SignInPayload) => Promise<void>;
  logout: () => Promise<void>;

  // Internal — used by apiClient.ts's 401-triggered refresh-and-retry.
  // Not meant to be called from components directly.
  setAccessToken: (token: string | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: 'checking',

  bootstrap: async () => {
    try {
      const res = await authApi.refresh();
      set({ user: res.user, accessToken: res.accessToken, status: 'authenticated' });
    } catch {
      // No valid session cookie — normal for a first-time visitor.
      set({ user: null, accessToken: null, status: 'unauthenticated' });
    }
  },

  signUp: async (payload) => {
    const res = await authApi.signUp(payload);
    set({ user: res.user, accessToken: res.accessToken, status: 'authenticated' });
  },

  login: async (payload) => {
    const res = await authApi.login(payload);
    set({ user: res.user, accessToken: res.accessToken, status: 'authenticated' });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, accessToken: null, status: 'unauthenticated' });
    }
  },

  setAccessToken: (token) => set({ accessToken: token }),

  clearSession: () => set({ user: null, accessToken: null, status: 'unauthenticated' }),
}));

// Non-hook accessor — for use OUTSIDE React components (apiClient.ts
// needs this; a hook can't be called from a plain function). Inside
// components, always prefer the hook: useAuthStore(s => s.accessToken).
export const getAuthState = () => useAuthStore.getState();
