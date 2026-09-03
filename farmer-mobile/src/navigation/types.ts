import { Booking } from '../types';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  BookSlot: undefined;
  BookingSuccess: { booking: Booking };
  BookingsList: undefined;
  BookingDetails: { bookingId: string };
  Queue?: { tokenId?: string };
  Notifications: undefined;
  Procurements: undefined;
  ProcurementDetails: { procurementId: string };
  Profile: undefined;
  Help: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
