/**
 * Audit Log Hooks
 *
 * Hooks for viewing audit logs in a workspace
 * Uses React Query for caching and automatic invalidation
 *
 * IMPORTANTE:
 * - Requer autenticação (x-parse-session-token)
 * - Requer permissão "audit.read.all" (apenas ADMIN por padrão)
 * - Apenas operações de leitura (GET) - logs são criados automaticamente no backend
 */

import { useApiQuery } from './use-api'
import { auditLogService } from '@/lib/api/services/audit-log.service'
import type {
  AuditLog,
  GetAuditLogsParams,
  GetAuditLogsResponse,
} from '@/lib/api/types/audit-log.types'

// ============================================================================
// Audit Log Queries
// ============================================================================

/**
 * Lista audit logs de um workspace com filtros e paginação
 *
 * @param workspaceId - ID do workspace
 * @param params - Filtros opcionais (memberId, startDate, endDate, page, limit)
 * @returns Query result com lista paginada de audit logs
 *
 * @example
 * // Listar todos (primeira página, 20 itens)
 * const { data, isLoading } = useAuditLogs('workspace-123')
 *
 * @example
 * // Listar com filtros
 * const { data, isLoading } = useAuditLogs('workspace-123', {
 *   memberId: 'member-456',
 *   startDate: '2024-01-01T00:00:00Z',
 *   endDate: '2024-12-31T23:59:59Z',
 *   page: 1,
 *   limit: 50
 * })
 *
 * @example
 * // Acessar dados de paginação
 * const { data } = useAuditLogs('workspace-123')
 * console.log(data?.pagination.total) // Total de logs
 * console.log(data?.pagination.totalPages) // Total de páginas
 *
 * @example
 * // Paginação controlada
 * const [page, setPage] = useState(1)
 * const { data } = useAuditLogs('workspace-123', { page, limit: 20 })
 */
export function useAuditLogs(
  workspaceId: string,
  params?: GetAuditLogsParams
) {
  // Serializa params para query key (evita refetch desnecessários)
  const paramsKey = params
    ? JSON.stringify({
        memberId: params.memberId,
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page,
        limit: params.limit,
      })
    : 'default'

  return useApiQuery<GetAuditLogsResponse>(
    ['audit-logs', workspaceId, paramsKey],
    () => auditLogService.list(workspaceId, params),
    {
      enabled: !!workspaceId,
      staleTime: 1000 * 60 * 2, // 2 minutes (logs mudam frequentemente)
      gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
}

/**
 * Busca um audit log específico por ID
 *
 * @param workspaceId - ID do workspace
 * @param auditLogId - ID do audit log
 * @returns Query result com o audit log
 *
 * @example
 * const { data: auditLog, isLoading } = useAuditLog('workspace-123', 'log-456')
 * console.log(auditLog?.metadata.method) // "POST"
 * console.log(auditLog?.member.user.email) // "user@example.com"
 *
 * @example
 * // Com enable condicional
 * const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
 * const { data } = useAuditLog('workspace-123', selectedLogId || '', {
 *   enabled: !!selectedLogId
 * })
 */
export function useAuditLog(
  workspaceId: string,
  auditLogId: string,
  options?: {
    enabled?: boolean
  }
) {
  return useApiQuery<AuditLog>(
    ['audit-log', workspaceId, auditLogId],
    () => auditLogService.getById(workspaceId, auditLogId),
    {
      enabled: options?.enabled !== undefined
        ? options.enabled && !!workspaceId && !!auditLogId
        : !!workspaceId && !!auditLogId,
      staleTime: 1000 * 60 * 5, // 5 minutes (log individual muda raramente)
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    }
  )
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook para listar logs de um membro específico
 *
 * @param workspaceId - ID do workspace
 * @param memberId - ID do membro
 * @param params - Parâmetros adicionais (page, limit, dates)
 * @returns Query result com logs do membro
 *
 * @example
 * const { data } = useAuditLogsByMember('workspace-123', 'member-456', {
 *   page: 1,
 *   limit: 20
 * })
 */
export function useAuditLogsByMember(
  workspaceId: string,
  memberId: string,
  params?: Omit<GetAuditLogsParams, 'memberId'>
) {
  return useAuditLogs(workspaceId, {
    ...params,
    memberId,
  })
}

/**
 * Hook para listar logs em um período específico
 *
 * @param workspaceId - ID do workspace
 * @param startDate - Data inicial (ISO 8601)
 * @param endDate - Data final (ISO 8601)
 * @param params - Parâmetros adicionais (page, limit, memberId)
 * @returns Query result com logs do período
 *
 * @example
 * const { data } = useAuditLogsByDateRange(
 *   'workspace-123',
 *   '2024-01-01T00:00:00Z',
 *   '2024-12-31T23:59:59Z',
 *   { page: 1, limit: 50 }
 * )
 */
export function useAuditLogsByDateRange(
  workspaceId: string,
  startDate: string,
  endDate: string,
  params?: Omit<GetAuditLogsParams, 'startDate' | 'endDate'>
) {
  return useAuditLogs(workspaceId, {
    ...params,
    startDate,
    endDate,
  })
}
