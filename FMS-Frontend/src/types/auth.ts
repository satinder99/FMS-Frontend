// types/auth.ts — shapes matching what the Express API actually returns
// (authService.toSafeUser / signUp / signIn responses).

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string | null; // null until the user generates one post-assignment
  email: string;
  phone: string | null;
  org_id: number | null; // null until an admin assigns it
  role_id: number | null; // null until an admin assigns it
  role_name: string | null; // 'dispatcher' | 'driver' | 'admin' | null
  status: 'active' | 'suspended' | 'locked' | 'deactivated';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface SignInPayload {
  usernameOrEmail: string;
  password: string;
}

// Shape of the JSON body Express's errorHandler.js sends on failure —
// { error: string, code: string }
export interface ApiErrorBody {
  error: string;
  code: string;
}
