"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/hooks/use-auth';
import {
  AuthState,
  LoginStep1Request,
  LoginCompleteRequest,
  RegisterStep1Request,
  RegisterConfirmRequest,
  GoogleLoginRequest,
} from '@/lib/types/auth.types';

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  loginStep1: (data: LoginStep1Request) => Promise<any>;
  loginComplete: (data: LoginCompleteRequest) => Promise<any>;
  registerStep1: (data: RegisterStep1Request) => Promise<any>;
  registerConfirm: (data: RegisterConfirmRequest) => Promise<any>;
  googleLogin: (data: GoogleLoginRequest) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}