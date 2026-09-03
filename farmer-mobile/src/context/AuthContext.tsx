import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { User, LoginCredentials } from '../types';
import { authService } from '../services';
import { secureStorage, cacheStorage } from '../storage';
import { AppConfig } from '../constants';
import { setOnUnauthorizedCallback } from '../api';
import { AppError } from '../utils/errorHandler';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (user?.farmerId) {
        await cacheStorage.clearFarmerCache(user.farmerId);
      }
      await authService.logout();
    } catch {
      // Ignore cleanup error
    } finally {
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, [user]);

  // Configure automatic logout on expired session
  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      logout();
    });
    return () => {
      setOnUnauthorizedCallback(null);
    };
  }, [logout]);

  // Restore authenticated session on app launch
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = await secureStorage.getItem(AppConfig.storageKeys.authToken);
        if (!storedToken) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const cachedUser = await secureStorage.getObject<User>(AppConfig.storageKeys.userSession);
        if (cachedUser && cachedUser.role === 'FARMER' && isMounted) {
          setToken(storedToken);
          setUser(cachedUser);
        }

        // Verify active token with backend
        try {
          const freshUser = await authService.getMe();
          if (isMounted) {
            setToken(storedToken);
            setUser(freshUser);
            await secureStorage.setObject(AppConfig.storageKeys.userSession, freshUser);
          }
        } catch (apiErr) {
          if (apiErr instanceof AppError && (apiErr.type === 'UNAUTHORIZED' || apiErr.type === 'FORBIDDEN')) {
            await authService.logout();
            if (isMounted) {
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch {
        // Fallback to unauthenticated state on storage failure
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const session = await authService.login(credentials);

      await secureStorage.setItem(AppConfig.storageKeys.authToken, session.accessToken);
      await secureStorage.setObject(AppConfig.storageKeys.userSession, session.user);

      setToken(session.accessToken);
      setUser(session.user);
    } catch (err) {
      if (err instanceof AppError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials and network connection.');
      }
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticating,
      error,
      login,
      logout,
      clearError,
    }),
    [user, token, isLoading, isAuthenticating, error, login, logout, clearError]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
