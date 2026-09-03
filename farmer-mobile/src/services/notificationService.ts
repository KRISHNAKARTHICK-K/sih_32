import { apiClient } from '../api';
import { ApiResponse, NotificationItem } from '../types';

export const notificationService = {
  /**
   * Fetch unread notification count for authenticated farmer
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>('/notifications/unread-count');
    return response.data.data;
  },

  /**
   * Fetch notification list for authenticated farmer
   */
  async getNotifications(): Promise<NotificationItem[]> {
    const response = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications');
    return response.data.data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },
};

export default notificationService;
