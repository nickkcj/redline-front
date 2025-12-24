"use client";

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/api/services/auth.service';
import { tokenStore } from '@/lib/auth/stores/auth.store';
import {
  AuthState,
  LoginRequestDto,
  LoginInitResponseDto,
  LoginCompleteRequestDto,
  LoginCompleteResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  RegisterConfirmRequestDto,
  RegisterConfirmResponseDto,
  GoogleLoginDto,
  GoogleLoginResponseDto,
  UserInfoDto,
} from '@/lib/auth/types/auth.types';

const initialState: AuthState = {
  user: null,
  status: 'idle',
  isLoading: true,
  error: null,
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setUser = useCallback((user: UserInfoDto | null) => {
    setState(prev => ({
      ...prev,
      user,
      status: user ? 'authenticated' : 'unauthenticated',
      isLoading: false,
      error: null,
    }));
  }, []);

  // Initialize auth state
  const initialize = useCallback(async () => {
    try {
      if (!tokenStore.isAuthenticated()) {
        setUser(null);
        return;
      }

      setLoading(true);
      setState(prev => ({ ...prev, status: 'authenticating' }));

      // Try to get user from localStorage first (like candor-front)
      const savedUser = tokenStore.getUser();
      if (savedUser) {
        setUser(savedUser);
        return;
      }

      // If no saved user, fetch from API
      const user = await authService.mockGetUserInfo();
      setUser(user);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      tokenStore.clear();
      setUser(null);
    }
  }, [setUser, setLoading]);

  // Login Step 1
  const loginStep1 = useCallback(async (data: LoginRequestDto): Promise<LoginInitResponseDto> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.loginStep1(data);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Login Complete (with 2FA)
  const loginComplete = useCallback(async (data: LoginCompleteRequestDto): Promise<LoginCompleteResponseDto> => {
    try {
      setLoading(true);
      setError(null);
      setState(prev => ({ ...prev, status: 'authenticating' }));

      const response = await authService.loginComplete(data);

      // Update tokenStore to use new response format
      tokenStore.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: 3600 // default 1 hour
      });
      setUser(response.user);

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  // Register Step 1
  const registerStep1 = useCallback(async (data: RegisterRequestDto): Promise<RegisterResponseDto> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.registerStep1(data);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Register Confirm
  const registerConfirm = useCallback(async (data: RegisterConfirmRequestDto): Promise<RegisterConfirmResponseDto> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.registerConfirm(data);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Google Login
  const googleLogin = useCallback(async (data: GoogleLoginDto): Promise<GoogleLoginResponseDto> => {
    try {
      setLoading(true);
      setError(null);
      setState(prev => ({ ...prev, status: 'authenticating' }));

      const response = await authService.googleLogin(data);

      // Update tokenStore to use new response format
      tokenStore.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: 3600 // default 1 hour
      });
      setUser(response.user);

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google login failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, [setUser]);

  // Refresh user info
  const refreshUser = useCallback(async () => {
    try {
      if (!tokenStore.isAuthenticated()) {
        setUser(null);
        return;
      }

      const user = await authService.getUserInfo();
      setUser(user);
    } catch (error) {
      console.error('Failed to refresh user info:', error);
      tokenStore.clear();
      setUser(null);
    }
  }, [setUser]);

  // Subscribe to token changes
  useEffect(() => {
    const unsubscribe = tokenStore.subscribe(() => {
      const isAuthenticated = tokenStore.isAuthenticated();
      if (!isAuthenticated && state.user) {
        setUser(null);
      } else if (isAuthenticated && !state.user) {
        // If tokens were added but no user, initialize
        initialize();
      }
    });

    return unsubscribe;
  }, [state.user, setUser, initialize]);

  // Listen for storage changes (like candor-front)
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'access_token') {
        const hasToken = !!localStorage.getItem('access_token');
        if (hasToken && !state.user) {
          // Token was added, initialize auth
          initialize();
        } else if (!hasToken && state.user) {
          // Token was removed, logout
          setUser(null);
        }
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [state.user, setUser, initialize]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    ...state,
    isAuthenticated: !!state.user,

    // Actions
    loginStep1,
    loginComplete,
    registerStep1,
    registerConfirm,
    googleLogin,
    logout,
    refreshUser,
    initialize,

    // Utilities
    clearError: () => setError(null),
  };
}