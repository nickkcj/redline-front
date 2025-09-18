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
} from '@/lib/types/auth.types';

class AuthService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  async loginStep1(data: LoginRequestDto): Promise<LoginInitResponseDto> {
    try {
      return await apiClient.post<LoginInitResponseDto>('/auth/login', data, {
        skipAuth: true,
      });
    } catch (error: any) {
      // If API is not available in development, use mock
      if (this.isDevelopment && (error?.code === 'NETWORK_ERROR' || error?.statusCode === 404)) {
        console.warn('API not available, using mock data for development');
        return this.mockLoginStep1(data);
      }
      throw error;
    }
  }

  async loginComplete(data: LoginCompleteRequestDto): Promise<LoginCompleteResponseDto> {
    try {
      return await apiClient.post<LoginCompleteResponseDto>('/auth/login/complete', data, {
        skipAuth: true,
      });
    } catch (error: any) {
      // If API is not available in development, use mock
      if (this.isDevelopment && (error?.code === 'NETWORK_ERROR' || error?.statusCode === 404)) {
        console.warn('API not available, using mock data for development');
        return this.mockLoginComplete(data);
      }
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
    const response = await fetch(`${API_BASE_URL}/auth/google/url?callback_url=${encodeURIComponent(callbackUrl)}`);

    if (!response.ok) {
      throw new Error('Erro ao obter URL de autenticação');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const accessToken = tokenStore.getAccessToken();

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const accessToken = tokenStore.getAccessToken();

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      return response.json();
    } catch (error: any) {
      // If API is not available in development, use mock
      if (this.isDevelopment && (error?.message?.includes('fetch') || error?.message?.includes('Network'))) {
        console.warn('API not available, using mock data for development');
        return this.mockGetUserInfo();
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

  // Mock implementations for development
  async mockLoginStep1(data: LoginRequestDto): Promise<LoginInitResponseDto> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    if (data.email === 'error@test.com') {
      throw new Error('Invalid credentials');
    }

    return {
      requiresTwoFa: true,
      message: 'Please enter the verification code sent to your email.',
      email: data.email,
    };
  }

  async mockLoginComplete(data: LoginCompleteRequestDto): Promise<LoginCompleteResponseDto> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (data.code !== '123456') {
      throw new Error('Invalid verification code');
    }

    const mockUser: UserInfoDto = {
      id: '1',
      email: data.email,
      name: 'Mock User',
      emailValidated: true,
    };

    return {
      user: mockUser,
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    };
  }

  async mockRegisterStep1(data: RegisterRequestDto): Promise<RegisterResponseDto> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (!data.name || !data.email || !data.password) {
      throw new Error('All fields are required');
    }

    if (data.email === 'existing@test.com') {
      throw new Error('Email already exists');
    }

    return {
      user: {
        id: '1',
        name: data.name,
        email: data.email,
        emailValidated: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: 'Verification code sent to your email.',
      requiresEmailVerification: true,
    };
  }

  async mockRegisterConfirm(data: RegisterConfirmRequestDto): Promise<RegisterConfirmResponseDto> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (data.code !== '123456') {
      throw new Error('Invalid verification code');
    }

    return {
      message: 'Email verified successfully',
    };
  }

  async mockGetUserInfo(): Promise<UserInfoDto> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: '1',
      email: 'user@example.com',
      name: 'Mock User',
      emailValidated: true,
    };
  }
}

export const authService = new AuthService();