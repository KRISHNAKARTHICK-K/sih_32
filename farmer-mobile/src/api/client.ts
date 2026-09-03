import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AppConfig } from '../constants/config';
import { secureStorage } from '../storage/secureStorage';
import { parseApiError } from '../utils/errorHandler';
import { notifyNetworkState } from '../context/NetworkContext';

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: (() => void) | null) => {
  onUnauthorizedCallback = callback;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: AppConfig.apiBaseUrl,
  timeout: AppConfig.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureStorage.getItem(AppConfig.storageKeys.authToken);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Continue without token if retrieval fails
    }
    return config;
  },
  (error) => Promise.reject(parseApiError(error))
);

// Response Interceptor: Parse errors consistently and handle session expiry & network state
apiClient.interceptors.response.use(
  (response) => {
    // Notify network success
    notifyNetworkState(true);
    return response;
  },
  (error) => {
    const parsed = parseApiError(error);

    // Notify network failure on transient/offline errors
    if (parsed.type === 'NETWORK_ERROR') {
      notifyNetworkState(false);
    }

    // Trigger unauthenticated listener on 401 (excluding initial login endpoint calls)
    if (
      parsed.type === 'UNAUTHORIZED' &&
      onUnauthorizedCallback &&
      !error.config?.url?.includes('/auth/login')
    ) {
      onUnauthorizedCallback();
    }
    return Promise.reject(parsed);
  }
);

export default apiClient;
