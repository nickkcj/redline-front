export interface LoginStep1Request {
  email: string;
  password: string;
}

export interface LoginStep1Response {
  requiresTwoFa: boolean;
  message: string;
}

export interface LoginCompleteRequest {
  email: string;
  password: string;
  twoFaCode: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserInfoDto {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCompleteResponse {
  tokens: TokenData;
  user: UserInfoDto;
}

export interface RegisterStep1Request {
  name: string;
  email: string;
  password: string;
}

export interface RegisterStep1Response {
  message: string;
  email: string;
}

export interface RegisterConfirmRequest {
  email: string;
  code: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthState {
  user: UserInfoDto | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
  error: string | null;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}