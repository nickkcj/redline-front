import { apiClient } from '@/lib/api/client/base.client';

export interface DocumentResponseDto {
  id: string;
  name: string;
  workspaceId: string;
  userId: string;
  cortexdbRecordId: string;
  cortexdbCollection: string;
  contentType: string;
  sizeBytes: number;
  checksum: string;
  isProcessed: boolean;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UploadDocumentDto {
  file: File;
  name: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ListDocumentsParams {
  take?: number;
  skip?: number;
}

class DocumentService {
  async uploadDocument(
    workspaceId: string,
    data: UploadDocumentDto
  ): Promise<DocumentResponseDto> {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.name);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag) => {
          formData.append('tags[]', tag);
        });
      }
      
      if (data.metadata) {
        formData.append('metadata', JSON.stringify(data.metadata));
      }

      return await apiClient.upload<DocumentResponseDto>(
        `/documents/upload/${workspaceId}`,
        formData
      );
    } catch (error: any) {
      throw error;
    }
  }

  async listDocuments(
    workspaceId: string,
    params?: ListDocumentsParams
  ): Promise<DocumentResponseDto[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.take) queryParams.append('take', params.take.toString());
      if (params?.skip) queryParams.append('skip', params.skip.toString());

      const queryString = queryParams.toString();
      const endpoint = `/documents/list/${workspaceId}${queryString ? `?${queryString}` : ''}`;

      return await apiClient.get<DocumentResponseDto[]>(endpoint);
    } catch (error: any) {
      throw error;
    }
  }

  async getDocument(
    workspaceId: string,
    documentId: string
  ): Promise<DocumentResponseDto> {
    try {
      return await apiClient.get<DocumentResponseDto>(
        `/documents/${documentId}/${workspaceId}`
      );
    } catch (error: any) {
      throw error;
    }
  }

  async deleteDocument(
    workspaceId: string,
    documentId: string
  ): Promise<void> {
    try {
      return await apiClient.delete<void>(`/documents/${documentId}/${workspaceId}`);
    } catch (error: any) {
      throw error;
    }
  }

  async downloadDocument(
    workspaceId: string,
    documentId: string
  ): Promise<Blob> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
      const { tokenStore } = await import('@/lib/auth/stores/auth.store');
      const accessToken = tokenStore.getAccessToken();

      const response = await fetch(
      `${API_BASE_URL}/documents/download/${documentId}/${workspaceId}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': API_KEY,
            'x-parse-session-token': accessToken || '',
          },
        }
      );

      if (response.status === 401) {
        tokenStore.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Token inválido ou expirado');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Obter URL de visualização do documento (presignada)
   */
  async getDocumentViewUrl(
    workspaceId: string,
    documentId: string
  ): Promise<{
    viewUrl: string;
    filename: string;
    mimeType: string;
    expiresAt?: string;
  }> {
    try {
      return await apiClient.get<{
        viewUrl: string;
        filename: string;
        mimeType: string;
        expiresAt?: string;
      }>(`/documents/view/${documentId}/${workspaceId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export const documentService = new DocumentService();

