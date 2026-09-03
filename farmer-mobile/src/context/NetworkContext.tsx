import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';

export interface NetworkContextType {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnlineTime: number | null;
  reportNetworkSuccess: () => void;
  reportNetworkError: (isTransientOrTimeout?: boolean) => void;
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// Global callbacks so Axios interceptor can notify NetworkContext without circular imports
type NetworkListener = (isOnline: boolean) => void;
const listeners: Set<NetworkListener> = new Set();

export const notifyNetworkState = (isOnline: boolean) => {
  listeners.forEach((listener) => listener(isOnline));
};

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<number | null>(Date.now());

  const markOnline = useCallback(() => {
    setIsOnline((prev) => {
      if (!prev) {
        setIsReconnecting(true);
        setTimeout(() => {
          setIsReconnecting(false);
        }, 3000);
        setLastOnlineTime(Date.now());
        return true;
      }
      return prev;
    });
  }, []);

  const markOffline = useCallback(() => {
    setIsOnline((prev) => {
      if (prev) {
        setIsReconnecting(false);
        return false;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    // Listen to notifications from Axios or native network changes
    const handleStateChange = (online: boolean) => {
      if (online) {
        markOnline();
      } else {
        markOffline();
      }
    };

    listeners.add(handleStateChange);

    // If on web, listen to browser online/offline events
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleWebOnline = () => markOnline();
      const handleWebOffline = () => markOffline();

      window.addEventListener('online', handleWebOnline);
      window.addEventListener('offline', handleWebOffline);

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        markOffline();
      }

      return () => {
        listeners.delete(handleStateChange);
        window.removeEventListener('online', handleWebOnline);
        window.removeEventListener('offline', handleWebOffline);
      };
    }

    return () => {
      listeners.delete(handleStateChange);
    };
  }, [markOnline, markOffline]);

  const reportNetworkSuccess = useCallback(() => {
    markOnline();
  }, [markOnline]);

  const reportNetworkError = useCallback((_isTransientOrTimeout = true) => {
    markOffline();
  }, [markOffline]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    return isOnline;
  }, [isOnline]);

  const value: NetworkContextType = {
    isOnline,
    isReconnecting,
    lastOnlineTime,
    reportNetworkSuccess,
    reportNetworkError,
    checkConnection,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetworkStatus = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;
