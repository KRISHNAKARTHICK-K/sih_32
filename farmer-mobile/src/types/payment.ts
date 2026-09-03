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
  paymentMethod?: string;
  transactionReference?: string;
  status: PaymentStatus;
  processedAt?: string;
  createdAt: string;
}
