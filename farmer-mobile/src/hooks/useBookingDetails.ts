import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { bookingService } from '../services';
import { Booking } from '../types';
import { cacheStorage } from '../storage';
import { AppError } from '../utils/errorHandler';

export interface UseBookingDetailsResult {
  booking: Booking | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isFromCache: boolean;
  cachedAt: number | null;
  refetch: () => Promise<void>;
}

export const useBookingDetails = (bookingId: string): UseBookingDetailsResult => {
  const { user, token } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchBooking = useCallback(
    async (isRefresh = false) => {
      if (!bookingId || !token || !user?.farmerId) {
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
      const cacheKey = `booking:${bookingId}`;

      try {
        const data = await bookingService.getBookingById(bookingId);
        if (isMountedRef.current) {
          setBooking(data);
          setIsFromCache(false);
          setCachedAt(Date.now());
          await cacheStorage.set(farmerId, cacheKey, data);
        }
      } catch (err) {
        const cached = await cacheStorage.get<Booking>(farmerId, cacheKey);
        if (cached && cached.data && isMountedRef.current) {
          setBooking(cached.data);
          setIsFromCache(true);
          setCachedAt(cached.cachedAt);
        } else if (isMountedRef.current) {
          if (err instanceof AppError) {
            setError(err.message);
          } else {
            setError('Failed to retrieve slot booking details.');
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [bookingId, token, user?.farmerId]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchBooking();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchBooking]);

  const refetch = useCallback(async () => {
    await fetchBooking(true);
  }, [fetchBooking]);

  return {
    booking,
    loading,
    refreshing,
    error,
    isFromCache,
    cachedAt,
    refetch,
  };
};

export default useBookingDetails;
