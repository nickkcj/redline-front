import { useApiQuery, useApiMutation } from './use-api'
import { governanceService } from '@/lib/api/services/governance.service'
import type {
  GovernanceDocumentResponse,
  UploadGovernanceDocumentDto,
  ListGovernanceDocumentsResponse,
  ViewGovernanceDocumentResponse,
  ProjectArtifactResponse,
  UploadProjectArtifactDto,
  ListProjectArtifactsResponse,
  AnalyzeArtifactDto,
  AnalyzeResponse,
  ListAlertsResponse,
  AlertsSummaryResponse,
  AlertWithRelationsResponse,
  AlertResponse,
  UpdateAlertStatusDto,
  QueryGovernanceDocsParams,
  QueryArtifactsParams,
  QueryAlertsParams,
} from '@/lib/api/types/governance.types'

// ============================================
// GOVERNANCE DOCUMENTS
// ============================================

export function useGovernanceDocs(
  workspaceId: string,
  params?: QueryGovernanceDocsParams
) {
  return useApiQuery<ListGovernanceDocumentsResponse>(
    ['governance-docs', workspaceId, JSON.stringify(params || {})],
    () => governanceService.listGovernanceDocs(workspaceId, params),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 5,
    }
  )
}

export function useGovernanceDocViewUrl(
  workspaceId: string,
  documentId: string
) {
  return useApiQuery<ViewGovernanceDocumentResponse>(
    ['governance-docs', workspaceId, documentId, 'view'],
    () => governanceService.getGovernanceDocViewUrl(workspaceId, documentId),
    {
      enabled: !!workspaceId && !!documentId,
      staleTime: 1000 * 60 * 5,
    }
  )
}

export function useUploadGovernanceDoc(workspaceId: string) {
  return useApiMutation<GovernanceDocumentResponse, UploadGovernanceDocumentDto>(
    (data) => governanceService.uploadGovernanceDoc(workspaceId, data),
    {
      successMessage: 'Documento de governança enviado com sucesso!',
      invalidateKeys: [['governance-docs', workspaceId]],
    }
  )
}

export function useDeleteGovernanceDoc(workspaceId: string) {
  return useApiMutation<void, string>(
    (documentId) => governanceService.deleteGovernanceDoc(workspaceId, documentId),
    {
      successMessage: 'Documento excluído com sucesso!',
      invalidateKeys: [['governance-docs', workspaceId]],
    }
  )
}

// ============================================
// PROJECT ARTIFACTS
// ============================================

export function useArtifacts(
  workspaceId: string,
  params?: QueryArtifactsParams
) {
  return useApiQuery<ListProjectArtifactsResponse>(
    ['artifacts', workspaceId, JSON.stringify(params || {})],
    () => governanceService.listArtifacts(workspaceId, params),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 5,
    }
  )
}

export function useUploadArtifact(workspaceId: string) {
  return useApiMutation<ProjectArtifactResponse, UploadProjectArtifactDto>(
    (data) => governanceService.uploadArtifact(workspaceId, data),
    {
      successMessage: 'Artefato enviado com sucesso!',
      invalidateKeys: [['artifacts', workspaceId]],
    }
  )
}

export function useDeleteArtifact(workspaceId: string) {
  return useApiMutation<void, string>(
    (artifactId) => governanceService.deleteArtifact(workspaceId, artifactId),
    {
      successMessage: 'Artefato excluído com sucesso!',
      invalidateKeys: [['artifacts', workspaceId]],
    }
  )
}

// ============================================
// ANALYSIS
// ============================================

export function useAnalyzeArtifact(workspaceId: string) {
  return useApiMutation<AnalyzeResponse, AnalyzeArtifactDto>(
    (dto) => governanceService.analyzeArtifact(workspaceId, dto),
    {
      successMessage: 'Análise concluída!',
      invalidateKeys: [
        ['alerts', workspaceId],
        ['alerts-summary', workspaceId],
        ['artifacts', workspaceId],
      ],
    }
  )
}

// ============================================
// ALERTS
// ============================================

export function useAlerts(
  workspaceId: string,
  params?: QueryAlertsParams
) {
  return useApiQuery<ListAlertsResponse>(
    ['alerts', workspaceId, JSON.stringify(params || {})],
    () => governanceService.listAlerts(workspaceId, params),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 2,
    }
  )
}

export function useAlertsSummary(workspaceId: string) {
  return useApiQuery<AlertsSummaryResponse>(
    ['alerts-summary', workspaceId],
    () => governanceService.getAlertsSummary(workspaceId),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 2,
    }
  )
}

export function useAlert(workspaceId: string, alertId: string) {
  return useApiQuery<AlertWithRelationsResponse>(
    ['alerts', workspaceId, alertId],
    () => governanceService.getAlert(workspaceId, alertId),
    {
      enabled: !!workspaceId && !!alertId,
      staleTime: 1000 * 60 * 5,
    }
  )
}

export function useUpdateAlertStatus(workspaceId: string) {
  return useApiMutation<AlertResponse, { alertId: string; dto: UpdateAlertStatusDto }>(
    ({ alertId, dto }) => governanceService.updateAlertStatus(workspaceId, alertId, dto),
    {
      successMessage: 'Alerta atualizado!',
      invalidateKeys: [
        ['alerts', workspaceId],
        ['alerts-summary', workspaceId],
      ],
    }
  )
}
