import { apiClient } from '../api';
import { ApiResponse, ProcurementCentre } from '../types';

export const centreService = {
  /**
   * Fetch all active procurement centres
   */
  async getAllCentres(activeOnly: boolean = true): Promise<ProcurementCentre[]> {
    const response = await apiClient.get<ApiResponse<ProcurementCentre[]>>('/centres', {
      params: { activeOnly },
    });
    return response.data.data;
  },

  /**
   * Fetch single procurement centre by ID
   */
  async getCentreById(centreId: string): Promise<ProcurementCentre> {
    const response = await apiClient.get<ApiResponse<ProcurementCentre>>(`/centres/${centreId}`);
    return response.data.data;
  },
};

export default centreService;
