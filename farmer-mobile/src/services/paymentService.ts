import { apiClient } from '../api';
import { ApiResponse, Payment } from '../types';

export const paymentService = {
  /**
   * Fetch all payment vouchers and DBT disbursements for authenticated farmer
   */
  async getFarmerPayments(farmerId: string): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(`/farmers/${farmerId}/payments`);
    return response.data.data;
  },

  /**
   * Fetch a single payment record by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },
};

export default paymentService;
