export interface Slot {
  id: string;
  centreId: string;
  centreName: string;
  centreCode?: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableCapacity: number;
  active: boolean;
  createdAt: string;
}
