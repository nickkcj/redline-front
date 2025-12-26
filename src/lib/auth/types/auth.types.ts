// === LOGIN FLOW ===
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginInitResponseDto {
  message: string;
  requiresTwoFa: boolean;
  email: string;
}

export interface LoginCompleteRequestDto {
  email: string;
  code: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number; // Optional, defaults to 24 hours if not provided
}

export interface UserInfoDto {
  id: string;
  email: string;
  name: string;
  emailValidated: boolean;
}

export interface LoginCompleteResponseDto {
  user: UserInfoDto;
  accessToken: string;
  refreshToken: string;
}

// === REGISTRATION FLOW ===
export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    emailValidated: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
  requiresEmailVerification: boolean;
}

export interface RegisterConfirmRequestDto {
  email: string;
  code: string;
}

export interface RegisterConfirmResponseDto {
  message: string;
}

// === GOOGLE OAUTH ===
export interface GoogleLoginDto {
  idToken: string;
}

export interface GoogleLoginResponseDto {
  user: UserInfoDto;
  accessToken: string;
  refreshToken: string;
}

// === TOKEN MANAGEMENT ===
export interface RefreshDto {
  refreshToken: string;
}

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}

// === PASSWORD RESET FLOW ===
export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponseDto {
  message: string;
}

// === AUTH STATE ===
export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: UserInfoDto | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string | null;
}

// === API ERROR ===
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}