'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService, LoginRequest } from '../services/authService';
import { getUserData } from '../utils/helpers';

interface User {
  UserID: number | string;
  UserName: string;
  UserRole: string;
  RestaurantID: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = getUserData();
        if (userData) {
          setUser({
            UserID: userData.UserID,
            UserName: userData.UserName,
            UserRole: userData.UserRole?.toLowerCase(),
            RestaurantID: userData.RestaurantID,
          });
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);

      if (!response.error && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);

        const userData = getUserData();
        if (userData) {
          const normalizedUser = {
            UserID: userData.UserID,
            UserName: userData.UserName,
            UserRole: userData.UserRole?.toLowerCase(),
            RestaurantID: userData.RestaurantID,
          };
          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        }

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
