// ============================================================
// MEMBER TYPES - Alinhado com member.controller.ts do backend
// ============================================================

import { WorkspaceRole } from './common.types'

// ========== WORKSPACE MEMBER ==========

export interface WorkspaceMemberResponseDto {
  id: string
  userId: string
  workspaceId: string
  role: WorkspaceRole
  joinedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

// ========== GET MEMBERS ==========

/**
 * GET /workspaces/:workspaceId/members
 * Query params
 */
export interface GetMembersQueryDto {
  role?: WorkspaceRole
  limit?: number
  offset?: number
}

/**
 * Response de listagem de membros
 */
export interface MembersListResponseDto {
  members: WorkspaceMemberResponseDto[]
  total: number
  count: number
  offset: number
}

// ========== WORKSPACE INVITE ==========

/**
 * POST /workspaces/:workspaceId/members/invites
 * Request para criar convite
 */
export interface CreateInviteRequestDto {
  role: WorkspaceRole
}

/**
 * Response de criação de convite
 */
export interface InviteLinkResponseDto {
  id: string
  workspaceId: string
  code: string
  role: WorkspaceRole
  createdBy: string
  expiresAt: Date
  usedAt?: Date
  usedBy?: string
  createdAt: Date
}

/**
 * POST /workspaces/:workspaceId/members/invites/use
 * Request para usar convite
 */
export interface UseInviteRequestDto {
  code: string
}

// ========== UPDATE MEMBER ROLE ==========

/**
 * PATCH /workspaces/:workspaceId/members/:memberId/role
 * Request para atualizar role do membro
 */
export interface UpdateMemberRoleRequestDto {
  role: WorkspaceRole
}

// ========== MEMBER ERROR ==========

export interface MemberErrorResponseDto {
  message: string
  error: string
  statusCode: number
}
