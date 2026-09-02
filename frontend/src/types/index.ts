export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  validationErrors?: Record<string, string>;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string;
  description?: string;
}

export interface SystemStatus {
  isOnline: boolean;
  service: string;
  checkedAt: string;
  latencyMs?: number;
}

export interface Farmer {
  id: string;
  farmerCode: string;
  fullName: string;
  mobile: string;
  email?: string;
  village: string;
  district: string;
  state: string;
  address?: string;
  landHoldingAcre?: number;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  createdAt: string;
}

export interface CropPrice {
  id: string;
  cropId: string;
  cropCode: string;
  cropName: string;
  pricePerUnit: number;
  effectiveFrom: string;
  effectiveTo?: string;
  active: boolean;
  createdAt: string;
}

export type {
  Crop,
  Booking,
  BookingStatus,
  Procurement,
  ProcurementStatus,
  Payment,
  PaymentStatus,
  ProcurementCentre,
  ProcurementCentre as Centre,
  Slot,
  QueueToken,
  QueueOverview,
} from './farmer';

