"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/hooks/use-auth';
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
} from '@/lib/types/auth.types';

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  loginStep1: (data: LoginRequestDto) => Promise<LoginInitResponseDto>;
  loginComplete: (data: LoginCompleteRequestDto) => Promise<LoginCompleteResponseDto>;
  registerStep1: (data: RegisterRequestDto) => Promise<RegisterResponseDto>;
  registerConfirm: (data: RegisterConfirmRequestDto) => Promise<RegisterConfirmResponseDto>;
  googleLogin: (data: GoogleLoginDto) => Promise<GoogleLoginResponseDto>;
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