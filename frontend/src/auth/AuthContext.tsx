import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from './authApi';
import type { AuthState, AuthUser, LoginCredentials, UserRole } from './authTypes';
import { getStoredToken, setStoredToken, removeStoredToken } from '../api/client';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const role: UserRole | null = user?.role || null;
  const isAuthenticated = !!token && !!user;

  // Hydrate user session on app initialization
  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      setToken(storedToken);
    } catch (err) {
      console.warn('Session restoration failed. Clearing token.', err);
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(credentials);
      setStoredToken(data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    // Purge React Query cache so no sensitive data is retained for the next session
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
