import { apiClient } from '../api';
import { ApiResponse, AuthSession, LoginCredentials, User } from '../types';
import { AppError } from '../utils/errorHandler';
import { secureStorage } from '../storage';
import { AppConfig } from '../constants';

export const authService = {
  /**
   * Authenticate Farmer credentials against Spring Boot backend.
   * Enforces role isolation: ONLY Role.FARMER is permitted on mobile.
   */
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password,
    });

    const session = response.data.data;

    // Strict Mobile Role Boundary Check
    if (session.user.role !== 'FARMER') {
      throw new AppError(
        'Access Denied: This mobile application is exclusively for registered Farmers. Staff and Administrators must log in via the AgriProcure Web ERP.',
        'FORBIDDEN',
        403
      );
    }

    return session;
  },

  /**
   * Fetch current authenticated Farmer profile and validate active session.
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    const user = response.data.data;

    if (user.role !== 'FARMER') {
      throw new AppError(
        'Access Denied: Active session is not a registered Farmer.',
        'FORBIDDEN',
        403
      );
    }

    return user;
  },

  /**
   * Clear local secure session data.
   */
  async logout(): Promise<void> {
    await secureStorage.deleteItem(AppConfig.storageKeys.authToken);
    await secureStorage.deleteItem(AppConfig.storageKeys.userSession);
  },
};

export default authService;
