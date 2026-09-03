import { apiClient } from '../api';
import { ApiResponse, Booking, BookingCreatePayload } from '../types';

export const bookingService = {
  /**
   * Create a new procurement slot booking.
   * Concurrency-safe, auto-generates digital Queue Token.
   */
  async createBooking(payload: BookingCreatePayload): Promise<Booking> {
    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', payload);
    return response.data.data;
  },

  /**
   * Retrieve booking details by ID
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
    return response.data.data;
  },

  /**
   * Retrieve booking details by booking reference code (e.g. BK-2026-000001)
   */
  async getBookingByCode(bookingCode: string): Promise<Booking> {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/code/${bookingCode}`);
    return response.data.data;
  },

  /**
   * List all bookings for authenticated farmer
   */
  async getFarmerBookings(farmerId: string): Promise<Booking[]> {
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/farmers/${farmerId}/bookings`);
    return response.data.data;
  },
};

export default bookingService;
