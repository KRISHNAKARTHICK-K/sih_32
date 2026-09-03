import { apiClient } from '../api';
import {
  ApiResponse,
  FarmerProfile,
  Booking,
  QueueToken,
  Procurement,
  Payment,
} from '../types';

export const farmerService = {
  /**
   * Fetch Farmer profile details by ID
   */
  async getFarmerProfile(farmerId: string): Promise<FarmerProfile> {
    const response = await apiClient.get<ApiResponse<FarmerProfile>>(`/farmers/${farmerId}`);
    return response.data.data;
  },

  /**
   * Fetch all bookings for authenticated farmer
   */
  async getFarmerBookings(farmerId: string): Promise<Booking[]> {
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/farmers/${farmerId}/bookings`);
    return response.data.data;
  },

  /**
   * Fetch active queue tokens for authenticated farmer
   */
  async getFarmerQueueTokens(farmerId: string): Promise<QueueToken[]> {
    const response = await apiClient.get<ApiResponse<QueueToken[]>>(`/queues/farmers/${farmerId}`);
    return response.data.data;
  },

  /**
   * Fetch all procurement records and intake receipts for authenticated farmer
   */
  async getFarmerProcurements(farmerId: string): Promise<Procurement[]> {
    const response = await apiClient.get<ApiResponse<Procurement[]>>(`/procurements/farmers/${farmerId}`);
    return response.data.data;
  },

  /**
   * Fetch all disbursement payments and DBT vouchers for authenticated farmer
   */
  async getFarmerPayments(farmerId: string): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(`/farmers/${farmerId}/payments`);
    return response.data.data;
  },
};

export default farmerService;
