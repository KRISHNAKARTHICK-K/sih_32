export interface Crop {
  id: string;
  code: string;
  name: string;
  unit: string;
  currentPrice?: number;
  active: boolean;
  createdAt?: string;
}

export interface CropPrice {
  id: string;
  cropId: string;
  cropName?: string;
  pricePerUnit: number;
  effectiveFrom: string;
  effectiveTo?: string;
  active: boolean;
}
