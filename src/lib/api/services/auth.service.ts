import { apiClient } from '@/lib/api/client/base.client';
import {
  LoginStep1Request,
  LoginStep1Response,
  LoginCompleteRequest,
  LoginCompleteResponse,
  RegisterStep1Request,
  RegisterStep1Response,
  RegisterConfirmRequest,
  GoogleLoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserInfoDto,
  TokenData,
} from '@/lib/types/auth.types';

class AuthService {
  async loginStep1(data: LoginStep1Request): Promise<LoginStep1Response> {
    return apiClient.post<LoginStep1Response>('/auth/login', data, {
      skipAuth: true,
    });
  }

  async loginComplete(data: LoginCompleteRequest): Promise<LoginCompleteResponse> {
    return apiClient.post<LoginCompleteResponse>('/auth/login/complete', data, {
      skipAuth: true,
    });
  }

  async registerStep1(data: RegisterStep1Request): Promise<RegisterStep1Response> {
    return apiClient.post<RegisterStep1Response>('/auth/register', data, {
      skipAuth: true,
    });
  }

  async registerConfirm(data: RegisterConfirmRequest): Promise<LoginCompleteResponse> {
    return apiClient.post<LoginCompleteResponse>('/auth/register/confirm', data, {
      skipAuth: true,
    });
  }

  async googleLogin(data: GoogleLoginRequest): Promise<LoginCompleteResponse> {
    return apiClient.post<LoginCompleteResponse>('/auth/google', data, {
      skipAuth: true,
    });
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors, clear tokens anyway
      console.warn('Logout API call failed:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    return apiClient.post<TokenData>('/auth/refresh', { refreshToken }, {
      skipAuth: true,
    });
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', data, {
      skipAuth: true,
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data, {
      skipAuth: true,
    });
  }

  async getUserInfo(): Promise<UserInfoDto> {
    return apiClient.get<UserInfoDto>('/auth/me');
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
  async mockLoginStep1(data: LoginStep1Request): Promise<LoginStep1Response> {
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
    };
  }

  async mockLoginComplete(data: LoginCompleteRequest): Promise<LoginCompleteResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (data.twoFaCode !== '123456') {
      throw new Error('Invalid verification code');
    }

    const mockTokens: TokenData = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600, // 1 hour
    };

    const mockUser: UserInfoDto = {
      id: '1',
      email: data.email,
      name: 'Mock User',
      avatar: undefined,
      emailVerified: true,
      twoFactorEnabled: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      tokens: mockTokens,
      user: mockUser,
    };
  }

  async mockRegisterStep1(data: RegisterStep1Request): Promise<RegisterStep1Response> {
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
      message: 'Verification code sent to your email.',
      email: data.email,
    };
  }

  async mockRegisterConfirm(data: RegisterConfirmRequest): Promise<LoginCompleteResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (data.code !== '123456') {
      throw new Error('Invalid verification code');
    }

    const mockTokens: TokenData = {
      accessToken: 'mock_access_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600, // 1 hour
    };

    const mockUser: UserInfoDto = {
      id: '1',
      email: data.email,
      name: 'New User',
      avatar: undefined,
      emailVerified: true,
      twoFactorEnabled: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      tokens: mockTokens,
      user: mockUser,
    };
  }

  async mockGetUserInfo(): Promise<UserInfoDto> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: '1',
      email: 'user@example.com',
      name: 'Mock User',
      avatar: undefined,
      emailVerified: true,
      twoFactorEnabled: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const authService = new AuthService();