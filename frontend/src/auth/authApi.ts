import apiClient from '../api/client';
import type { ApiResponse } from '../types';
import type { AuthUser, LoginCredentials, LoginResponseData } from './authTypes';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponseData> => {
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }
    return response.data.data;
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch user profile');
    }
    return response.data.data;
  },
};

export default authApi;
