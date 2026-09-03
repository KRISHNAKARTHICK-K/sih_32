import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './useAuth';
import { notificationService } from '../services';
import { NotificationItem } from '../types';
import { cacheStorage } from '../storage';
import { AppError } from '../utils/errorHandler';

export interface UseNotificationsResult {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isFromCache: boolean;
  cachedAt: number | null;
  markAsRead: (notificationId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsResult => {
  const { user, token } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  const isMountedRef = useRef<boolean>(true);

  // Fetch notifications and unread count
  const fetchNotifications = useCallback(
    async (isRefresh = false) => {
      if (!user?.farmerId || !token) {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const farmerId = user.farmerId;

      try {
        const data = await notificationService.getNotifications();
        if (isMountedRef.current) {
          setNotifications(data);
          setIsFromCache(false);
          setCachedAt(Date.now());
          await cacheStorage.set(farmerId, 'notifications', data);
        }
      } catch (err) {
        const cached = await cacheStorage.get<NotificationItem[]>(farmerId, 'notifications');
        if (cached && cached.data && isMountedRef.current) {
          setNotifications(cached.data);
          setIsFromCache(true);
          setCachedAt(cached.cachedAt);
        } else if (isMountedRef.current) {
          if (err instanceof AppError) {
            setError(err.message);
          } else {
            setError('Failed to retrieve notifications. Check your connection.');
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [user?.farmerId, token]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchNotifications();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchNotifications]);

  // Derived unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Optimistic Mark as Read with rollback on failure
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const originalNotifications = [...notifications];
      const target = notifications.find((n) => n.id === notificationId);
      if (!target || target.read) return; // Already read

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      try {
        await notificationService.markAsRead(notificationId);
      } catch (err) {
        // Rollback on failure
        if (isMountedRef.current) {
          setNotifications(originalNotifications);
        }
        throw err;
      }
    },
    [notifications]
  );

  const refetch = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    isFromCache,
    cachedAt,
    markAsRead,
    refetch,
  };
};

export default useNotifications;
