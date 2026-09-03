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
  queuePosition?: number;
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
