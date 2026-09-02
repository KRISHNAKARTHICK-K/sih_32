export type UserRole = 'FARMER' | 'OPERATOR' | 'CENTRE_MANAGER' | 'ADMIN';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  mobile?: string;
  role: UserRole;
  fullName?: string;
  farmerId?: string;
  farmerCode?: string;
  centreId?: string;
  centreName?: string;
  centreCode?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
