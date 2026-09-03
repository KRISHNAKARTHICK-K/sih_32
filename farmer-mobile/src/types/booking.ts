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

export interface BookingCreatePayload {
  farmerId?: string;
  slotId: string;
  cropId: string;
  declaredQuantity: number;
}
