import { apiClient } from '../api';
import { ApiResponse, Slot } from '../types';

export const slotService = {
  /**
   * Fetch all active slots for a given procurement centre, optionally filtered by date
   */
  async getSlotsByCentre(centreId: string, date?: string): Promise<Slot[]> {
    const response = await apiClient.get<ApiResponse<Slot[]>>(`/centres/${centreId}/slots`, {
      params: date ? { date } : undefined,
    });
    return response.data.data;
  },

  /**
   * Fetch specific slot by ID
   */
  async getSlotById(slotId: string): Promise<Slot> {
    const response = await apiClient.get<ApiResponse<Slot>>(`/slots/${slotId}`);
    return response.data.data;
  },
};

export default slotService;
