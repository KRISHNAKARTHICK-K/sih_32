import { apiClient } from '../api';
import { ApiResponse, Procurement } from '../types';

export const procurementService = {
  /**
   * Fetch all procurement records and intake receipts for authenticated farmer
   */
  async getFarmerProcurements(farmerId: string): Promise<Procurement[]> {
    const response = await apiClient.get<ApiResponse<Procurement[]>>(`/procurements/farmers/${farmerId}`);
    return response.data.data;
  },

  /**
   * Fetch a single procurement record by ID (with nested weighment and quality inspection)
   */
  async getProcurementById(id: string): Promise<Procurement> {
    const response = await apiClient.get<ApiResponse<Procurement>>(`/procurements/${id}`);
    return response.data.data;
  },
};

export default procurementService;
