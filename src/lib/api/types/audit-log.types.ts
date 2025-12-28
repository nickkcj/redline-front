// ============================================================
// AUDIT LOG TYPES - Alinhado com audit-logs.controller.ts do backend
// ============================================================

import { WorkspaceMemberResponseDto } from './member.types'
import { PaginatedResponse } from './common.types'

// ========== AUDIT LOG METADATA ==========

/**
 * Metadata armazenado no campo JSON do AuditLog
 * Capturado automaticamente pelo AuditLogInterceptor
 */
export interface AuditLogMetadata {
  method: string // HTTP method (GET, POST, PUT, DELETE, etc)
  path: string // Route path (ex: /workspaces/:workspaceId/chats)
  params: Record<string, any> // Route params (ex: { workspaceId: "xxx" })
  query: Record<string, any> // Query params
  body: Record<string, any> // Request body (sensitive fields are [REDACTED])
  userId: string // ID do user que fez a requisição
  userEmail: string // Email do user
  workspaceId: string // ID do workspace
  timestamp: string // ISO timestamp da ação
  error?: {
    // Se houve erro na requisição
    message: string
    statusCode: number
  }
}

// ========== AUDIT LOG ==========

/**
 * Audit Log entity
 * Representa uma ação auditada no sistema
 */
export interface AuditLog {
  id: string
  memberId: string
  metadata: AuditLogMetadata
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  member: WorkspaceMemberResponseDto // Include completo do member + user
}

// ========== GET AUDIT LOGS ==========

/**
 * GET /workspaces/:workspaceId/audit-logs
 * Query params para filtros e paginação
 */
export interface GetAuditLogsParams {
  memberId?: string // Filtrar por membro específico (UUID)
  startDate?: string // Data inicial ISO 8601 (ex: "2024-01-01T00:00:00Z")
  endDate?: string // Data final ISO 8601 (ex: "2024-12-31T23:59:59Z")
  page?: number // Número da página (min: 1, default: 1)
  limit?: number // Itens por página (min: 1, max: 100, default: 20)
}

/**
 * Response de listagem de audit logs
 * Usa PaginatedResponse para consistência
 */
export type GetAuditLogsResponse = PaginatedResponse<AuditLog>

// ========== GET AUDIT LOG BY ID ==========

/**
 * GET /workspaces/:workspaceId/audit-logs/:id
 * Response de audit log único
 */
export interface GetAuditLogByIdResponse {
  data: AuditLog
}

// ========== HELPERS ==========

/**
 * Helper types para facilitar uso nos componentes
 */

// HTTP Methods comuns em audit logs
export type AuditLogHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Status de erro comuns
export type AuditLogErrorStatus = 400 | 401 | 403 | 404 | 500

// Helper para formatar ações de forma legível
export interface AuditLogAction {
  method: AuditLogHttpMethod
  resource: string // Ex: "chat", "document", "member"
  action: string // Ex: "create", "update", "delete", "read"
  description: string // Ex: "Created new chat"
}

/**
 * Parser helper para extrair informação útil do metadata
 * @param metadata AuditLogMetadata
 * @returns AuditLogAction
 */
export function parseAuditLogAction(metadata: AuditLogMetadata): AuditLogAction {
  const { method, path } = metadata

  // Extrai recurso do path (ex: /workspaces/:id/chats -> "chats")
  const pathParts = path.split('/').filter(Boolean)
  const resource = pathParts[pathParts.length - 1] || 'unknown'

  // Mapeia method para action
  const actionMap: Record<string, string> = {
    GET: 'read',
    POST: 'create',
    PUT: 'update',
    PATCH: 'update',
    DELETE: 'delete',
  }

  const action = actionMap[method] || 'unknown'

  // Gera descrição
  const description = `${method} ${path}`

  return {
    method: method as AuditLogHttpMethod,
    resource,
    action,
    description,
  }
}
