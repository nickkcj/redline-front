import { apiClient } from '@/lib/api/client/base.client'
import { UserDTO, UserInfoDto } from '../types';


export class AuthService {
  private readonly appUrl: string

  constructor(appUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') {
    this.appUrl = appUrl
  }

  static async getGoogleOAuthUrl(callbackUrl: string): Promise<{ authUrl: string }> {
    return apiClient.get<{ authUrl: string }>(
      `/auth/google/init?callback_url=${encodeURIComponent(callbackUrl)}`,
      { skipAuth: true }
    )
  }

  static async googleCallback(code: string, callbackUrl: string): Promise<{ success: boolean; sessionToken: string; user: UserInfoDto }> {
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
    return apiClient.post<{ success: boolean; sessionToken: string; user: UserInfoDto }>(
      '/auth/email/callback',
      { token },
      { skipAuth: true }
    )
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout')
    } catch (error) {
      console.warn('Logout API call failed:', error)
    }
  }

  static async getUserInfo(): Promise<UserDTO> {
    return apiClient.get<UserDTO>('/auth/me')
  }
}

export const authService = AuthService
