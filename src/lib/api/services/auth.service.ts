import { tokenStore } from '@/lib/store/token.store';

interface UserInfoDto {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

class AuthService {
  private isDevelopment = process.env.NODE_ENV === 'development';

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
      const sessionToken = tokenStore.getSessionToken();

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'x-parse-session-token': sessionToken || '',
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


  async getUserInfo(): Promise<UserInfoDto> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
    const sessionToken = tokenStore.getSessionToken();

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'X-API-Key': API_KEY,
        'x-parse-session-token': sessionToken || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        tokenStore.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Token inválido ou expirado');
      }
      throw new Error('Erro ao buscar informações do usuário');
    }

    return response.json();
  }
}

export const authService = new AuthService();