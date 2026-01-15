import { apiClient } from '@/lib/api/client/base.client'
import { UserDTO, UserInfoDto } from '../types';
import { mockApiClient, MOCK_MODE } from '../mock/mock-client'


export class AuthService {
  private readonly appUrl: string

  constructor(appUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') {
    this.appUrl = appUrl
  }

  static async getGoogleOAuthUrl(callbackUrl: string): Promise<{ authUrl: string }> {
    if (MOCK_MODE) {
      console.log('[AUTH-SERVICE] Using MOCK mode for Google OAuth')
      return mockApiClient.googleLogin()
    }
    return apiClient.get<{ authUrl: string }>(
      `/auth/google/init?callback_url=${encodeURIComponent(callbackUrl)}`,
      { skipAuth: true }
    )
  }

  static async googleCallback(code: string, callbackUrl: string): Promise<{ success: boolean; sessionToken: string; user: UserInfoDto }> {
    if (MOCK_MODE) {
      console.log('[AUTH-SERVICE] Using MOCK mode for Google Callback')
      const result = await mockApiClient.login('mock@scaffold.com')
      return {
        success: result.success,
        sessionToken: result.sessionToken,
        user: result.user as any,
      }
    }
    return apiClient.post<{ success: boolean; sessionToken: string; user: UserInfoDto }>(
      '/auth/google/callback',
      {
        code,
        callback_url: callbackUrl,
      },
      { skipAuth: true }
    )
  }

  static async requestMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    if (MOCK_MODE) {
      console.log('[AUTH-SERVICE] Using MOCK mode for Magic Link')
      await mockApiClient.login(email)
      return {
        success: true,
        message: 'Magic link enviado (mockado)',
      }
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const callbackUrl = `${appUrl}/auth/magic-link`

    return apiClient.post<{ success: boolean; message: string }>(
      '/auth/email/init',
      {
        email,
        callback_url: callbackUrl,
      },
      { skipAuth: true }
    )
  }

  static async verifyMagicLink(token: string): Promise<{ success: boolean; sessionToken: string; user: UserInfoDto }> {
    if (MOCK_MODE) {
      console.log('[AUTH-SERVICE] Using MOCK mode for Verify Magic Link')
      const result = await mockApiClient.login('mock@scaffold.com')
      return {
        success: result.success,
        sessionToken: result.sessionToken,
        user: result.user as any,
      }
    }
    return apiClient.post<{ success: boolean; sessionToken: string; user: UserInfoDto }>(
      '/auth/email/callback',
      { token },
      { skipAuth: true }
    )
  }

  static async logout(): Promise<void> {
    if (MOCK_MODE) {
      console.log('[AUTH-SERVICE] Using MOCK mode for Logout')
      await mockApiClient.logout()
      return
    }
    try {
      await apiClient.post<void>('/auth/logout')
    } catch (error) {
      console.warn('Logout API call failed:', error)
    }
  }

  static async getUserInfo(): Promise<UserDTO> {
    if (MOCK_MODE) {
      console.log('[AUTH-SERVICE] Using MOCK mode for getUserInfo')
      return mockApiClient.getUserInfo()
    }
    return apiClient.get<UserDTO>('/auth/me')
  }
}

export const authService = AuthService
