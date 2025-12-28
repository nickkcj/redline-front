// ============================================================
// BASE API CLIENT - Cliente HTTP base para todas as requisições
// Alinhado com backend: usa x-parse-session-token header
// Backend NÃO tem refresh token - logout invalida session
// ============================================================

import { tokenStore } from '@/lib/store/token.store'
import { ApiError } from '@/lib/api/types'

interface RequestConfig extends RequestInit {
  skipAuth?: boolean
  skipRetry?: boolean
}

class BaseApiClient {
  private readonly baseUrl: string
  private readonly privateKey: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001', privateKey: string = process.env.NEXT_PUBLIC_API_KEY || '') {
    this.baseUrl = baseUrl
    this.privateKey = privateKey
  }

  /**
   * Retorna headers de autenticação
   * Backend espera: x-parse-session-token
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const sessionToken = tokenStore.getSessionToken()
    const headers: Record<string, string> = {}

    if (sessionToken) {
      headers['x-parse-session-token'] = sessionToken
    }

    return headers
  }

  /**
   * Processa response da API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!response.ok) {
      let errorData: any = {}

      if (isJson) {
        try {
          errorData = await response.json()
        } catch {
          // Ignore JSON parsing errors
        }
      }

      const apiError: ApiError = {
        message: errorData.message || response.statusText || 'An error occurred',
        code: errorData.code,
        statusCode: response.status,
        details: errorData.details,
      }

      throw apiError
    }

    if (isJson) {
      return response.json()
    }

    return response.text() as unknown as T
  }

  /**
   * Request genérico
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, skipRetry = false, ...requestConfig } = config

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

    // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
    const isFormData = requestConfig.body instanceof FormData

    const headers: Record<string, string> = {
      // Only set Content-Type for non-FormData requests
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      'X-API-Key': this.privateKey,
      // Session token only added if not skipping auth
      ...(!skipAuth ? await this.getAuthHeaders() : {}),
      ...(requestConfig.headers as Record<string, string>),
    }

    const requestOptions: RequestInit = {
      ...requestConfig,
      headers,
    }

    try {
      const response = await fetch(url, requestOptions)

      // Handle 401 Unauthorized - Backend NÃO tem refresh, então logout
      if (response.status === 401 && !skipAuth) {
        console.warn('401 Unauthorized - session invalid, redirecting to login')
        tokenStore.clear()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        const responseClone = response.clone()
        const errorData = await responseClone.json().catch(() => ({}))
        throw {
          message: errorData.message || 'Session inválida ou expirada',
          statusCode: 401,
        } as ApiError
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        }
        throw networkError
      }

      throw error
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  /**
   * Upload file (FormData)
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig & {
      onProgress?: (progress: number) => void
    }
  ): Promise<T> {
    const { onProgress, ...requestConfig } = config || {}

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      ...(!requestConfig.skipAuth ? await this.getAuthHeaders() : {}),
    }

    // Don't set Content-Type for FormData, let browser set it
    delete headers['Content-Type']

    // Use XMLHttpRequest for progress tracking
    if (onProgress && typeof XMLHttpRequest !== 'undefined') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            onProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText)
              resolve(result)
            } catch {
              resolve(xhr.responseText as unknown as T)
            }
          } else if (xhr.status === 401) {
            tokenStore.clear()
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            reject(new Error('Session inválida ou expirada'))
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.open('POST', url)

        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })

        xhr.send(formData)
      })
    }

    // Use fetch without progress tracking
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      // Handle 401
      if (response.status === 401 && !requestConfig.skipAuth) {
        tokenStore.clear()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || 'Session inválida ou expirada',
          statusCode: 401,
        } as ApiError
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        }
        throw networkError
      }
      throw error
    }
  }
}

export const apiClient = new BaseApiClient()
