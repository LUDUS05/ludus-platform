'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location: string;
  preferences: string[];
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  location: string;
  preferences: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          // Verify token and get user data
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
      } else {
        // Refresh failed, logout user
        logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  // Set up token refresh interval
  useEffect(() => {
    if (token) {
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000); // Refresh every 14 minutes (assuming 15-minute token expiry)

      return () => clearInterval(refreshInterval);
    }
  }, [token, refreshToken]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
