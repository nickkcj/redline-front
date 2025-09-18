import { tokenStore } from '@/lib/auth/stores/auth.store';
import { ApiError, TokenData } from '@/lib/types/auth.types';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

class BaseApiClient {
  private readonly baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<TokenData> | null = null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/v1') {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = tokenStore.getAccessToken();
    if (!accessToken) return {};

    return {
      'Authorization': `Bearer ${accessToken}`,
      'x-google-auth-token': accessToken, // Backend também aceita este header
    };
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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(!skipAuth ? await this.getAuthHeaders() : {}),
      ...(requestConfig.headers as Record<string, string>),
    };

    const requestOptions: RequestInit = {
      ...requestConfig,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && !skipAuth && !skipRetry) {
        try {
          await this.refreshTokens();
          // Retry the request with new tokens
          return this.request<T>(endpoint, { ...config, skipRetry: true });
        } catch (refreshError) {
          // Refresh failed, handle as normal error
          return this.handleResponse<T>(response);
        }
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

    const headers: Record<string, string> = {
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

    return this.request<T>(endpoint, {
      ...requestConfig,
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

export const apiClient = new BaseApiClient();