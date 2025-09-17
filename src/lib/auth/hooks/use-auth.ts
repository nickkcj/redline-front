"use client";

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@/lib/api/services/auth.service';
import { tokenStore } from '@/lib/auth/stores/auth.store';
import {
  AuthState,
  LoginStep1Request,
  LoginCompleteRequest,
  RegisterStep1Request,
  RegisterConfirmRequest,
  GoogleLoginRequest,
  UserInfoDto,
  ApiError,
} from '@/lib/types/auth.types';

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

      // Use mock for development
      const user = await authService.mockGetUserInfo();
      setUser(user);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      tokenStore.clear();
      setUser(null);
    }
  }, [setUser, setLoading]);

  // Login Step 1
  const loginStep1 = useCallback(async (data: LoginStep1Request) => {
    try {
      setLoading(true);
      setError(null);

      // Use mock for development
      const response = await authService.mockLoginStep1(data);
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
  const loginComplete = useCallback(async (data: LoginCompleteRequest) => {
    try {
      setLoading(true);
      setError(null);
      setState(prev => ({ ...prev, status: 'authenticating' }));

      // Use mock for development
      const response = await authService.mockLoginComplete(data);

      tokenStore.setTokens(response.tokens);
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
  const registerStep1 = useCallback(async (data: RegisterStep1Request) => {
    try {
      setLoading(true);
      setError(null);

      // Use mock for development
      const response = await authService.mockRegisterStep1(data);
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
  const registerConfirm = useCallback(async (data: RegisterConfirmRequest) => {
    try {
      setLoading(true);
      setError(null);
      setState(prev => ({ ...prev, status: 'authenticating' }));

      // Use mock for development
      const response = await authService.mockRegisterConfirm(data);

      tokenStore.setTokens(response.tokens);
      setUser(response.user);

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  // Google Login
  const googleLogin = useCallback(async (data: GoogleLoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      setState(prev => ({ ...prev, status: 'authenticating' }));

      const response = await authService.googleLogin(data);

      tokenStore.setTokens(response.tokens);
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

      // Use mock for development
      const user = await authService.mockGetUserInfo();
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
      }
    });

    return unsubscribe;
  }, [state.user, setUser]);

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