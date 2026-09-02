import apiClient from './client';
import type { ApiResponse } from '../types';
import type {
  QueueToken,
  QueueOverview,
  QueueStatus,
  Procurement,
  Weighment,
  QualityInspection,
  QualityGrade,
  Booking,
  Slot,
} from '../types/farmer';

export interface WeighmentSubmitRequest {
  declaredQuantity?: number;
  actualWeight: number;
  moisturePercentage?: number;
  recordedBy?: string;
  remarks?: string;
}

export interface QualityInspectionSubmitRequest {
  grade: QualityGrade;
  moisturePercentage?: number;
  foreignMatterPercentage?: number;
  brokenGrainPercentage?: number;
  inspectedBy?: string;
  remarks?: string;
  approved: boolean;
}

export const operatorApi = {
  // Queue Operations
  getQueueOverview: async (centreId: string, date?: string): Promise<QueueOverview> => {
    const res = await apiClient.get<ApiResponse<QueueOverview>>(`/queues/${centreId}`, {
      params: { date },
    });
    return res.data.data;
  },

  getTokenById: async (tokenId: string): Promise<QueueToken> => {
    const res = await apiClient.get<ApiResponse<QueueToken>>(`/queues/tokens/${tokenId}`);
    return res.data.data;
  },

  callNextWaitingToken: async (centreId: string, date?: string): Promise<QueueToken> => {
    const res = await apiClient.post<ApiResponse<QueueToken>>(`/queues/${centreId}/call-next`, null, {
      params: { date },
    });
    return res.data.data;
  },

  updateTokenStatus: async (tokenId: string, status: QueueStatus): Promise<QueueToken> => {
    const res = await apiClient.patch<ApiResponse<QueueToken>>(`/queues/tokens/${tokenId}/status`, {
      status,
    });
    return res.data.data;
  },

  // Intake & Procurement
  getOrCreateProcurementForToken: async (tokenId: string): Promise<Procurement> => {
    const res = await apiClient.get<ApiResponse<Procurement>>(`/procurements/token/${tokenId}`);
    return res.data.data;
  },

  recordWeighment: async (procurementId: string, request: WeighmentSubmitRequest): Promise<Weighment> => {
    const res = await apiClient.post<ApiResponse<Weighment>>(`/procurements/${procurementId}/weighment`, request);
    return res.data.data;
  },

  recordInspection: async (procurementId: string, request: QualityInspectionSubmitRequest): Promise<QualityInspection> => {
    const res = await apiClient.post<ApiResponse<QualityInspection>>(`/procurements/${procurementId}/inspection`, request);
    return res.data.data;
  },

  getCentreProcurements: async (centreId: string): Promise<Procurement[]> => {
    const res = await apiClient.get<ApiResponse<Procurement[]>>(`/procurements/centre/${centreId}`);
    return res.data.data;
  },

  getProcurementById: async (id: string): Promise<Procurement> => {
    const res = await apiClient.get<ApiResponse<Procurement>>(`/procurements/${id}`);
    return res.data.data;
  },

  // Bookings & Slots
  getCentreBookings: async (centreId: string): Promise<Booking[]> => {
    const res = await apiClient.get<ApiResponse<Booking[]>>(`/centres/${centreId}/bookings`);
    return res.data.data;
  },

  getCentreSlots: async (centreId: string, date?: string): Promise<Slot[]> => {
    const res = await apiClient.get<ApiResponse<Slot[]>>(`/centres/${centreId}/slots`, {
      params: { date },
    });
    return res.data.data;
  },
};

export default operatorApi;
