import { secureStorage } from './secureStorage';

export interface CacheEntry<T> {
  data: T;
  cachedAt: number; // Unix timestamp in ms
  farmerId: string;
  version: number;
}

const CACHE_VERSION = 1;

class CacheStorageService {
  private formatKey(farmerId: string, key: string): string {
    return `agri_cache:farmer:${farmerId}:${key}`;
  }

  private formatGlobalKey(key: string): string {
    return `agri_cache:global:${key}`;
  }

  /**
   * Store data in cache scoped to specific farmer account
   */
  public async set<T>(farmerId: string, key: string, data: T): Promise<void> {
    if (!farmerId || !key) return;
    try {
      const entry: CacheEntry<T> = {
        data,
        cachedAt: Date.now(),
        farmerId,
        version: CACHE_VERSION,
      };
      await secureStorage.setItem(this.formatKey(farmerId, key), JSON.stringify(entry));
    } catch (error) {
      console.warn(`[CacheStorage] Failed to set cache for ${key}:`, error);
    }
  }

  /**
   * Retrieve cached data scoped to specific farmer account
   */
  public async get<T>(
    farmerId: string,
    key: string,
    maxAgeMs: number = 24 * 60 * 60 * 1000 // 24h default
  ): Promise<{ data: T; cachedAt: number; isStale: boolean } | null> {
    if (!farmerId || !key) return null;
    try {
      const raw = await secureStorage.getItem(this.formatKey(farmerId, key));
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);

      // Verify farmer isolation and schema version
      if (entry.farmerId !== farmerId || entry.version !== CACHE_VERSION) {
        return null;
      }

      const age = Date.now() - entry.cachedAt;
      const isStale = age > maxAgeMs;

      return {
        data: entry.data,
        cachedAt: entry.cachedAt,
        isStale,
      };
    } catch {
      // Corruption resilience: ignore corrupted cache
      return null;
    }
  }

  /**
   * Store global non-sensitive data (e.g. active crops, centres)
   */
  public async setGlobal<T>(key: string, data: T): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        cachedAt: Date.now(),
        farmerId: 'global',
        version: CACHE_VERSION,
      };
      await secureStorage.setItem(this.formatGlobalKey(key), JSON.stringify(entry));
    } catch (error) {
      console.warn(`[CacheStorage] Failed to set global cache for ${key}:`, error);
    }
  }

  /**
   * Retrieve global data
   */
  public async getGlobal<T>(
    key: string,
    maxAgeMs: number = 24 * 60 * 60 * 1000
  ): Promise<{ data: T; cachedAt: number; isStale: boolean } | null> {
    try {
      const raw = await secureStorage.getItem(this.formatGlobalKey(key));
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (entry.version !== CACHE_VERSION) return null;

      const age = Date.now() - entry.cachedAt;
      const isStale = age > maxAgeMs;

      return {
        data: entry.data,
        cachedAt: entry.cachedAt,
        isStale,
      };
    } catch {
      return null;
    }
  }

  /**
   * Invalidate all cached data for a specific farmer on logout
   */
  public async clearFarmerCache(farmerId: string): Promise<void> {
    if (!farmerId) return;
    const knownKeys = [
      'dashboard',
      'bookings',
      'procurements',
      'payments',
      'queue',
      'notifications',
      'profile',
    ];

    for (const k of knownKeys) {
      try {
        await secureStorage.deleteItem(this.formatKey(farmerId, k));
      } catch {
        // Continue clearing others
      }
    }
  }
}

export const cacheStorage = new CacheStorageService();
export default cacheStorage;
