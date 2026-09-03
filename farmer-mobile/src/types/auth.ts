export type Role = 'FARMER' | 'OPERATOR' | 'CENTRE_MANAGER' | 'ADMIN';

export interface User {
  id?: string;
  userId?: string;
  username: string;
  role: Role;
  fullName?: string;
  email?: string;
  mobile?: string;
  farmerId?: string;
  farmerCode?: string;
  centreId?: string;
  centreName?: string;
  centreCode?: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  otp?: string;
}
