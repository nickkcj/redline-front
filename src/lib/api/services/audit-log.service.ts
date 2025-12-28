import { apiClient } from '@/lib/api/client/base.client'
import type {
  AuditLog,
  GetAuditLogsParams,
  GetAuditLogsResponse,
} from '@/lib/api/types/audit-log.types'

/**
 * Audit Log Service
 * Handles all API calls related to audit logs
 *
 * IMPORTANTE:
 * - Requer autenticação (x-parse-session-token)
 * - Requer permissão "audit.read.all" (apenas ADMIN por padrão)
 * - Apenas operações de leitura (GET)
 * - Logs são criados automaticamente pelo AuditLogInterceptor no backend
 */
export class AuditLogService {
  /**
   * Lista audit logs de um workspace com filtros e paginação
   *
   * GET /workspaces/:workspaceId/audit-logs
   *
   * @param workspaceId - ID do workspace
   * @param params - Filtros e paginação (opcional)
   * @returns Promise com lista paginada de audit logs
   *
   * @example
   * ```ts
   * // Listar todos (primeira página)
   * const response = await AuditLogService.list('workspace-123')
   *
   * // Listar com filtros
   * const response = await AuditLogService.list('workspace-123', {
   *   memberId: 'member-456',
   *   startDate: '2024-01-01T00:00:00Z',
   *   endDate: '2024-12-31T23:59:59Z',
   *   page: 1,
   *   limit: 50
   * })
   * ```
   */
  static async list(
    workspaceId: string,
    params?: GetAuditLogsParams
  ): Promise<GetAuditLogsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.memberId) {
      queryParams.append('memberId', params.memberId)
    }

    if (params?.startDate) {
      queryParams.append('startDate', params.startDate)
    }

    if (params?.endDate) {
      queryParams.append('endDate', params.endDate)
    }

    if (params?.page) {
      queryParams.append('page', params.page.toString())
    }

    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }

    const queryString = queryParams.toString()
    const endpoint = `/workspaces/${workspaceId}/audit-logs${queryString ? `?${queryString}` : ''}`

    return apiClient.get<GetAuditLogsResponse>(endpoint)
  }

  /**
   * Busca um audit log específico por ID
   *
   * GET /workspaces/:workspaceId/audit-logs/:id
   *
   * @param workspaceId - ID do workspace
   * @param auditLogId - ID do audit log
   * @returns Promise com o audit log
   *
   * @example
   * ```ts
   * const auditLog = await AuditLogService.getById('workspace-123', 'log-456')
   * console.log(auditLog.metadata.method) // "POST"
   * console.log(auditLog.member.user.email) // "user@example.com"
   * ```
   */
  static async getById(
    workspaceId: string,
    auditLogId: string
  ): Promise<AuditLog> {
    return apiClient.get<AuditLog>(
      `/workspaces/${workspaceId}/audit-logs/${auditLogId}`
    )
  }
}

export const auditLogService = AuditLogService
