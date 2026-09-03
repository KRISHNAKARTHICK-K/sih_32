export type ProcurementStatus =
  | 'DRAFT'
  | 'WEIGHED'
  | 'QUALITY_CHECKED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type QualityGrade = 'A' | 'B' | 'C' | 'REJECTED';

export interface Weighment {
  id: string;
  procurementId: string;
  declaredQuantity?: number;
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
  weighment?: Weighment;
  qualityInspection?: QualityInspection;
  createdAt: string;
  completedAt?: string;
}
