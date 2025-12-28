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
 * POST /workspace/:workspaceId/invites
 * Request para criar convite
 */
export interface CreateWorkspaceInviteRequestDto {
  role?: WorkspaceRole
}

/**
 * Response de criar convite
 */
export interface WorkspaceInviteLinkResponseDto {
  code: string
  inviteLink: string
  expiresAt: string
  role: WorkspaceRole
}

/**
 * POST /workspace/:workspaceId/invites/use
 * Request para usar convite
 */
export interface UseWorkspaceInviteRequestDto {
  code: string
}
