export interface AdminCentreSummary {
  centreId: string;
  centreCode: string;
  centreName: string;
  district: string;
  state: string;
  active: boolean;
  staffCount: number;
  todayBookings: number;
  waitingTokens: number;
  currentlyServing: string;
  procurementQuantity: number;
  procurementValue: number;
  pendingPayments: number;
  slotUtilization: number;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  username: string;
  userFullName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
}

export interface AdminDashboard {
  totalFarmers: number;
  activeCentres: number;
  todayBookings: number;
  activeQueueTokens: number;
  totalProcurementQuantity: number;
  totalProcurementValue: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  activeUsersCount: number;
  centreSummaries: AdminCentreSummary[];
  recentActivity: AdminAuditLog[];
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  mobile?: string;
  role: 'FARMER' | 'OPERATOR' | 'CENTRE_MANAGER' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
  centreId?: string;
  centreName?: string;
  designation?: string;
  farmerId?: string;
  farmerCode?: string;
}

export interface AdminUserCreatePayload {
  username: string;
  fullName: string;
  email?: string;
  mobile?: string;
  role: 'FARMER' | 'OPERATOR' | 'CENTRE_MANAGER' | 'ADMIN';
  password: string;
  centreId?: string;
  designation?: string;
  village?: string;
  district?: string;
  state?: string;
  address?: string;
}

export interface AdminUserUpdatePayload {
  fullName?: string;
  email?: string;
  mobile?: string;
  enabled?: boolean;
  centreId?: string;
  designation?: string;
}

export interface AdminCropCreatePayload {
  code: string;
  name: string;
  unit: string;
}

export interface AdminCropUpdatePayload {
  name?: string;
  unit?: string;
  active?: boolean;
}

export interface AdminCropPriceCreatePayload {
  cropId: string;
  pricePerUnit: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface AdminCentreUpdatePayload {
  name?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  contactNumber?: string;
  active?: boolean;
}

export interface AdminSystemHealth {
  backendStatus: string;
  databaseStatus: string;
  databaseDialect: string;
  activeConnectionPool: number;
  jvmUsedMemoryMB: number;
  jvmMaxMemoryMB: number;
  jvmFreeMemoryMB: number;
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
}
