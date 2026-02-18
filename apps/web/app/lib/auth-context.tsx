'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from './types';
import { api, ApiError } from './api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const GUILD_API_URL =
  process.env.NEXT_PUBLIC_GUILD_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        // Development mode: auto-login test user
        if (process.env.NODE_ENV === 'development') {
          if (!cancelled) {
            setUser({
              id: '1',
              username: 'TestPlayer',
              battleTag: 'TestPlayer#1234',
              region: 'us',
              locale: 'en_US',
            });
            setIsLoading(false);
            return;
          }
        }

        const userData = await api.get<User>('/auth/me');
        if (!cancelled) {
          setUser(userData);
        }
      } catch (err) {
        // If /auth/me fails, try refreshing the token
        if (err instanceof ApiError && err.status === 401) {
          try {
            const res = await fetch(`${GUILD_API_URL}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });
            if (res.ok) {
              // Retry getting user after refresh
              const userData = await api.get<User>('/auth/me');
              if (!cancelled) {
                setUser(userData);
              }
            } else if (!cancelled) {
              setUser(null);
            }
          } catch {
            if (!cancelled) {
              setUser(null);
            }
          }
        } else if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    window.location.href = `${GUILD_API_URL}/auth/login`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear state even if logout API call fails
    }
    setUser(null);
    window.location.href = '/auth/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
