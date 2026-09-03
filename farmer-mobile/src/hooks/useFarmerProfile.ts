import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { farmerService } from '../services';
import { FarmerProfile } from '../types';
import { cacheStorage } from '../storage';
import { AppError } from '../utils/errorHandler';

export interface UseFarmerProfileResult {
  profile: FarmerProfile | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isFromCache: boolean;
  cachedAt: number | null;
  refetch: () => Promise<void>;
}

export const useFarmerProfile = (): UseFarmerProfileResult => {
  const { user, token } = useAuth();

  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchProfile = useCallback(
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
        const data = await farmerService.getFarmerProfile(farmerId);
        if (isMountedRef.current) {
          setProfile(data);
          setIsFromCache(false);
          setCachedAt(Date.now());
          await cacheStorage.set(farmerId, 'profile', data);
        }
      } catch (err) {
        // Fallback to cached profile if network unavailable
        const cached = await cacheStorage.get<FarmerProfile>(farmerId, 'profile');
        if (cached && cached.data && isMountedRef.current) {
          setProfile(cached.data);
          setIsFromCache(true);
          setCachedAt(cached.cachedAt);
        } else if (isMountedRef.current) {
          if (err instanceof AppError) {
            setError(err.message);
          } else {
            setError('Failed to retrieve farmer profile information.');
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
    fetchProfile();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchProfile]);

  const refetch = useCallback(async () => {
    await fetchProfile(true);
  }, [fetchProfile]);

  return {
    profile,
    loading,
    refreshing,
    error,
    isFromCache,
    cachedAt,
    refetch,
  };
};

export default useFarmerProfile;
