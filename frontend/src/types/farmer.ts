export interface ProcurementCentre {
  id: string;
  centreCode: string;
  name: string;
  address: string;
  village: string;
  district: string;
  state: string;
  contactNumber?: string;
  active: boolean;
  createdAt: string;
}

export interface Crop {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentPrice: number;
  active: boolean;
  createdAt: string;
}

export interface Slot {
  id: string;
  centreId: string;
  centreName: string;
  centreCode: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableCapacity: number;
  active: boolean;
  createdAt: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  bookingCode: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  slotId: string;
  centreId: string;
  centreName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  cropId: string;
  cropName: string;
  declaredQuantity: number;
  status: BookingStatus;
  queueToken?: string;
  createdAt: string;
}

export interface BookingCreateRequest {
  farmerId?: string;
  slotId: string;
  cropId: string;
  declaredQuantity: number;
}

export type QueueStatus =
  | 'BOOKED'
  | 'ARRIVED'
  | 'VERIFIED'
  | 'WAITING'
  | 'PROCESSING'
  | 'WEIGHING'
  | 'QUALITY_CHECK'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface QueueToken {
  id: string;
  tokenNumber: number;
  displayToken: string;
  bookingId: string;
  bookingCode: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  farmerMobile: string;
  centreId: string;
  centreName: string;
  centreCode: string;
  queueDate: string;
  status: QueueStatus;
  queuePosition: number;
  peopleAhead: number;
  createdAt: string;
}

export interface QueueOverview {
  centreId: string;
  centreName: string;
  queueDate: string;
  currentServingToken: string;
  totalTokens: number;
  waitingCount: number;
  processingCount: number;
  completedCount: number;
  activeTokens: QueueToken[];
}

export type ProcurementStatus = 'DRAFT' | 'WEIGHED' | 'QUALITY_CHECKED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
export type QualityGrade = 'A' | 'B' | 'C' | 'REJECTED';

export interface Weighment {
  id: string;
  procurementId: string;
  declaredQuantity: number;
  actualWeight: number;
  moisturePercentage?: number;
  recordedBy?: string;
  recordedAt: string;
  remarks?: string;
}

export interface QualityInspection {
  id: string;
  procurementId: string;
  grade: QualityGrade;
  moisturePercentage?: number;
  foreignMatterPercentage?: number;
  brokenGrainPercentage?: number;
  inspectedBy?: string;
  inspectedAt: string;
  remarks?: string;
  approved: boolean;
}

export interface Procurement {
  id: string;
  procurementCode: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  queueTokenId?: string;
  displayToken?: string;
  cropId: string;
  cropName: string;
  cropUnit: string;
  declaredQuantity: number;
  actualQuantity: number;
  ratePerUnit: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: ProcurementStatus;
  createdAt: string;
  completedAt?: string;
  weighment?: Weighment;
  qualityInspection?: QualityInspection;
}

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface Payment {
  id: string;
  paymentCode: string;
  procurementId: string;
  procurementCode: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  status: PaymentStatus;
  processedAt?: string;
  createdAt: string;
}

export type NotificationType = 'BOOKING' | 'QUEUE' | 'PROCUREMENT' | 'PAYMENT' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
