import { apiClient } from '@/lib/api/client/base.client'
import { tokenStore } from '@/lib/stores/token.store'
import type {
  DocumentResponseDto,
  UploadDocumentDto,
  ListDocumentsParams,
  ViewDocumentResponseDto,
} from '@/lib/api/types/document.types'

export class DocumentService {
  static async uploadDocument(
    workspaceId: string,
    data: UploadDocumentDto
  ): Promise<DocumentResponseDto> {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('name', data.name)

    if (data.description) {
      formData.append('description', data.description)
    }

    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag) => {
        formData.append('tags[]', tag)
      })
    }

    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata))
    }

    return apiClient.upload<DocumentResponseDto>(
      `/documents/upload/${workspaceId}`,
      formData
    )
  }

  static async listDocuments(
    workspaceId: string,
    params?: ListDocumentsParams
  ): Promise<DocumentResponseDto[]> {
    const queryParams = new URLSearchParams()
    if (params?.take) queryParams.append('take', params.take.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())

    const queryString = queryParams.toString()
    const endpoint = `/documents/list/${workspaceId}${queryString ? `?${queryString}` : ''}`

    return apiClient.get<DocumentResponseDto[]>(endpoint)
  }

  static async getDocument(
    workspaceId: string,
    documentId: string
  ): Promise<DocumentResponseDto> {
    return apiClient.get<DocumentResponseDto>(
      `/documents/${documentId}/${workspaceId}`
    )
  }

  static async deleteDocument(
    workspaceId: string,
    documentId: string
  ): Promise<void> {
    return apiClient.delete<void>(`/documents/${documentId}/${workspaceId}`)
  }

  static async downloadDocument(
    workspaceId: string,
    documentId: string
  ): Promise<Blob> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''
    const sessionToken = tokenStore.getSessionToken()

    const response = await fetch(
      `${API_BASE_URL}/documents/download/${documentId}/${workspaceId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': API_KEY,
          'x-parse-session-token': sessionToken || '',
        },
      }
    )

    if (response.status === 401) {
      tokenStore.clear()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Token inválido ou expirado')
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.blob()
  }

  static async getDocumentViewUrl(
    workspaceId: string,
    documentId: string
  ): Promise<ViewDocumentResponseDto> {
    return apiClient.get<ViewDocumentResponseDto>(
      `/documents/view/${documentId}/${workspaceId}`
    )
  }
}

export const documentService = DocumentService
