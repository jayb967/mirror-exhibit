export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ProtectedRouteConfig {
  requireAuth: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
} 