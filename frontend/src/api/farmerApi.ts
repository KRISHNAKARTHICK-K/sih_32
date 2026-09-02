import apiClient from './client';
import type { ApiResponse } from '../types';
import type {
  ProcurementCentre,
  Crop,
  Slot,
  Booking,
  BookingCreateRequest,
  QueueToken,
  QueueOverview,
  Procurement,
  Payment,
  NotificationItem,
} from '../types/farmer';

export const farmerApi = {
  // Centres & Slots
  getCentres: async (activeOnly = true): Promise<ProcurementCentre[]> => {
    const res = await apiClient.get<ApiResponse<ProcurementCentre[]>>('/centres', {
      params: { activeOnly },
    });
    return res.data.data;
  },

  getCentreById: async (centreId: string): Promise<ProcurementCentre> => {
    const res = await apiClient.get<ApiResponse<ProcurementCentre>>(`/centres/${centreId}`);
    return res.data.data;
  },

  getCrops: async (): Promise<Crop[]> => {
    const res = await apiClient.get<ApiResponse<Crop[]>>('/crops');
    return res.data.data;
  },

  getSlots: async (centreId: string, date?: string): Promise<Slot[]> => {
    const res = await apiClient.get<ApiResponse<Slot[]>>(`/centres/${centreId}/slots`, {
      params: { date },
    });
    return res.data.data;
  },

  // Bookings
  getFarmerBookings: async (farmerId: string): Promise<Booking[]> => {
    const res = await apiClient.get<ApiResponse<Booking[]>>(`/farmers/${farmerId}/bookings`);
    return res.data.data;
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const res = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data.data;
  },

  createBooking: async (request: BookingCreateRequest): Promise<Booking> => {
    const res = await apiClient.post<ApiResponse<Booking>>('/bookings', request);
    return res.data.data;
  },

  // Queue
  getFarmerQueue: async (farmerId: string): Promise<QueueToken[]> => {
    const res = await apiClient.get<ApiResponse<QueueToken[]>>(`/queues/farmers/${farmerId}`);
    return res.data.data;
  },

  getQueueOverview: async (centreId: string, date?: string): Promise<QueueOverview> => {
    const res = await apiClient.get<ApiResponse<QueueOverview>>(`/queues/${centreId}`, {
      params: { date },
    });
    return res.data.data;
  },

  // Procurement
  getFarmerProcurements: async (farmerId: string): Promise<Procurement[]> => {
    const res = await apiClient.get<ApiResponse<Procurement[]>>(`/procurements/farmers/${farmerId}`);
    return res.data.data;
  },

  getProcurementById: async (id: string): Promise<Procurement> => {
    const res = await apiClient.get<ApiResponse<Procurement>>(`/procurements/${id}`);
    return res.data.data;
  },

  // Payments
  getFarmerPayments: async (farmerId: string): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>(`/farmers/${farmerId}/payments`);
    return res.data.data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const res = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return res.data.data;
  },

  // Notifications
  getUserNotifications: async (userId: string): Promise<NotificationItem[]> => {
    const res = await apiClient.get<ApiResponse<NotificationItem[]>>(`/notifications/user/${userId}`);
    return res.data.data;
  },

  getUnreadNotificationCount: async (userId: string): Promise<number> => {
    const res = await apiClient.get<ApiResponse<number>>(`/notifications/user/${userId}/unread-count`);
    return res.data.data;
  },

  markNotificationRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },
};

export default farmerApi;
