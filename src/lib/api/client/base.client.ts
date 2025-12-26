import { tokenStore } from '@/lib/auth/stores/auth.store';
import { ApiError, TokenData } from '@/lib/auth/types/auth.types';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

class BaseApiClient {
  private readonly baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<TokenData> | null = null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  private getApiKey(): string {
    return process.env.NEXT_PUBLIC_API_KEY || '';
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = tokenStore.getAccessToken();
    const headers: Record<string, string> = {};

    // Session token is required for authenticated endpoints
    // Backend expects: x-parse-session-token header
    if (accessToken) {
      headers['x-parse-session-token'] = accessToken;
    }

    return headers;
  }

  private async refreshTokens(): Promise<TokenData> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
      this.isRefreshing = false;
      tokenStore.clear();
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.request<TokenData>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
      skipRetry: true,
    });

    try {
      const tokens = await this.refreshPromise;
      tokenStore.setTokens(tokens);
      return tokens;
    } catch (error) {
      tokenStore.clear();
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorData: any = {};

      if (isJson) {
        try {
          errorData = await response.json();
        } catch {
          // Ignore JSON parsing errors
        }
      }

      const apiError: ApiError = {
        message: errorData.message || response.statusText || 'An error occurred',
        code: errorData.code,
        statusCode: response.status,
        details: errorData.details,
      };

      throw apiError;
    }

    if (isJson) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, skipRetry = false, ...requestConfig } = config;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // API-KEY is ALWAYS required, even for unauthenticated endpoints
    const apiKey = this.getApiKey();
    
    // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
    const isFormData = requestConfig.body instanceof FormData;
    
    const headers: Record<string, string> = {
      // Only set Content-Type for non-FormData requests
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      // Session token only added if not skipping auth
      ...(!skipAuth ? await this.getAuthHeaders() : {}),
      ...(requestConfig.headers as Record<string, string>),
    };

    const requestOptions: RequestInit = {
      ...requestConfig,
      headers,
      // Não usar credentials: 'include' para evitar envio de cookies
      // Usamos apenas o token do localStorage através do header x-parse-session-token
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && !skipAuth && !skipRetry) {
        const hasRefreshToken = !!tokenStore.getRefreshToken();
        
        if (hasRefreshToken) {
          try {
            await this.refreshTokens();
            // Retry the request with new tokens
            return this.request<T>(endpoint, { ...config, skipRetry: true });
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            console.warn('Token refresh failed, redirecting to login');
            tokenStore.clear();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw refreshError;
          }
        } else {
          // No refresh token available, redirect to login immediately
          console.warn('401 Unauthorized - no refresh token available, redirecting to login');
          tokenStore.clear();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          // Clone response to read error message before redirecting
          const responseClone = response.clone();
          const errorData = await responseClone.json().catch(() => ({}));
          throw {
            message: errorData.message || 'Token inválido ou expirado',
            statusCode: 401,
          } as ApiError;
        }
      }

      // Handle 401 on retry (refresh didn't work)
      if (response.status === 401 && skipRetry) {
        console.warn('401 Unauthorized after retry - redirecting to login');
        tokenStore.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        // Clone response to read error message before redirecting
        const responseClone = response.clone();
        const errorData = await responseClone.json().catch(() => ({}));
        throw {
          message: errorData.message || 'Token inválido ou expirado',
          statusCode: 401,
        } as ApiError;
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        };
        throw networkError;
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig & {
      onProgress?: (progress: number) => void;
    }
  ): Promise<T> {
    const { onProgress, ...requestConfig } = config || {};

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // API-KEY is ALWAYS required
    const apiKey = this.getApiKey();
    const headers: Record<string, string> = {
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      ...(!requestConfig.skipAuth ? await this.getAuthHeaders() : {}),
    };

    // Don't set Content-Type for FormData, let browser set it
    delete headers['Content-Type'];

    if (onProgress && typeof XMLHttpRequest !== 'undefined') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch {
              resolve(xhr.responseText as unknown as T);
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', url);

        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.send(formData);
      });
    }

    // Use fetch directly for FormData to avoid issues with request method
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && !requestConfig.skipAuth) {
        const hasRefreshToken = !!tokenStore.getRefreshToken();
        
        if (hasRefreshToken) {
          try {
            await this.refreshTokens();
            // Retry the request with new tokens
            const retryHeaders = {
              ...headers,
              ...(await this.getAuthHeaders()),
            };
            const retryResponse = await fetch(url, {
              method: 'POST',
              headers: retryHeaders,
              body: formData,
            });
            return this.handleResponse<T>(retryResponse);
          } catch (refreshError) {
            tokenStore.clear();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw refreshError;
          }
        } else {
          tokenStore.clear();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          const errorData = await response.json().catch(() => ({}));
          throw {
            message: errorData.message || 'Token inválido ou expirado',
            statusCode: 401,
          } as ApiError;
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        };
        throw networkError;
      }
      throw error;
    }
  }
}

export const apiClient = new BaseApiClient();