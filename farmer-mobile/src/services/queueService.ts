import { apiClient } from '../api';
import { ApiResponse, QueueToken, QueueOverview } from '../types';

export const queueService = {
  /**
   * Fetch all queue tokens for the authenticated farmer
   */
  async getFarmerQueueTokens(farmerId: string): Promise<QueueToken[]> {
    const response = await apiClient.get<ApiResponse<QueueToken[]>>(`/queues/farmers/${farmerId}`);
    return response.data.data;
  },

  /**
   * Fetch specific queue token details by ID
   */
  async getTokenById(tokenId: string): Promise<QueueToken> {
    const response = await apiClient.get<ApiResponse<QueueToken>>(`/queues/tokens/${tokenId}`);
    return response.data.data;
  },

  /**
   * Fetch live centre queue overview including currently serving token and waiting counts
   */
  async getCentreQueueOverview(centreId: string, date?: string): Promise<QueueOverview> {
    const response = await apiClient.get<ApiResponse<QueueOverview>>(`/queues/${centreId}`, {
      params: date ? { date } : undefined,
    });
    return response.data.data;
  },
};

export default queueService;
