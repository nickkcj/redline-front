import { apiClient } from '@/lib/api/client/base.client';
import { tokenStore } from '@/lib/auth/stores/auth.store';
import {
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
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  RefreshDto,
  RefreshResponseDto,
  UserInfoDto,
  TokenData,
} from '@/lib/auth/types/auth.types';

class AuthService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  async loginStep1(data: LoginRequestDto): Promise<LoginInitResponseDto> {
    try {
      return await apiClient.post<LoginInitResponseDto>('/auth/login', data, {
        skipAuth: true,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async loginComplete(data: LoginCompleteRequestDto): Promise<LoginCompleteResponseDto> {
    try {
      return await apiClient.post<LoginCompleteResponseDto>('/auth/login/complete', data, {
        skipAuth: true,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async registerStep1(data: RegisterRequestDto): Promise<RegisterResponseDto> {
    return apiClient.post<RegisterResponseDto>('/auth/register', data, {
      skipAuth: true,
    });
  }

  async registerConfirm(data: RegisterConfirmRequestDto): Promise<RegisterConfirmResponseDto> {
    return apiClient.post<RegisterConfirmResponseDto>('/auth/register/confirm', data, {
      skipAuth: true,
    });
  }

  async googleLogin(data: GoogleLoginDto): Promise<GoogleLoginResponseDto> {
    return apiClient.post<GoogleLoginResponseDto>('/auth/google', data, {
      skipAuth: true,
    });
  }

  async getGoogleOAuthUrl(callbackUrl: string): Promise<{ authUrl: string }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
    
    const response = await fetch(`${API_BASE_URL}/auth/google/init?callback_url=${encodeURIComponent(callbackUrl)}`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao obter URL de autenticação');
    }

    return response.json();
  }

  async requestMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
    
    // Set the callback URL for magic link
    const callbackUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/magic-link`
      : 'http://localhost:3000/auth/magic-link';
    
    const response = await fetch(`${API_BASE_URL}/auth/email/init`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        callback_url: callbackUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao enviar magic link');
    }

    return response.json();
  }

  async verifyMagicLink(token: string): Promise<{ success: boolean; sessionToken: string; user: UserInfoDto }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
    
    const response = await fetch(`${API_BASE_URL}/auth/email/callback`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Magic link inválido ou expirado');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
      const accessToken = tokenStore.getAccessToken();

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'x-parse-session-token': accessToken || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      // Ignore logout errors, clear tokens anyway
      console.warn('Logout API call failed:', error);
    }
  }

  async refreshToken(data: RefreshDto): Promise<RefreshResponseDto> {
    return apiClient.post<RefreshResponseDto>('/auth/refresh', data, {
      skipAuth: true,
    });
  }

  async forgotPassword(data: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> {
    return apiClient.post<ForgotPasswordResponseDto>('/auth/forgot-password', data, {
      skipAuth: true,
    });
  }

  async resetPassword(data: ResetPasswordRequestDto): Promise<ResetPasswordResponseDto> {
    return apiClient.post<ResetPasswordResponseDto>('/auth/reset-password', data, {
      skipAuth: true,
    });
  }

  async getUserInfo(): Promise<UserInfoDto> {
    try {
      return await apiClient.get<UserInfoDto>('/auth/me');
    } catch (error: any) {
      // Handle 401 - redirect to login (apiClient already handles this, but we keep for clarity)
      if (error?.statusCode === 401) {
        tokenStore.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Token inválido ou expirado');
      }
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/verify-email', { token }, {
      skipAuth: true,
    });
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/resend-verification', { email }, {
      skipAuth: true,
    });
  }
}

export const authService = new AuthService();