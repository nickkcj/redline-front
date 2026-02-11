import { apiClient } from '@/lib/api/client/base.client'
import { tokenStore } from '@/lib/stores/token.store'
import type {
  GovernanceChatMessage,
  GovernanceDocumentResponse,
  UploadGovernanceDocumentDto,
  ListGovernanceDocumentsResponse,
  ViewGovernanceDocumentResponse,
  ProjectArtifactResponse,
  UploadProjectArtifactDto,
  ListProjectArtifactsResponse,
  AnalyzeArtifactDto,
  AnalyzeResponse,
  AlertWithRelationsResponse,
  ListAlertsResponse,
  AlertsSummaryResponse,
  AlertResponse,
  UpdateAlertStatusDto,
  QueryGovernanceDocsParams,
  QueryArtifactsParams,
  QueryAlertsParams,
} from '@/lib/api/types/governance.types'

export class GovernanceService {
  // ============================================
  // GOVERNANCE DOCUMENTS
  // ============================================

  static async uploadGovernanceDoc(
    workspaceId: string,
    data: UploadGovernanceDocumentDto
  ): Promise<GovernanceDocumentResponse> {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('title', data.title)
    formData.append('category', data.category)
    if (data.description) {
      formData.append('description', data.description)
    }
    return apiClient.upload<GovernanceDocumentResponse>(
      `/governance-docs/${workspaceId}`,
      formData
    )
  }

  static async listGovernanceDocs(
    workspaceId: string,
    params?: QueryGovernanceDocsParams
  ): Promise<ListGovernanceDocumentsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.take) queryParams.append('take', params.take.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    const qs = queryParams.toString()
    return apiClient.get<ListGovernanceDocumentsResponse>(
      `/governance-docs/${workspaceId}${qs ? `?${qs}` : ''}`
    )
  }

  static async getGovernanceDoc(
    workspaceId: string,
    documentId: string
  ): Promise<GovernanceDocumentResponse> {
    return apiClient.get<GovernanceDocumentResponse>(
      `/governance-docs/${workspaceId}/${documentId}`
    )
  }

  static async getGovernanceDocViewUrl(
    workspaceId: string,
    documentId: string
  ): Promise<ViewGovernanceDocumentResponse> {
    return apiClient.get<ViewGovernanceDocumentResponse>(
      `/governance-docs/${workspaceId}/${documentId}/view`
    )
  }

  static async deleteGovernanceDoc(
    workspaceId: string,
    documentId: string
  ): Promise<void> {
    return apiClient.delete<void>(
      `/governance-docs/${workspaceId}/${documentId}`
    )
  }

  // ============================================
  // PROJECT ARTIFACTS
  // ============================================

  static async uploadArtifact(
    workspaceId: string,
    data: UploadProjectArtifactDto
  ): Promise<ProjectArtifactResponse> {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('title', data.title)
    formData.append('type', data.type)
    if (data.description) {
      formData.append('description', data.description)
    }
    if (data.source) {
      formData.append('source', data.source)
    }
    return apiClient.upload<ProjectArtifactResponse>(
      `/artifacts/${workspaceId}`,
      formData
    )
  }

  static async listArtifacts(
    workspaceId: string,
    params?: QueryArtifactsParams
  ): Promise<ListProjectArtifactsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)
    if (params?.isAnalyzed !== undefined) {
      queryParams.append('isAnalyzed', params.isAnalyzed.toString())
    }
    if (params?.take) queryParams.append('take', params.take.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    const qs = queryParams.toString()
    return apiClient.get<ListProjectArtifactsResponse>(
      `/artifacts/${workspaceId}${qs ? `?${qs}` : ''}`
    )
  }

  static async deleteArtifact(
    workspaceId: string,
    artifactId: string
  ): Promise<void> {
    return apiClient.delete<void>(
      `/artifacts/${workspaceId}/${artifactId}`
    )
  }

  // ============================================
  // ANALYSIS
  // ============================================

  static async analyzeArtifact(
    workspaceId: string,
    dto: AnalyzeArtifactDto
  ): Promise<AnalyzeResponse> {
    return apiClient.post<AnalyzeResponse>(
      `/alerts/analyze/${workspaceId}`,
      dto
    )
  }

  // ============================================
  // ALERTS
  // ============================================

  static async listAlerts(
    workspaceId: string,
    params?: QueryAlertsParams
  ): Promise<ListAlertsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.severity) queryParams.append('severity', params.severity)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.artifactId) queryParams.append('artifactId', params.artifactId)
    if (params?.governanceDocId) queryParams.append('governanceDocId', params.governanceDocId)
    if (params?.take) queryParams.append('take', params.take.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    const qs = queryParams.toString()
    return apiClient.get<ListAlertsResponse>(
      `/alerts/${workspaceId}${qs ? `?${qs}` : ''}`
    )
  }

  static async getAlertsSummary(
    workspaceId: string
  ): Promise<AlertsSummaryResponse> {
    return apiClient.get<AlertsSummaryResponse>(
      `/alerts/${workspaceId}/summary`
    )
  }

  static async getAlert(
    workspaceId: string,
    alertId: string
  ): Promise<AlertWithRelationsResponse> {
    return apiClient.get<AlertWithRelationsResponse>(
      `/alerts/${workspaceId}/${alertId}`
    )
  }

  static async updateAlertStatus(
    workspaceId: string,
    alertId: string,
    dto: UpdateAlertStatusDto
  ): Promise<AlertResponse> {
    return apiClient.patch<AlertResponse>(
      `/alerts/${workspaceId}/${alertId}`,
      dto
    )
  }

  // ============================================
  // GOVERNANCE CHAT (SSE STREAMING)
  // ============================================

  static async streamGovernanceChat(
    workspaceId: string,
    message: string,
    artifactId?: string,
    history?: GovernanceChatMessage[]
  ): Promise<ReadableStream<Uint8Array>> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''
    const sessionToken = tokenStore.getSessionToken()

    const response = await fetch(
      `${API_BASE_URL}/v1/governance-chat/${workspaceId}/stream`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'x-parse-session-token': sessionToken || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, artifactId, history }),
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
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    return response.body
  }
}

export const governanceService = GovernanceService
