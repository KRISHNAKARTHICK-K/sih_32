import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { procurementService } from '../services';
import { Procurement } from '../types';
import { cacheStorage } from '../storage';
import { AppError } from '../utils/errorHandler';

export interface UseProcurementsResult {
  procurements: Procurement[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isFromCache: boolean;
  cachedAt: number | null;
  refetch: () => Promise<void>;
}

export const useProcurements = (): UseProcurementsResult => {
  const { user, token } = useAuth();

  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchProcurements = useCallback(
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
        const data = await procurementService.getFarmerProcurements(farmerId);
        if (isMountedRef.current) {
          setProcurements(data);
          setIsFromCache(false);
          setCachedAt(Date.now());
          await cacheStorage.set(farmerId, 'procurements', data);
        }
      } catch (err) {
        const cached = await cacheStorage.get<Procurement[]>(farmerId, 'procurements');
        if (cached && cached.data && isMountedRef.current) {
          setProcurements(cached.data);
          setIsFromCache(true);
          setCachedAt(cached.cachedAt);
        } else if (isMountedRef.current) {
          if (err instanceof AppError) {
            setError(err.message);
          } else {
            setError('Failed to retrieve procurement records. Check connection.');
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
    fetchProcurements();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchProcurements]);

  const refetch = useCallback(async () => {
    await fetchProcurements(true);
  }, [fetchProcurements]);

  return {
    procurements,
    loading,
    refreshing,
    error,
    isFromCache,
    cachedAt,
    refetch,
  };
};

export default useProcurements;
