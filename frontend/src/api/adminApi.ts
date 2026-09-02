import apiClient from './client';
import type {
  AdminDashboard,
  AdminCentreSummary,
  AdminUser,
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
  AdminCropCreatePayload,
  AdminCropUpdatePayload,
  AdminCropPriceCreatePayload,
  AdminCentreUpdatePayload,
  AdminAuditLog,
  AdminSystemHealth,
} from '../types/admin';
import type {
  Farmer,
  Crop,
  CropPrice,
  Centre,
  Booking,
  Procurement,
  Payment,
  ApiResponse,
} from '../types';

export const adminApi = {
  // 1. Dashboard
  getDashboard: async (): Promise<AdminDashboard> => {
    const res = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
    return res.data.data;
  },

  // 2. Users
  getUsers: async (): Promise<AdminUser[]> => {
    const res = await apiClient.get<ApiResponse<AdminUser[]>>('/admin/users');
    return res.data.data;
  },

  createUser: async (payload: AdminUserCreatePayload): Promise<AdminUser> => {
    const res = await apiClient.post<ApiResponse<AdminUser>>('/admin/users', payload);
    return res.data.data;
  },

  updateUser: async (id: string, payload: AdminUserUpdatePayload): Promise<AdminUser> => {
    const res = await apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, payload);
    return res.data.data;
  },

  updateUserStatus: async (id: string, enabled: boolean): Promise<AdminUser> => {
    const res = await apiClient.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/status?enabled=${enabled}`);
    return res.data.data;
  },

  // 3. Farmers
  getFarmers: async (): Promise<Farmer[]> => {
    const res = await apiClient.get<ApiResponse<Farmer[]>>('/admin/farmers');
    return res.data.data;
  },

  // 4. Centres
  getCentres: async (): Promise<AdminCentreSummary[]> => {
    const res = await apiClient.get<ApiResponse<AdminCentreSummary[]>>('/admin/centres');
    return res.data.data;
  },

  createCentre: async (payload: {
    name: string;
    address?: string;
    village?: string;
    district?: string;
    state?: string;
    contactNumber?: string;
  }): Promise<Centre> => {
    const res = await apiClient.post<ApiResponse<Centre>>('/admin/centres', payload);
    return res.data.data;
  },

  updateCentre: async (id: string, payload: AdminCentreUpdatePayload): Promise<Centre> => {
    const res = await apiClient.put<ApiResponse<Centre>>(`/admin/centres/${id}`, payload);
    return res.data.data;
  },

  updateCentreStatus: async (id: string, active: boolean): Promise<Centre> => {
    const res = await apiClient.patch<ApiResponse<Centre>>(`/admin/centres/${id}/status?active=${active}`);
    return res.data.data;
  },

  // 5. Crops & Prices
  getCrops: async (activeOnly = false): Promise<Crop[]> => {
    const res = await apiClient.get<ApiResponse<Crop[]>>(`/admin/crops?activeOnly=${activeOnly}`);
    return res.data.data;
  },

  createCrop: async (payload: AdminCropCreatePayload): Promise<Crop> => {
    const res = await apiClient.post<ApiResponse<Crop>>('/admin/crops', payload);
    return res.data.data;
  },

  updateCrop: async (id: string, payload: AdminCropUpdatePayload): Promise<Crop> => {
    const res = await apiClient.put<ApiResponse<Crop>>(`/admin/crops/${id}`, payload);
    return res.data.data;
  },

  updateCropStatus: async (id: string, active: boolean): Promise<Crop> => {
    const res = await apiClient.patch<ApiResponse<Crop>>(`/admin/crops/${id}/status?active=${active}`);
    return res.data.data;
  },

  getPrices: async (): Promise<CropPrice[]> => {
    const res = await apiClient.get<ApiResponse<CropPrice[]>>('/admin/prices');
    return res.data.data;
  },

  createPrice: async (payload: AdminCropPriceCreatePayload): Promise<CropPrice> => {
    const res = await apiClient.post<ApiResponse<CropPrice>>('/admin/prices', payload);
    return res.data.data;
  },

  updatePriceStatus: async (id: string, active: boolean): Promise<CropPrice> => {
    const res = await apiClient.patch<ApiResponse<CropPrice>>(`/admin/prices/${id}/status?active=${active}`);
    return res.data.data;
  },

  // 6. Registries
  getBookings: async (): Promise<Booking[]> => {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/admin/bookings');
    return res.data.data;
  },

  getProcurements: async (): Promise<Procurement[]> => {
    const res = await apiClient.get<ApiResponse<Procurement[]>>('/admin/procurements');
    return res.data.data;
  },

  getPayments: async (): Promise<Payment[]> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/admin/payments');
    return res.data.data;
  },

  // 7. Audit Logs
  getAuditLogs: async (params?: {
    action?: string;
    entityType?: string;
    username?: string;
    limit?: number;
  }): Promise<AdminAuditLog[]> => {
    const res = await apiClient.get<ApiResponse<AdminAuditLog[]>>('/admin/audit', { params });
    return res.data.data;
  },

  // 8. System Health
  getSystemHealth: async (): Promise<AdminSystemHealth> => {
    const res = await apiClient.get<ApiResponse<AdminSystemHealth>>('/admin/system/health');
    return res.data.data;
  },
};
