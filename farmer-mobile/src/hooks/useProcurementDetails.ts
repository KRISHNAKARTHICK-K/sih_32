import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { procurementService, paymentService } from '../services';
import { Procurement, Payment } from '../types';
import { cacheStorage } from '../storage';
import { AppError } from '../utils/errorHandler';

export interface UseProcurementDetailsResult {
  procurement: Procurement | null;
  payment: Payment | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isFromCache: boolean;
  cachedAt: number | null;
  refetch: () => Promise<void>;
}

export const useProcurementDetails = (procurementId: string): UseProcurementDetailsResult => {
  const { user, token } = useAuth();

  const [procurement, setProcurement] = useState<Procurement | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchDetails = useCallback(
    async (isRefresh = false) => {
      if (!user?.farmerId || !token || !procurementId) {
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
      const cacheKey = `procurement:${procurementId}`;

      try {
        const [procRes, paymentsRes] = await Promise.allSettled([
          procurementService.getProcurementById(procurementId),
          paymentService.getFarmerPayments(farmerId),
        ]);

        if (isMountedRef.current) {
          let currentProc: Procurement | null = null;
          let currentPay: Payment | null = null;

          if (procRes.status === 'fulfilled') {
            currentProc = procRes.value;
            setProcurement(currentProc);
          } else {
            const err = procRes.reason;
            if (err instanceof AppError) {
              setError(err.message);
            } else {
              setError('Failed to retrieve procurement record details.');
            }
          }

          if (paymentsRes.status === 'fulfilled') {
            const matchedPayment = paymentsRes.value.find(
              (p) =>
                p.procurementId === procurementId ||
                (currentProc && p.procurementCode === currentProc.procurementCode)
            );
            currentPay = matchedPayment || null;
            setPayment(currentPay);
          }

          if (currentProc) {
            setIsFromCache(false);
            setCachedAt(Date.now());
            await cacheStorage.set(farmerId, cacheKey, {
              procurement: currentProc,
              payment: currentPay,
            });
          }
        }
      } catch (err) {
        const cached = await cacheStorage.get<{ procurement: Procurement; payment: Payment | null }>(
          farmerId,
          cacheKey
        );
        if (cached && cached.data && isMountedRef.current) {
          setProcurement(cached.data.procurement);
          setPayment(cached.data.payment);
          setIsFromCache(true);
          setCachedAt(cached.cachedAt);
        } else if (isMountedRef.current) {
          if (err instanceof AppError) {
            setError(err.message);
          } else {
            setError('Failed to load procurement details. Check connection.');
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [user?.farmerId, token, procurementId]
  );

  useEffect(() => {
    isMountedRef.current = true;
    fetchDetails();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchDetails]);

  const refetch = useCallback(async () => {
    await fetchDetails(true);
  }, [fetchDetails]);

  return {
    procurement,
    payment,
    loading,
    refreshing,
    error,
    isFromCache,
    cachedAt,
    refetch,
  };
};

export default useProcurementDetails;
