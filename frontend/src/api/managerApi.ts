import apiClient from './client';
import type { ApiResponse } from '../types';
import type {
  ManagerDashboardData,
  ManagerReportsData,
  CentreStaffMember,
  SlotCreatePayload,
} from '../types/manager';
import type {
  Booking,
  QueueOverview,
  Procurement,
  Payment,
  Slot,
} from '../types/farmer';

export const managerApi = {
  getDashboard: async (centreId?: string, date?: string): Promise<ManagerDashboardData> => {
    const res = await apiClient.get<ApiResponse<ManagerDashboardData>>('/manager/dashboard', {
      params: { centreId, date },
    });
    return res.data.data;
  },

  getStaff: async (centreId?: string): Promise<CentreStaffMember[]> => {
    const res = await apiClient.get<ApiResponse<CentreStaffMember[]>>('/manager/staff', {
      params: { centreId },
    });
    return res.data.data;
  },

  getReports: async (centreId?: string, fromDate?: string, toDate?: string): Promise<ManagerReportsData> => {
    const res = await apiClient.get<ApiResponse<ManagerReportsData>>('/manager/reports', {
      params: { centreId, fromDate, toDate },
    });
    return res.data.data;
  },

  // Operational Views (Centre-scoped)
  getCentreBookings: async (centreId: string): Promise<Booking[]> => {
    const res = await apiClient.get<ApiResponse<Booking[]>>(`/centres/${centreId}/bookings`);
    return res.data.data;
  },

  getCentreQueue: async (centreId: string, date?: string): Promise<QueueOverview> => {
    const res = await apiClient.get<ApiResponse<QueueOverview>>(`/queues/${centreId}`, {
      params: { date },
    });
    return res.data.data;
  },

  getCentreProcurements: async (centreId: string): Promise<Procurement[]> => {
    const res = await apiClient.get<ApiResponse<Procurement[]>>(`/procurements/centre/${centreId}`);
    return res.data.data;
  },

  getCentrePayments: async (centreId: string): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>(`/centres/${centreId}/payments`);
    return res.data.data;
  },

  getCentreSlots: async (centreId: string, date?: string): Promise<Slot[]> => {
    const res = await apiClient.get<ApiResponse<Slot[]>>(`/centres/${centreId}/slots`, {
      params: { date },
    });
    return res.data.data;
  },

  createSlot: async (centreId: string, payload: SlotCreatePayload): Promise<Slot> => {
    const res = await apiClient.post<ApiResponse<Slot>>(`/centres/${centreId}/slots`, payload);
    return res.data.data;
  },

  updateSlotStatus: async (slotId: string, active: boolean): Promise<Slot> => {
    const res = await apiClient.patch<ApiResponse<Slot>>(`/slots/${slotId}/status`, null, {
      params: { active },
    });
    return res.data.data;
  },
};

export default managerApi;
