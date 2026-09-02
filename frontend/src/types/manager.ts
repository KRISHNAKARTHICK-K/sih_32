import type { QueueToken } from './farmer';

export interface OperationalAlert {
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  category: 'QUEUE' | 'SLOTS' | 'WEIGHMENT' | 'QUALITY' | 'PAYMENT';
}

export interface ManagerDashboardData {
  centreId: string;
  centreName: string;
  centreCode: string;
  date: string;
  todayBookingsCount: number;
  waitingTokensCount: number;
  currentlyServingToken: string;
  completedProcurementsCount: number;
  totalProcurementQuantity: number;
  totalProcurementValue: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  totalSlotCapacity: number;
  bookedSlotCapacity: number;
  slotUtilizationPercentage: number;
  waitingCount: number;
  verifiedCount: number;
  processingCount: number;
  qualityCheckCount: number;
  completedCount: number;
  cancelledCount: number;
  currentlyServing?: QueueToken;
  upNextTokens: QueueToken[];
  operationalAlerts: OperationalAlert[];
}

export interface CentreStaffMember {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email?: string;
  mobile?: string;
  role: string;
  designation: string;
  active: boolean;
  createdAt: string;
}

export interface CropProcurementSummary {
  cropName: string;
  cropUnit: string;
  quantity: number;
  totalValue: number;
  procurementCount: number;
}

export interface DailyTrend {
  date: string;
  bookingCount: number;
  procurementQuantity: number;
  procurementValue: number;
}

export interface ManagerReportsData {
  centreId: string;
  centreName: string;
  fromDate: string;
  toDate: string;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalProcurements: number;
  totalQuantity: number;
  totalGrossAmount: number;
  totalDeductions: number;
  totalNetAmount: number;
  cropSummaries: CropProcurementSummary[];
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  rejectedCount: number;
  totalDisbursed: number;
  pendingDisbursement: number;
  paidPaymentsCount: number;
  pendingPaymentsCount: number;
  dailyTrends: DailyTrend[];
}

export interface SlotCreatePayload {
  centreId?: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
}
