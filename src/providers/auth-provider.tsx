'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, getMe } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('fitai_admin_token');
    const savedUser = localStorage.getItem('fitai_admin_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('fitai_admin_user');
      }

      // Verify token is still valid
      getMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem('fitai_admin_user', JSON.stringify(freshUser));
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem('fitai_admin_token');
          localStorage.removeItem('fitai_admin_user');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin(email, password);
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('fitai_admin_token', response.token);
        localStorage.setItem('fitai_admin_user', JSON.stringify(response.user));
        router.push('/dashboard');
      } else {
        throw new Error('Login failed');
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fitai_admin_token');
    localStorage.removeItem('fitai_admin_user');
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated, isAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
