import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  farmerService,
  cropService,
  notificationService,
} from '../services';
import {
  Booking,
  QueueToken,
  Procurement,
  Payment,
  Crop,
} from '../types';
import { cacheStorage } from '../storage';
import { AppError } from '../utils/errorHandler';

export interface FarmerDashboardData {
  bookings: Booking[];
  activeBooking: Booking | null;
  queueTokens: QueueToken[];
  activeQueueToken: QueueToken | null;
  procurements: Procurement[];
  latestProcurement: Procurement | null;
  payments: Payment[];
  latestPayment: Payment | null;
  crops: Crop[];
  unreadNotifications: number;
  totalDisbursedAmount: number;
  totalProcuredQuantity: number;
}

export interface UseFarmerDashboardResult extends FarmerDashboardData {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isFromCache: boolean;
  cachedAt: number | null;
  refetch: () => Promise<void>;
}

const ACTIVE_QUEUE_STATUSES = new Set([
  'BOOKED',
  'ARRIVED',
  'VERIFIED',
  'WAITING',
  'PROCESSING',
  'WEIGHING',
  'QUALITY_CHECK',
]);

export const useFarmerDashboard = (): UseFarmerDashboardResult => {
  const { user, token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [queueTokens, setQueueTokens] = useState<QueueToken[]>([]);
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  const fetchDashboardData = useCallback(
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
        // Fetch all data sources concurrently
        const [
          bookingsRes,
          queueRes,
          procurementsRes,
          paymentsRes,
          cropsRes,
          unreadRes,
        ] = await Promise.allSettled([
          farmerService.getFarmerBookings(farmerId),
          farmerService.getFarmerQueueTokens(farmerId),
          farmerService.getFarmerProcurements(farmerId),
          farmerService.getFarmerPayments(farmerId),
          cropService.getActiveCrops(),
          notificationService.getUnreadCount(),
        ]);

        let fetchedBookings = bookings;
        let fetchedQueue = queueTokens;
        let fetchedProcurements = procurements;
        let fetchedPayments = payments;
        let fetchedCrops = crops;
        let fetchedUnread = unreadNotifications;

        if (bookingsRes.status === 'fulfilled') {
          fetchedBookings = bookingsRes.value || [];
          setBookings(fetchedBookings);
        }

        if (queueRes.status === 'fulfilled') {
          fetchedQueue = queueRes.value || [];
          setQueueTokens(fetchedQueue);
        }

        if (procurementsRes.status === 'fulfilled') {
          fetchedProcurements = procurementsRes.value || [];
          setProcurements(fetchedProcurements);
        }

        if (paymentsRes.status === 'fulfilled') {
          fetchedPayments = paymentsRes.value || [];
          setPayments(fetchedPayments);
        }

        if (cropsRes.status === 'fulfilled') {
          fetchedCrops = cropsRes.value || [];
          setCrops(fetchedCrops);
        }

        if (unreadRes.status === 'fulfilled') {
          fetchedUnread = unreadRes.value || 0;
          setUnreadNotifications(fetchedUnread);
        }

        // Cache successful fetch
        if (
          bookingsRes.status === 'fulfilled' ||
          procurementsRes.status === 'fulfilled'
        ) {
          setIsFromCache(false);
          setCachedAt(Date.now());
          await cacheStorage.set(farmerId, 'dashboard', {
            bookings: fetchedBookings,
            queueTokens: fetchedQueue,
            procurements: fetchedProcurements,
            payments: fetchedPayments,
            crops: fetchedCrops,
            unreadNotifications: fetchedUnread,
          });
        }

        // If core requests failed (e.g. offline)
        if (
          bookingsRes.status === 'rejected' &&
          queueRes.status === 'rejected' &&
          procurementsRes.status === 'rejected'
        ) {
          // Attempt offline cache recovery
          const cached = await cacheStorage.get<any>(farmerId, 'dashboard');
          if (cached && cached.data) {
            setBookings(cached.data.bookings || []);
            setQueueTokens(cached.data.queueTokens || []);
            setProcurements(cached.data.procurements || []);
            setPayments(cached.data.payments || []);
            setCrops(cached.data.crops || []);
            setUnreadNotifications(cached.data.unreadNotifications || 0);
            setIsFromCache(true);
            setCachedAt(cached.cachedAt);
          } else {
            const reason = bookingsRes.reason;
            if (reason instanceof AppError) {
              setError(reason.message);
            } else {
              setError('Failed to synchronize dashboard data. Please check your connection.');
            }
          }
        }
      } catch (err) {
        // Fallback to cache on unexpected exception
        const cached = await cacheStorage.get<any>(farmerId, 'dashboard');
        if (cached && cached.data) {
          setBookings(cached.data.bookings || []);
          setQueueTokens(cached.data.queueTokens || []);
          setProcurements(cached.data.procurements || []);
          setPayments(cached.data.payments || []);
          setCrops(cached.data.crops || []);
          setUnreadNotifications(cached.data.unreadNotifications || 0);
          setIsFromCache(true);
          setCachedAt(cached.cachedAt);
        } else if (err instanceof AppError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while loading dashboard.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.farmerId, token]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived Values
  const activeBooking = useMemo(() => {
    return (
      bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'PENDING') || null
    );
  }, [bookings]);

  const activeQueueToken = useMemo(() => {
    return queueTokens.find((t) => ACTIVE_QUEUE_STATUSES.has(t.status)) || null;
  }, [queueTokens]);

  const latestProcurement = useMemo(() => {
    return procurements.length > 0 ? procurements[0] : null;
  }, [procurements]);

  const latestPayment = useMemo(() => {
    return payments.length > 0 ? payments[0] : null;
  }, [payments]);

  const totalDisbursedAmount = useMemo(() => {
    return payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  const totalProcuredQuantity = useMemo(() => {
    return procurements
      .filter((p) => p.status === 'COMPLETED' || p.status === 'APPROVED')
      .reduce((sum, p) => sum + (Number(p.actualQuantity) || Number(p.declaredQuantity) || 0), 0);
  }, [procurements]);

  const refetch = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  return {
    bookings,
    activeBooking,
    queueTokens,
    activeQueueToken,
    procurements,
    latestProcurement,
    payments,
    latestPayment,
    crops,
    unreadNotifications,
    totalDisbursedAmount,
    totalProcuredQuantity,
    loading,
    refreshing,
    error,
    isFromCache,
    cachedAt,
    refetch,
  };
};

export default useFarmerDashboard;
