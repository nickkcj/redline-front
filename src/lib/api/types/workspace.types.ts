import { WorkspaceRole } from './common.types'
import type { WorkspaceMemberResponseDto } from './member.types'

/**
 * POST /workspaces
 * Request para criar workspace
 */
export interface CreateWorkspaceDto {
  name: string
  description?: string
  organizationId: string
}

// ========== UPDATE WORKSPACE ==========

/**
 * PATCH /workspaces/:workspaceId
 * Request para atualizar workspace
 */
export interface UpdateWorkspaceDto {
  name?: string
  description?: string
}

// ========== WORKSPACE RESPONSE ==========

/**
 * Response padrão de workspace
 */
export interface WorkspaceResponseDto {
  id: string
  name: string
  description?: string
  organizationId: string
  members?: WorkspaceMemberResponseDto[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Summary de workspace (usado em listas)
 */
export interface WorkspaceSummaryDto {
  id: string
  name: string
  description?: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

// ========== WORKSPACE LIST ==========

/**
 * GET /workspaces
 * GET /workspaces/organization/:organizationId
 * Response com lista de workspaces
 */
export type WorkspaceListResponse = WorkspaceResponseDto[]

// ========== WORKSPACE INVITES ==========

/**
 * Role completo como retornado em convites pelo backend
 */
export interface WorkspaceInviteRoleDto {
  id: string
  name: string
  displayName: string
  description?: string
}

/**
 * Organization básica como retornada em invites
 */
export interface OrganizationSummaryDto {
  id: string
  name: string
  description?: string
}

/**
 * Workspace completo como retornado em invites
 */
export interface WorkspaceWithOrganizationDto {
  id: string
  name: string
  description?: string
  organization: OrganizationSummaryDto
}

/**
 * POST /workspaces/:workspaceId/invites
 * Request para criar convite por email
 */
export interface CreateWorkspaceInviteDto {
  email: string
  roleId: string
}

/**
 * GET /workspaces/:workspaceId/invites
 * POST /workspaces/:workspaceId/invites
 * Response completa de convite
 */
export interface WorkspaceInviteResponseDto {
  id: string
  email: string
  code: string
  role: WorkspaceInviteRoleDto
  workspace: WorkspaceWithOrganizationDto
  expiresAt: Date
  createdAt: Date
  isUsed: boolean
}

/**
 * DELETE /workspaces/:workspaceId/invites/:inviteId
 * Sem body, retorna 204 No Content
 */

/**
 * POST /workspaces/:workspaceId/members/invites/use
 * Request para usar convite
 */
export interface UseWorkspaceInviteDto {
  code: string
}

/**
 * Lista de convites pendentes do usuário
 */
export type PendingInvitesListResponse = WorkspaceInviteResponseDto[]
