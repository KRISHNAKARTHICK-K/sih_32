export interface ProcurementCentre {
  id: string;
  centreCode: string;
  name: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  contactNumber?: string;
  active: boolean;
}
