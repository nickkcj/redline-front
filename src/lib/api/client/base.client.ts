import { tokenStore } from '@/lib/store/token.store'
import { ApiError } from '@/lib/api/types'

interface RequestConfig extends RequestInit {
  skipAuth?: boolean
  skipRetry?: boolean
}

class BaseApiClient {
  private readonly baseUrl: string
  private readonly privateKey: string
  private readonly apiVersion: string = 'v1'

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    privateKey: string = process.env.NEXT_PUBLIC_API_KEY || ''
  ) {
    this.baseUrl = `${baseUrl}/${this.apiVersion}`
    this.privateKey = privateKey
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const sessionToken = tokenStore.getSessionToken()
    return sessionToken ? { 'x-parse-session-token': sessionToken } : {}
  }

  private handleUnauthorized(): never {
    console.warn('401 Unauthorized - session invalid, redirecting to login')
    tokenStore.clear()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw {
      message: 'Session inválida ou expirada',
      statusCode: 401,
    } as ApiError
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    if (!response.ok) {
      let errorData: any = {}

      if (isJson) {
        try {
          errorData = await response.json()
        } catch {
          // Ignore parsing errors
        }
      }

      throw {
        message: errorData.message || response.statusText || 'An error occurred',
        code: errorData.code,
        statusCode: response.status,
        details: errorData.details,
      } as ApiError
    }

    return isJson ? response.json() : (response.text() as unknown as T)
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { skipAuth = false, skipRetry = false, ...requestConfig } = config
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`
    const isFormData = requestConfig.body instanceof FormData

    const headers: Record<string, string> = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      'X-API-Key': this.privateKey,
      ...(!skipAuth ? await this.getAuthHeaders() : {}),
      ...(requestConfig.headers as Record<string, string>),
    }

    try {
      const response = await fetch(url, { ...requestConfig, headers })

      if (response.status === 401 && !skipAuth) {
        this.handleUnauthorized()
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        } as ApiError
      }
      throw error
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig & { onProgress?: (progress: number) => void }
  ): Promise<T> {
    const { onProgress, ...requestConfig } = config || {}
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'X-API-Key': this.privateKey,
      ...(!requestConfig.skipAuth ? await this.getAuthHeaders() : {}),
    }

    if (onProgress && typeof XMLHttpRequest !== 'undefined') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress((event.loaded / event.total) * 100)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch {
              resolve(xhr.responseText as unknown as T)
            }
          } else if (xhr.status === 401) {
            this.handleUnauthorized()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))

        xhr.open('POST', url)
        Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value))
        xhr.send(formData)
      })
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (response.status === 401 && !requestConfig.skipAuth) {
        this.handleUnauthorized()
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        } as ApiError
      }
      throw error
    }
  }
}

export const apiClient = new BaseApiClient()
