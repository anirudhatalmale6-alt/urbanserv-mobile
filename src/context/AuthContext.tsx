import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/theme';

// ── Types ──────────────────────────────────────────────

export type UserRole = 'CONSUMER' | 'PROVIDER';

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  sendOTP: (phone: string) => Promise<{ success: boolean; otp?: string; message?: string }>;
  verifyOTP: (phone: string, otp: string, role: UserRole, name?: string) => Promise<{ success: boolean; user?: User; isNewUser?: boolean; message?: string }>;
  completeName: (name: string) => Promise<{ success: boolean }>;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Secure Store Keys ──────────────────────────────────

const STORE_KEYS = {
  USER: 'urbanserv_user',
  TOKEN: 'urbanserv_token',
};

// ── Context ────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Load persisted user on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync(STORE_KEYS.USER);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = useCallback(async (phone: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, otp: data.otp, message: 'OTP sent successfully' };
      } else {
        return { success: false, message: data.error || 'Failed to send OTP' };
      }
    } catch (error) {
      // In dev mode, return a mock OTP
      console.log('API unavailable, using dev mode OTP');
      return { success: true, otp: '123456', message: 'OTP sent (dev mode)' };
    }
  }, []);

  const verifyOTP = useCallback(async (phone: string, otp: string, role: UserRole, name?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, role, name }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        const userData: User = {
          id: data.user.id,
          name: data.user.name || '',
          email: data.user.email || null,
          phone: data.user.phone || phone,
          role: data.user.role || role,
        };

        // If user has a name, they're an existing user — log them in
        if (userData.name) {
          await persistUser(userData);
          setUser(userData);
          return { success: true, user: userData, isNewUser: false };
        }

        // New user — need to collect name
        return { success: true, user: userData, isNewUser: true };
      } else {
        return { success: false, message: data.error || 'Invalid OTP' };
      }
    } catch (error) {
      // Dev mode: simulate successful verification
      console.log('API unavailable, using dev mode verification');
      const mockUser: User = {
        id: `dev_${Date.now()}`,
        name: name || '',
        email: null,
        phone,
        role,
      };

      if (mockUser.name) {
        await persistUser(mockUser);
        setUser(mockUser);
        return { success: true, user: mockUser, isNewUser: false };
      }

      return { success: true, user: mockUser, isNewUser: true };
    }
  }, []);

  const completeName = useCallback(async (name: string) => {
    if (!user) return { success: false };

    const updatedUser: User = { ...user, name };

    try {
      // Attempt to update the name on the backend
      await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': updatedUser.id,
        },
        body: JSON.stringify({ name }),
      });
    } catch (error) {
      // Continue even if the API call fails — we persist locally
      console.log('Profile update API unavailable, saving locally');
    }

    await persistUser(updatedUser);
    setUser(updatedUser);
    return { success: true };
  }, [user]);

  const login = useCallback(async (userData: User) => {
    await persistUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(STORE_KEYS.USER);
      await SecureStore.deleteItemAsync(STORE_KEYS.TOKEN);
    } catch (error) {
      console.error('Failed to clear stored data:', error);
    }
    setUser(null);
    setSelectedRole(null);
  }, []);

  const persistUser = async (userData: User) => {
    try {
      await SecureStore.setItemAsync(STORE_KEYS.USER, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to persist user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!user.name,
    selectedRole,
    setSelectedRole,
    sendOTP,
    verifyOTP,
    completeName,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
