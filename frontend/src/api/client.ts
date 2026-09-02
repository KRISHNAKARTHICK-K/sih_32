import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const TOKEN_STORAGE_KEY = 'agriprocure_auth_token';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Centralized token getter and setter
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

// Request interceptor for injecting Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unified 401 handling and error reporting
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        // Clear token on 401 Unauthorized unless we are on the login page
        removeStoredToken();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }

      console.warn(`[API Error ${status}]:`, errorData?.message || error.message);
    } else if (error.request) {
      console.warn('[API Network Error]: No response received from server. Verify backend status.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
