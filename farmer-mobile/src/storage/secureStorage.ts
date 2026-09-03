import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SecureStorageService {
  private memoryFallback: Map<string, string> = new Map();

  private isAvailable(): boolean {
    return Platform.OS !== 'web';
  }

  public async setItem(key: string, value: string): Promise<void> {
    this.memoryFallback.set(key, value);
    try {
      if (this.isAvailable()) {
        await SecureStore.setItemAsync(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // In-memory fallback is active
    }
  }

  public async getItem(key: string): Promise<string | null> {
    try {
      if (this.isAvailable()) {
        const val = await SecureStore.getItemAsync(key);
        if (val !== null) return val;
      } else {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // Fall through to in-memory fallback
    }
    return this.memoryFallback.get(key) || null;
  }

  public async deleteItem(key: string): Promise<void> {
    this.memoryFallback.delete(key);
    try {
      if (this.isAvailable()) {
        await SecureStore.deleteItemAsync(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // In-memory fallback cleared
    }
  }

  public async getObject<T>(key: string): Promise<T | null> {
    const raw = await this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public async setObject<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }
}

export const secureStorage = new SecureStorageService();
