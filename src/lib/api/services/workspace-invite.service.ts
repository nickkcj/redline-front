import { apiClient } from '../client/base.client'
import type {
  CreateWorkspaceInviteDto,
  WorkspaceInviteResponseDto,
  PendingInvitesListResponse,
  UseWorkspaceInviteDto,
} from '../types'
import type { WorkspaceMemberResponseDto } from '../types/member.types'

/**
 * Service para gerenciamento de convites de workspace
 * Baseado em WorkspaceInvitesController e MembersController do backend
 */
export class WorkspaceInviteService {
  /**
   * GET /workspaces/:workspaceId/invites
   * Lista todos os convites de um workspace
   */
  static async list(workspaceId: string): Promise<PendingInvitesListResponse> {
    return apiClient.get<PendingInvitesListResponse>(`/v1/workspaces/${workspaceId}/invites`)
  }

  /**
   * POST /workspaces/:workspaceId/invites
   * Cria um novo convite por email
   */
  static async create(
    workspaceId: string,
    data: CreateWorkspaceInviteDto
  ): Promise<WorkspaceInviteResponseDto> {
    return apiClient.post<WorkspaceInviteResponseDto>(
      `/v1/workspaces/${workspaceId}/invites`,
      data
    )
  }

  /**
   * DELETE /workspaces/:workspaceId/invites/:inviteId
   * Cancela/remove um convite pendente
   */
  static async cancel(workspaceId: string, inviteId: string): Promise<void> {
    return apiClient.delete<void>(`/v1/workspaces/${workspaceId}/invites/${inviteId}`)
  }

  /**
   * POST /workspaces/:workspaceId/members/invites/use
   * Aceita um convite usando o código
   */
  static async use(
    workspaceId: string,
    data: UseWorkspaceInviteDto
  ): Promise<WorkspaceMemberResponseDto> {
    return apiClient.post<WorkspaceMemberResponseDto>(
      `/v1/workspaces/${workspaceId}/members/invites/use`,
      data
    )
  }
}

export const workspaceInviteService = WorkspaceInviteService
