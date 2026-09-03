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
