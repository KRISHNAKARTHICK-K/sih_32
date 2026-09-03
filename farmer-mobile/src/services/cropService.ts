import { apiClient } from '../api';
import { ApiResponse, Crop } from '../types';

export const cropService = {
  /**
   * Fetch all active crops with current MSP prices
   */
  async getActiveCrops(): Promise<Crop[]> {
    const response = await apiClient.get<ApiResponse<Crop[]>>('/crops');
    return response.data.data;
  },
};

export default cropService;
