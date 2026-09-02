import apiClient from './client';
import type { HealthResponse } from '../types';

export const fetchHealthStatus = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};
