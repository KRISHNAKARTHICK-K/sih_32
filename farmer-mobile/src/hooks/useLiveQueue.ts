import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './useAuth';
import { queueService, bookingService } from '../services';
import { QueueToken, QueueOverview, Booking } from '../types';
import { cacheStorage } from '../storage';
import { useNetworkStatus } from '../context';
import { AppError } from '../utils/errorHandler';

export interface UseLiveQueueResult {
  tokens: QueueToken[];
  activeToken: QueueToken | null;
  associatedBooking: Booking | null;
  centreOverview: QueueOverview | null;
  peopleAhead: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isFromCache: boolean;
  cachedAt: number | null;
  selectToken: (tokenId: string) => void;
  refetch: () => Promise<void>;
}

const ACTIVE_QUEUE_PRIORITY = [
  'PROCESSING',
  'WEIGHING',
  'QUALITY_CHECK',
  'WAITING',
  'VERIFIED',
  'ARRIVED',
  'BOOKED',
];

const POLLING_INTERVAL_MS = 12000; // 12 seconds battery-efficient polling

export const useLiveQueue = (preferredTokenId?: string): UseLiveQueueResult => {
  const { user, token } = useAuth();
  const { isOnline } = useNetworkStatus();

  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(preferredTokenId || null);
  const [associatedBooking, setAssociatedBooking] = useState<Booking | null>(null);
  const [centreOverview, setCentreOverview] = useState<QueueOverview | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine active token from tokens array
  const activeToken = useMemo(() => {
    if (tokens.length === 0) return null;

    if (selectedTokenId) {
      const found = tokens.find((t) => t.id === selectedTokenId);
      if (found) return found;
    }

    // Find highest priority active token
    for (const status of ACTIVE_QUEUE_PRIORITY) {
      const match = tokens.find((t) => t.status === status);
      if (match) return match;
    }

    // Fallback to most recent token
    return tokens[0];
  }, [tokens, selectedTokenId]);

  // Main data fetcher
  const fetchQueueData = useCallback(
    async (isRefresh = false) => {
      if (!user?.farmerId || !token) {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else if (!lastUpdated) {
        setLoading(true);
      }
      setError(null);

      const farmerId = user.farmerId;

      try {
        const farmerTokens = await queueService.getFarmerQueueTokens(farmerId);

        if (!isMountedRef.current) return;
        setTokens(farmerTokens);
        setLastUpdated(new Date());
        setIsFromCache(false);
        setCachedAt(Date.now());

        // Determine current token to fetch associated overview & booking
        let current: QueueToken | null = null;
        if (selectedTokenId) {
          current = farmerTokens.find((t) => t.id === selectedTokenId) || null;
        }
        if (!current && farmerTokens.length > 0) {
          for (const status of ACTIVE_QUEUE_PRIORITY) {
            const match = farmerTokens.find((t) => t.status === status);
            if (match) {
              current = match;
              break;
            }
          }
          if (!current) current = farmerTokens[0];
        }

        let fetchedOverview: QueueOverview | null = null;
        let fetchedBooking: Booking | null = null;

        if (current) {
          // Concurrently fetch centre overview & booking details
          const [overviewRes, bookingRes] = await Promise.allSettled([
            queueService.getCentreQueueOverview(current.centreId, current.queueDate),
            bookingService.getBookingById(current.bookingId),
          ]);

          if (isMountedRef.current) {
            if (overviewRes.status === 'fulfilled') {
              fetchedOverview = overviewRes.value;
              setCentreOverview(fetchedOverview);
            }
            if (bookingRes.status === 'fulfilled') {
              fetchedBooking = bookingRes.value;
              setAssociatedBooking(fetchedBooking);
            }
          }
        }

        // Cache queue state
        await cacheStorage.set(farmerId, 'queue', {
          tokens: farmerTokens,
          centreOverview: fetchedOverview,
          associatedBooking: fetchedBooking,
        });
      } catch (err) {
        // Fallback to cache on error
        const cached = await cacheStorage.get<any>(farmerId, 'queue');
        if (cached && cached.data && isMountedRef.current) {
          setTokens(cached.data.tokens || []);
          setCentreOverview(cached.data.centreOverview || null);
          setAssociatedBooking(cached.data.associatedBooking || null);
          setIsFromCache(true);
          setCachedAt(cached.cachedAt);
        } else if (isMountedRef.current) {
          if (err instanceof AppError) {
            setError(err.message);
          } else {
            setError('Failed to refresh live queue status. Check connection.');
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [user?.farmerId, token, selectedTokenId, lastUpdated]
  );

  // Initial load and polling setup with online safety & cleanup
  useEffect(() => {
    isMountedRef.current = true;
    fetchQueueData();

    // Start polling only if online
    if (isOnline) {
      pollingTimerRef.current = setInterval(() => {
        if (isMountedRef.current) {
          fetchQueueData(false);
        }
      }, POLLING_INTERVAL_MS);
    }

    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [fetchQueueData, isOnline]);

  const selectToken = useCallback((tokenId: string) => {
    setSelectedTokenId(tokenId);
  }, []);

  const refetch = useCallback(async () => {
    await fetchQueueData(true);
  }, [fetchQueueData]);

  return {
    tokens,
    activeToken,
    associatedBooking,
    centreOverview,
    peopleAhead: activeToken?.peopleAhead || 0,
    loading,
    refreshing,
    error,
    lastUpdated,
    isFromCache,
    cachedAt,
    selectToken,
    refetch,
  };
};

export default useLiveQueue;
